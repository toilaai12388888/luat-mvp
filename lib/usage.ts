// Bộ đếm sử dụng ẩn danh: mỗi trình duyệt một mã ngẫu nhiên, không tên, không email.
// Ghi vào bảng usage_daily qua RPC track_usage (xem supabase/migrations/20261024_usage_tracking.sql).
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getVietnamDateString } from "@/lib/push";

const DEVICE_KEY = "luatle_device_id";
const VISIT_KEY = "luatle_visit_day";

type UsageEvent = "visit" | "lesson" | "daily";

function getDeviceId(): string | null {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
              (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16)
            );
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function getSource(): string | null {
  try {
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    if (utm) return utm.slice(0, 60);
    if (!document.referrer) return null;
    const host = new URL(document.referrer).hostname;
    if (host === window.location.hostname) return null;
    return host.slice(0, 100);
  } catch {
    return null;
  }
}

export function trackUsage(event: UsageEvent, questions = 0): void {
  if (typeof window === "undefined" || !isSupabaseConfigured || !supabase) return;
  const deviceId = getDeviceId();
  if (!deviceId) return;
  const isVisit = event === "visit";
  supabase
    .rpc("track_usage", {
      p_device: deviceId,
      p_event: event,
      p_n: Math.max(0, Math.min(100, Math.round(questions) || 0)),
      p_ref: isVisit ? getSource() : null,
      p_path: isVisit ? window.location.pathname.slice(0, 100) : null,
    })
    .then(
      () => {},
      () => {}
    );
}

// Gọi 1 lần mỗi ngày (giờ Việt Nam) cho mỗi trình duyệt.
export function trackDailyVisit(): void {
  try {
    const today = getVietnamDateString();
    if (localStorage.getItem(VISIT_KEY) === today) return;
    localStorage.setItem(VISIT_KEY, today);
  } catch {
    return;
  }
  trackUsage("visit");
}
