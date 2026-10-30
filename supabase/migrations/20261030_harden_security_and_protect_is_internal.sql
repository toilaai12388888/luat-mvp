-- ========================================================
-- Migration: Thắt chặt bảo mật DB, phân quyền và bảo vệ cột is_internal
-- Ngày tạo: 30/10/2026
-- Dự án: Luật Lẹ (zolxwrrhdwssuqlcnkkr)
-- ========================================================

-- 1. BẢO VỆ BẢNG SESSION_REWARDS
-- Thu hồi toàn bộ quyền thao tác từ vai trò anon
REVOKE ALL ON TABLE public.session_rewards FROM anon;

-- Với authenticated: chỉ cho phép SELECT dữ liệu của chính mình (kiểm soát bởi RLS)
REVOKE INSERT, UPDATE, DELETE ON TABLE public.session_rewards FROM authenticated;
GRANT SELECT ON TABLE public.session_rewards TO authenticated;

-- Đảm bảo RLS bật và chỉ có policy SELECT cho chính chủ
ALTER TABLE public.session_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own session_rewards" ON public.session_rewards;
CREATE POLICY "Users can read own session_rewards" ON public.session_rewards
  FOR SELECT USING (auth.uid() = player_id);

-- Xóa các policy ghi dữ liệu trái phép nếu có
DROP POLICY IF EXISTS "Users can insert own session_rewards" ON public.session_rewards;
DROP POLICY IF EXISTS "Users can update own session_rewards" ON public.session_rewards;
DROP POLICY IF EXISTS "Users can delete own session_rewards" ON public.session_rewards;


-- 2. BẢO VỆ HÀM SET_PLAYER_INTERNAL
-- Thu hồi quyền thực thi từ PUBLIC, anon, authenticated; chỉ cấp cho service_role
REVOKE EXECUTE ON FUNCTION public.set_player_internal(UUID, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_player_internal(UUID, BOOLEAN) TO service_role;

CREATE OR REPLACE FUNCTION public.set_player_internal(p_player_id UUID, p_is_internal BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Kiểm tra kép: chỉ cho phép người gọi có vai trò service_role
  IF coalesce(auth.role(), '') != 'service_role' AND current_user != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: service_role required';
  END IF;

  INSERT INTO public.players (id, nickname, school, is_internal)
  VALUES (p_player_id, 'Ẩn danh', 'Khác', p_is_internal)
  ON CONFLICT (id) DO UPDATE SET is_internal = p_is_internal;

  RETURN jsonb_build_object('success', true, 'player_id', p_player_id, 'is_internal', p_is_internal);
END;
$$;


-- 3. BẢO VỆ CỘT IS_INTERNAL TRÊN BẢNG PLAYERS
-- Ngăn người dùng thường tự ý đổi cờ is_internal qua REST API hoặc SQL trực tiếp
CREATE OR REPLACE FUNCTION public.protect_player_internal_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Nếu được gọi bởi service_role: cho phép thay đổi
  IF coalesce(auth.role(), '') = 'service_role' OR current_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Khi INSERT bởi anon/authenticated: luôn cưỡng chế is_internal = false
  IF TG_OP = 'INSERT' THEN
    NEW.is_internal := false;
    RETURN NEW;
  END IF;

  -- Khi UPDATE bởi anon/authenticated: cấm thay đổi is_internal
  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_internal IS DISTINCT FROM OLD.is_internal THEN
      RAISE EXCEPTION 'Access denied: cannot modify is_internal column';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_player_internal ON public.players;
CREATE TRIGGER trg_protect_player_internal
  BEFORE INSERT OR UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_player_internal_column();
