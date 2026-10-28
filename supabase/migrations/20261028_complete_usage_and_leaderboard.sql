-- ==============================================================================
-- Migration: Complete Usage Tracking, 5-Min Activity Heartbeat & Analytics
-- Date: 2026-10-28
-- Project: Luat Le (zolxwrrhdwssuqlcnkkr)
-- Safe, idempotent, non-destructive migration
-- ==============================================================================

-- 1. BẢNG USAGE_DAILY (BỘ ĐẾM SỬ DỤNG ẨN DANH THEO NGÀY)
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
  is_internal BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (device_id, day)
);

-- Bổ sung cột is_internal nếu bảng đã tồn tại từ trước
ALTER TABLE public.usage_daily ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS usage_daily_day_idx ON public.usage_daily (day);
CREATE INDEX IF NOT EXISTS usage_daily_device_idx ON public.usage_daily (device_id);

ALTER TABLE public.usage_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.usage_daily FROM anon, authenticated;


-- 2. BẢNG INTERNAL_DEVICES (DANH SÁCH THIẾT BỊ NỘI BỘ / KIỂM THỬ)
CREATE TABLE IF NOT EXISTS public.internal_devices (
  device_id UUID PRIMARY KEY,
  label TEXT NOT NULL DEFAULT 'Thiết bị nội bộ / QA',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.internal_devices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.internal_devices FROM anon, authenticated;


-- 3. BẢNG ACTIVE_DEVICES (ƯỚC TÍNH HOẠT ĐỘNG GẦN ĐÂY TRONG 5 PHÚT)
CREATE TABLE IF NOT EXISTS public.active_devices (
  device_id UUID PRIMARY KEY,
  last_ping TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_internal BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS active_devices_last_ping_idx ON public.active_devices (last_ping);

ALTER TABLE public.active_devices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.active_devices FROM anon, authenticated;


-- 4. HÀM RPC TRACK_USAGE (GHI NHẬN LƯỢT VÀO, HỌC, THỬ THÁCH, HEARTBEAT)
CREATE OR REPLACE FUNCTION public.track_usage(
  p_device UUID,
  p_event TEXT,
  p_n INT DEFAULT 0,
  p_ref TEXT DEFAULT NULL,
  p_path TEXT DEFAULT NULL,
  p_is_internal BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_day DATE := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  v_n INT := GREATEST(0, LEAST(COALESCE(p_n, 0), 100));
  v_internal BOOLEAN := false;
BEGIN
  IF p_device IS NULL OR p_event NOT IN ('visit', 'lesson', 'daily', 'ping') THEN
    RETURN;
  END IF;

  -- Kiểm tra thiết bị có thuộc danh sách nội bộ không
  v_internal := COALESCE(p_is_internal, false) OR EXISTS (
    SELECT 1 FROM public.internal_devices WHERE device_id = p_device
  );

  -- 1. Luôn cập nhật active_devices để đo 5 phút gần nhất
  INSERT INTO public.active_devices (device_id, last_ping, is_internal)
  VALUES (p_device, now(), v_internal)
  ON CONFLICT (device_id) DO UPDATE SET
    last_ping = now(),
    is_internal = v_internal;

  -- Nếu chỉ là ping kiểm tra hoạt động, dừng tại đây (không ghi usage_daily)
  IF p_event = 'ping' THEN
    -- Dọn dẹp nhẹ bản ghi ping cũ hơn 24 giờ với xác suất 5%
    IF random() < 0.05 THEN
      DELETE FROM public.active_devices WHERE last_ping < (now() - INTERVAL '24 hours');
    END IF;
    RETURN;
  END IF;

  -- 2. Ghi nhận vào usage_daily cho visit, lesson, daily
  INSERT INTO public.usage_daily AS u (
    device_id, day, visits, lessons, questions, daily_done, ref, landing, is_internal
  )
  VALUES (
    p_device, v_day,
    CASE WHEN p_event = 'visit' THEN 1 ELSE 0 END,
    CASE WHEN p_event IN ('lesson', 'daily') THEN 1 ELSE 0 END,
    v_n,
    p_event = 'daily',
    LEFT(p_ref, 100),
    LEFT(p_path, 100),
    v_internal
  )
  ON CONFLICT (device_id, day) DO UPDATE SET
    visits = LEAST(u.visits + CASE WHEN p_event = 'visit' THEN 1 ELSE 0 END, 50),
    lessons = LEAST(u.lessons + CASE WHEN p_event IN ('lesson', 'daily') THEN 1 ELSE 0 END, 200),
    questions = LEAST(u.questions + v_n, 3000),
    daily_done = u.daily_done OR (p_event = 'daily'),
    ref = COALESCE(u.ref, LEFT(p_ref, 100)),
    landing = COALESCE(u.landing, LEFT(p_path, 100)),
    is_internal = u.is_internal OR v_internal,
    last_seen_at = now();
END;
$$;

-- Hàm nạp chồng 5 tham số để tương thích ngược 100%
CREATE OR REPLACE FUNCTION public.track_usage(
  p_device UUID,
  p_event TEXT,
  p_n INT DEFAULT 0,
  p_ref TEXT DEFAULT NULL,
  p_path TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.track_usage(p_device, p_event, p_n, p_ref, p_path, false);
$$;

REVOKE ALL ON FUNCTION public.track_usage(UUID, TEXT, INT, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_usage(UUID, TEXT, INT, TEXT, TEXT, BOOLEAN) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.track_usage(UUID, TEXT, INT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_usage(UUID, TEXT, INT, TEXT, TEXT) TO anon, authenticated;


-- 5. RPC QUẢN LÝ THIẾT BỊ NỘI BỘ (CHỈ DÙNG BỞI ADMIN)
CREATE OR REPLACE FUNCTION public.set_internal_device(
  p_device UUID,
  p_is_internal BOOLEAN,
  p_label TEXT DEFAULT 'Thiết bị nội bộ / QA'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_device IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'device_id_required');
  END IF;

  IF p_is_internal THEN
    INSERT INTO public.internal_devices (device_id, label)
    VALUES (p_device, COALESCE(p_label, 'Thiết bị nội bộ / QA'))
    ON CONFLICT (device_id) DO UPDATE SET label = EXCLUDED.label;

    UPDATE public.usage_daily SET is_internal = true WHERE device_id = p_device;
    UPDATE public.active_devices SET is_internal = true WHERE device_id = p_device;
  ELSE
    DELETE FROM public.internal_devices WHERE device_id = p_device;
    UPDATE public.usage_daily SET is_internal = false WHERE device_id = p_device;
    UPDATE public.active_devices SET is_internal = false WHERE device_id = p_device;
  END IF;

  RETURN jsonb_build_object('success', true, 'device_id', p_device, 'is_internal', p_is_internal);
END;
$$;


-- 6. RPC GET_USAGE_ANALYTICS (TRUY VẤN TỔNG HỢP CHO TRANG QUẢN TRỊ)
CREATE OR REPLACE FUNCTION public.get_usage_analytics(
  p_start_date DATE,
  p_end_date DATE,
  p_filter_mode TEXT DEFAULT 'exclude_internal'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unique_browsers INT := 0;
  v_study_browsers INT := 0;
  v_total_lessons INT := 0;
  v_daily_challenge_browsers INT := 0;
  v_returning_browsers INT := 0;
  v_active_5m INT := 0;
  v_total_internal INT := 0;
  v_first_day DATE;
  v_daily_json JSONB;
  v_sources_json JSONB;
BEGIN
  -- 1. Ngày đầu tiên có dữ liệu
  SELECT min(day) INTO v_first_day FROM public.usage_daily;

  -- 2. Đếm tổng thiết bị nội bộ đã đăng ký
  SELECT count(*) INTO v_total_internal FROM public.internal_devices;

  -- 3. Số trình duyệt hoạt động trong 5 phút qua
  SELECT count(*) INTO v_active_5m
  FROM public.active_devices
  WHERE last_ping >= (now() - INTERVAL '5 minutes')
    AND (
      p_filter_mode = 'all'
      OR (p_filter_mode = 'exclude_internal' AND is_internal = false)
      OR (p_filter_mode = 'only_internal' AND is_internal = true)
    );

  -- 4. Tổng hợp toàn kỳ trong khoảng p_start_date .. p_end_date (DISTINCT THEO DEVICE)
  WITH filtered AS (
    SELECT device_id, day, lessons, daily_done, ref, is_internal
    FROM public.usage_daily
    WHERE day >= p_start_date AND day <= p_end_date
      AND (
        p_filter_mode = 'all'
        OR (p_filter_mode = 'exclude_internal' AND is_internal = false)
        OR (p_filter_mode = 'only_internal' AND is_internal = true)
      )
  ),
  device_summary AS (
    SELECT
      device_id,
      count(DISTINCT day) AS days_active,
      sum(lessons) AS total_lessons_device,
      bool_or(lessons > 0) AS has_studied,
      bool_or(daily_done) AS has_daily_done
    FROM filtered
    GROUP BY device_id
  )
  SELECT
    count(*),
    count(*) FILTER (WHERE has_studied),
    COALESCE(sum(total_lessons_device), 0),
    count(*) FILTER (WHERE has_daily_done),
    count(*) FILTER (WHERE days_active >= 2)
  INTO
    v_unique_browsers,
    v_study_browsers,
    v_total_lessons,
    v_daily_challenge_browsers,
    v_returning_browsers
  FROM device_summary;

  -- 5. Bảng chi tiết theo ngày
  WITH filtered_days AS (
    SELECT
      u.day,
      count(DISTINCT u.device_id) AS browsers_day,
      count(DISTINCT u.device_id) FILTER (WHERE u.lessons > 0) AS study_browsers_day,
      sum(u.lessons) AS lessons_day,
      count(DISTINCT u.device_id) FILTER (WHERE u.daily_done) AS daily_done_day,
      sum(u.questions) AS questions_day
    FROM public.usage_daily u
    WHERE u.day >= p_start_date AND u.day <= p_end_date
      AND (
        p_filter_mode = 'all'
        OR (p_filter_mode = 'exclude_internal' AND u.is_internal = false)
        OR (p_filter_mode = 'only_internal' AND u.is_internal = true)
      )
    GROUP BY u.day
    ORDER BY u.day DESC
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'date', to_char(day, 'YYYY-MM-DD'),
    'browsers', browsers_day,
    'studyBrowsers', study_browsers_day,
    'lessons', lessons_day,
    'dailyDone', daily_done_day,
    'questions', questions_day
  )), '[]'::jsonb)
  INTO v_daily_json
  FROM filtered_days;

  -- 6. Nguồn truy cập (Referrers)
  WITH src AS (
    SELECT
      CASE
        WHEN ref IS NULL OR ref = '' THEN 'Trực tiếp / Không nguồn'
        WHEN ref ILIKE '%threads%' THEN 'Threads'
        WHEN ref ILIKE '%instagram%' THEN 'Instagram'
        WHEN ref ILIKE '%facebook%' OR ref ILIKE 'fb%' OR ref ILIKE '%messenger%' THEN 'Facebook'
        WHEN ref ILIKE '%zalo%' THEN 'Zalo'
        WHEN ref ILIKE '%google%' THEN 'Google Search'
        ELSE LEFT(ref, 40)
      END AS source_name,
      count(DISTINCT device_id) AS browser_count
    FROM public.usage_daily
    WHERE day >= p_start_date AND day <= p_end_date
      AND (
        p_filter_mode = 'all'
        OR (p_filter_mode = 'exclude_internal' AND is_internal = false)
        OR (p_filter_mode = 'only_internal' AND is_internal = true)
      )
    GROUP BY 1
    ORDER BY browser_count DESC
    LIMIT 20
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'source', source_name,
    'count', browser_count
  )), '[]'::jsonb)
  INTO v_sources_json
  FROM src;

  RETURN jsonb_build_object(
    'success', true,
    'range', jsonb_build_object('start', to_char(p_start_date, 'YYYY-MM-DD'), 'end', to_char(p_end_date, 'YYYY-MM-DD')),
    'filterMode', p_filter_mode,
    'firstTrackedDate', to_char(v_first_day, 'YYYY-MM-DD'),
    'lastUpdated', now(),
    'activeRecently5m', v_active_5m,
    'uniqueBrowsers', v_unique_browsers,
    'studyBrowsers', v_study_browsers,
    'totalLessons', v_total_lessons,
    'dailyChallengeBrowsers', v_daily_challenge_browsers,
    'returningBrowsers', v_returning_browsers,
    'completionRate', CASE WHEN v_unique_browsers > 0 THEN round((v_study_browsers::numeric / v_unique_browsers::numeric) * 100, 1) ELSE 0 END,
    'totalInternalDevices', v_total_internal,
    'daily', v_daily_json,
    'sources', v_sources_json
  );
END;
$$;