import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://zolxwrrhdwssuqlcnkkr.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbHh3cnJoZHdzc3VxbGNua2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzODM0ODQsImV4cCI6MjEwNzk1OTQ4NH0.1ZpywexDZcFRcKyP7GygcK2uIwZchW2rqKQAmZpitCA";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
