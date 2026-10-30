-- ========================================================
-- Migration: Chống cộng trùng XP (Idempotency) & Cơ chế loại tài khoản nội bộ khỏi BXH
-- Ngày tạo: 30/10/2026
-- ========================================================

-- 1. BẢNG SESSION_REWARDS: Lưu vết các lần hoàn thành để chống cộng trùng phía server
CREATE TABLE IF NOT EXISTS public.session_rewards (
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  xp INT NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (player_id, session_key)
);

ALTER TABLE public.session_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own session_rewards" ON public.session_rewards;
CREATE POLICY "Users can read own session_rewards" ON public.session_rewards
  FOR SELECT USING (auth.uid() = player_id);

-- 2. CỘT IS_INTERNAL TRÊN PLAYERS: Đánh dấu tài khoản nội bộ/QA do quản trị kiểm soát
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT false;

-- 3. HÀM QUẢN TRỊ ĐÁNH DẤU TÀI KHOẢN NỘI BỘ
CREATE OR REPLACE FUNCTION public.set_player_internal(p_player_id UUID, p_is_internal BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.players (id, nickname, school, is_internal)
  VALUES (p_player_id, 'Ẩn danh', 'Khác', p_is_internal)
  ON CONFLICT (id) DO UPDATE SET is_internal = p_is_internal;
  RETURN jsonb_build_object('success', true, 'player_id', p_player_id, 'is_internal', p_is_internal);
END;
$$;

-- 4. HÀM ADD_WEEKLY_XP HỖ TRỢ IDEMPOTENCY KEY (P_SESSION_KEY)
CREATE OR REPLACE FUNCTION public.add_weekly_xp(delta INT, p_session_key TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID := auth.uid();
  now_time TIMESTAMPTZ := timezone('utc'::text, now());
  last_time TIMESTAMPTZ;
  target_week DATE;
  current_xp INT := 0;
  applied_delta INT := 0;
  v_clean_key TEXT := NULL;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF delta < 1 OR delta > 15 THEN
    RAISE EXCEPTION 'Invalid XP delta: must be between 1 and 15';
  END IF;

  -- Đảm bảo có dòng trong players cho caller_id trước khi khóa dòng
  INSERT INTO public.players (id, nickname, school)
  VALUES (caller_id, 'Ẩn danh', 'Khác')
  ON CONFLICT (id) DO NOTHING;

  -- Khóa dòng players theo caller_id để đảm bảo tuần tự hóa và chống race condition
  SELECT last_xp_at INTO last_time FROM public.players WHERE id = caller_id FOR UPDATE;

  target_week := (date_trunc('week', now_time))::DATE;

  SELECT COALESCE((
    SELECT xp FROM public.weekly_xp WHERE player_id = caller_id AND week_start = target_week
  ), 0) INTO current_xp;
  current_xp := COALESCE(current_xp, 0);

  -- KIỂM TRA CHỐNG CỘNG TRÙNG BẰNG P_SESSION_KEY
  IF p_session_key IS NOT NULL THEN
    v_clean_key := trim(p_session_key);
    IF v_clean_key != '' THEN
      IF EXISTS (
        SELECT 1 FROM public.session_rewards
        WHERE player_id = caller_id AND session_key = v_clean_key
      ) THEN
        -- Đã được ghi nhận trước đó (idempotent replay):
        -- Trả về thành công và giá trị XP hiện tại, KHÔNG cộng thêm điểm và KHÔNG kích hoạt rate limit
        RETURN jsonb_build_object(
          'success', true,
          'delta', 0,
          'new_xp', current_xp,
          'already_awarded', true
        );
      END IF;
    END IF;
  END IF;

  -- Giãn cách 2 giây giữa các lần cộng điểm mới
  IF last_time IS NOT NULL AND (now_time - last_time) < interval '2 seconds' THEN
    RAISE EXCEPTION 'Rate limited: please wait 2 seconds between XP updates';
  END IF;

  -- Kiểm tra trần 5000 XP/tuần
  IF (current_xp + delta) > 5000 THEN
    applied_delta := GREATEST(0, 5000 - current_xp);
  ELSE
    applied_delta := delta;
  END IF;

  -- Ghi nhận session_key vào cùng giao dịch với weekly_xp
  IF v_clean_key IS NOT NULL AND v_clean_key != '' THEN
    INSERT INTO public.session_rewards (player_id, session_key, xp)
    VALUES (caller_id, v_clean_key, applied_delta)
    ON CONFLICT (player_id, session_key) DO NOTHING;
  END IF;

  IF applied_delta > 0 THEN
    INSERT INTO public.weekly_xp(player_id, week_start, xp)
    VALUES (caller_id, target_week, current_xp + applied_delta)
    ON CONFLICT (player_id, week_start)
    DO UPDATE SET xp = LEAST(5000, weekly_xp.xp + applied_delta);
  END IF;

  UPDATE public.players SET last_xp_at = now_time WHERE id = caller_id;

  RETURN jsonb_build_object(
    'success', true,
    'delta', applied_delta,
    'new_xp', LEAST(5000, current_xp + applied_delta),
    'already_awarded', false
  );
END;
$$;
