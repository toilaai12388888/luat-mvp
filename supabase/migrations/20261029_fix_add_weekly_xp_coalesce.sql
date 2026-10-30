-- ========================================================
-- Sửa triệt để hàm public.add_weekly_xp:
-- 1. Tự động đảm bảo tồn tại bản ghi trong public.players
--    để không bao giờ bị lỗi foreign key weekly_xp_player_id_fkey
--    khi người dùng ẩn danh chưa kịp lưu nickname.
-- 2. Thêm khóa dòng SELECT ... FOR UPDATE trên bảng players để
--    ngăn chặn triệt để race condition khi có 2 request đồng thời.
-- 3. Xử lý trường hợp người dùng chưa có dòng trong weekly_xp
--    bằng scalar subquery kết hợp COALESCE đảm bảo không bị NULL.
-- 4. Giữ trần 5000 XP/tuần với LEAST(5000, ...).
-- 5. Giữ xác thực auth.uid(), delta 1-15 và giãn cách 2 giây.
-- ========================================================

CREATE OR REPLACE FUNCTION public.add_weekly_xp(delta INT)
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
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF delta < 1 OR delta > 15 THEN
    RAISE EXCEPTION 'Invalid XP delta: must be between 1 and 15';
  END IF;

  -- Đảm bảo có dòng trong players cho caller_id trước khi khóa dòng và gán khóa ngoại
  INSERT INTO public.players (id, nickname, school)
  VALUES (caller_id, 'Ẩn danh', 'Khác')
  ON CONFLICT (id) DO NOTHING;

  -- Khóa dòng players theo caller_id để chống race condition khi gọi đồng thời
  SELECT last_xp_at INTO last_time FROM public.players WHERE id = caller_id FOR UPDATE;
  IF last_time IS NOT NULL AND (now_time - last_time) < interval '2 seconds' THEN
    RAISE EXCEPTION 'Rate limited: please wait 2 seconds between XP updates';
  END IF;

  target_week := (date_trunc('week', now_time))::DATE;

  -- Dùng scalar subquery với COALESCE để đảm bảo luôn trả về 0 nếu chưa có bản ghi
  SELECT COALESCE((
    SELECT xp FROM public.weekly_xp WHERE player_id = caller_id AND week_start = target_week
  ), 0) INTO current_xp;
  current_xp := COALESCE(current_xp, 0);

  IF (current_xp + delta) > 5000 THEN
    applied_delta := GREATEST(0, 5000 - current_xp);
  ELSE
    applied_delta := delta;
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
    'new_xp', LEAST(5000, current_xp + applied_delta)
  );
END;
$$;
