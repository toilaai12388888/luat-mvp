-- Migration: Phase 2 Schema for Luat Le
-- Date: 2026-10-20
-- Covers: Comment reports & security, Anti-cheat weekly XP RPC, Push subscriptions, Item reports, Question contributions, AI usage tracking

-- ========================================================
-- 1. BÌNH LUẬN & BÁO CÁO BÌNH LUẬN
-- ========================================================
CREATE TABLE IF NOT EXISTS public.comment_reports (
  comment_id BIGINT REFERENCES public.comments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (comment_id, player_id)
);

ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- Xóa policy mở toang trước đó
DROP POLICY IF EXISTS "Users can update reports on comments" ON public.comments;

-- Cho phép người viết tự xóa bình luận của mình
DROP POLICY IF EXISTS "Users can delete their own comment" ON public.comments;
CREATE POLICY "Users can delete their own comment" ON public.comments
  FOR DELETE USING (auth.uid() = player_id);

-- Hàm RPC report_comment SECURITY DEFINER: mỗi người chỉ báo 1 lần, đạt 3 báo cáo thì tự ẩn
CREATE OR REPLACE FUNCTION public.report_comment(target_comment_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID := auth.uid();
  already_reported BOOLEAN;
  new_count INT;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM comment_reports
    WHERE comment_id = target_comment_id AND player_id = caller_id
  ) INTO already_reported;

  IF already_reported THEN
    RETURN jsonb_build_object('success', false, 'message', 'already_reported');
  END IF;

  INSERT INTO comment_reports(comment_id, player_id)
  VALUES (target_comment_id, caller_id);

  UPDATE comments
  SET reports = reports + 1,
      hidden = CASE WHEN (reports + 1) >= 3 THEN true ELSE hidden END
  WHERE id = target_comment_id
  RETURNING reports INTO new_count;

  RETURN jsonb_build_object('success', true, 'reports', new_count);
END;
$$;

-- ========================================================
-- 2. CHỐNG GIAN LẬN XP
-- ========================================================
-- Bỏ quyền INSERT/UPDATE trực tiếp trên weekly_xp (chỉ SELECT)
DROP POLICY IF EXISTS "Users can manage their own weekly_xp" ON public.weekly_xp;

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS last_xp_at TIMESTAMPTZ;

-- Hàm add_weekly_xp SECURITY DEFINER: 1 <= delta <= 15, tối đa 1 lần / 2 giây, tuần tối đa 5000
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

  SELECT last_xp_at INTO last_time FROM players WHERE id = caller_id;
  IF last_time IS NOT NULL AND (now_time - last_time) < interval '2 seconds' THEN
    RAISE EXCEPTION 'Rate limited: please wait 2 seconds between XP updates';
  END IF;

  target_week := (date_trunc('week', now_time))::DATE;

  SELECT COALESCE(xp, 0) INTO current_xp
  FROM weekly_xp
  WHERE player_id = caller_id AND week_start = target_week;

  IF (current_xp + delta) > 5000 THEN
    applied_delta := GREATEST(0, 5000 - current_xp);
  ELSE
    applied_delta := delta;
  END IF;

  IF applied_delta > 0 THEN
    INSERT INTO weekly_xp(player_id, week_start, xp)
    VALUES (caller_id, target_week, current_xp + applied_delta)
    ON CONFLICT (player_id, week_start)
    DO UPDATE SET xp = weekly_xp.xp + applied_delta;
  END IF;

  UPDATE players SET last_xp_at = now_time WHERE id = caller_id;

  RETURN jsonb_build_object('success', true, 'delta', applied_delta, 'new_xp', current_xp + applied_delta);
END;
$$;

-- ========================================================
-- 3. NHẮC HỌC THẬT (WEB PUSH SUBSCRIPTIONS)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  last_active_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = player_id) WITH CHECK (auth.uid() = player_id);

-- ========================================================
-- 4. BÁO SAI TRONG APP (ITEM REPORTS)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.item_reports (
  id BIGSERIAL PRIMARY KEY,
  item_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  note TEXT,
  player_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.item_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert item report" ON public.item_reports;
CREATE POLICY "Anyone can insert item report" ON public.item_reports
  FOR INSERT WITH CHECK (true);

-- Không ai đọc trực tiếp từ client, chỉ server/admin đọc

-- ========================================================
-- 5. ĐÓNG GÓP CÂU HỎI (CONTRIBUTIONS)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.contributions (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own or approved contributions" ON public.contributions;
CREATE POLICY "Users can view own or approved contributions" ON public.contributions
  FOR SELECT USING (auth.uid() = player_id OR status = 'approved');

DROP POLICY IF EXISTS "Users can insert their own contributions" ON public.contributions;
CREATE POLICY "Users can insert their own contributions" ON public.contributions
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- ========================================================
-- 6. HỎI AI - GIỚI HẠN 5 LẦN/NGÀY (AI USAGE)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.ai_usage (
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, day)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ai usage" ON public.ai_usage;
CREATE POLICY "Users can view own ai usage" ON public.ai_usage
  FOR SELECT USING (auth.uid() = player_id);
