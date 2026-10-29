-- ========================================================
-- Sửa lỗi COALESCE trong hàm add_weekly_xp khi người dùng
-- chưa có dòng nào trong weekly_xp ở tuần mới.
-- Trong PL/pgSQL, SELECT ... INTO trả về 0 rows sẽ gán NULL,
-- cần bổ sung: current_xp := COALESCE(current_xp, 0);
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

  SELECT last_xp_at INTO last_time FROM players WHERE id = caller_id;
  IF last_time IS NOT NULL AND (now_time - last_time) < interval '2 seconds' THEN
    RAISE EXCEPTION 'Rate limited: please wait 2 seconds between XP updates';
  END IF;

  target_week := (date_trunc('week', now_time))::DATE;

  SELECT xp INTO current_xp
  FROM weekly_xp
  WHERE player_id = caller_id AND week_start = target_week;

  -- Đảm bảo current_xp là 0 nếu chưa có bản ghi trong tuần
  current_xp := COALESCE(current_xp, 0);

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
