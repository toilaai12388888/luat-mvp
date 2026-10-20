import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://zolxwrrhdwssuqlcnkkr.supabase.co";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
