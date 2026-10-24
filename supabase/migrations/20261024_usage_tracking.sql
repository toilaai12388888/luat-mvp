-- Bộ đếm sử dụng ẩn danh cho Luật Lẹ
-- Mỗi dòng = 1 trình duyệt (device_id ngẫu nhiên) trong 1 ngày giờ Việt Nam.
-- Không lưu tên, email, IP. Không ai đọc được bảng này từ app (RLS bật, không có policy);
-- chỉ xem được trong Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.usage_daily (
  device_id UUID NOT NULL,
  day DATE NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visits INT NOT NULL DEFAULT 0,
  lessons INT NOT NULL DEFAULT 0,
  questions INT NOT NULL DEFAULT 0,
  daily_done BOOLEAN NOT NULL DEFAULT false,
  ref TEXT,
  landing TEXT,
  PRIMARY KEY (device_id, day)
);

CREATE INDEX IF NOT EXISTS usage_daily_day_idx ON public.usage_daily (day);

ALTER TABLE public.usage_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.usage_daily FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_usage(
  p_device UUID,
  p_event TEXT,
  p_n INT DEFAULT 0,
  p_ref TEXT DEFAULT NULL,
  p_path TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_day DATE := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  v_n INT := GREATEST(0, LEAST(COALESCE(p_n, 0), 100));
BEGIN
  IF p_device IS NULL OR p_event NOT IN ('visit', 'lesson', 'daily') THEN
    RETURN;
  END IF;

  INSERT INTO usage_daily AS u (device_id, day, visits, lessons, questions, daily_done, ref, landing)
  VALUES (
    p_device, v_day,
    CASE WHEN p_event = 'visit' THEN 1 ELSE 0 END,
    CASE WHEN p_event IN ('lesson', 'daily') THEN 1 ELSE 0 END,
    v_n,
    p_event = 'daily',
    LEFT(p_ref, 100),
    LEFT(p_path, 100)
  )
  ON CONFLICT (device_id, day) DO UPDATE SET
    visits = LEAST(u.visits + CASE WHEN p_event = 'visit' THEN 1 ELSE 0 END, 50),
    lessons = LEAST(u.lessons + CASE WHEN p_event IN ('lesson', 'daily') THEN 1 ELSE 0 END, 200),
    questions = LEAST(u.questions + v_n, 3000),
    daily_done = u.daily_done OR p_event = 'daily',
    ref = COALESCE(u.ref, LEFT(p_ref, 100)),
    landing = COALESCE(u.landing, LEFT(p_path, 100)),
    last_seen_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.track_usage(UUID, TEXT, INT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_usage(UUID, TEXT, INT, TEXT, TEXT) TO anon, authenticated;
