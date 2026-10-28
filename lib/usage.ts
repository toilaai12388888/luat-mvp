// Bộ đếm sử dụng ẩn danh và đo hoạt động gần đây cho Luật Lẹ
// Không lưu tên, email hay IP cá nhân.
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getVietnamDateString } from "@/lib/push";

const DEVICE_KEY = "luatle_device_id";
const VISIT_KEY = "luatle_visit_day";
const INTERNAL_KEY = "luatle_is_internal";
const LAST_HEARTBEAT_KEY = "luatle_last_heartbeat";
const TRACKED_SESSIONS_KEY = "luatle_tracked_sessions";

export type UsageEvent = "visit" | "lesson" | "daily" | "ping";

export function getDeviceId(): string | null {
  if (typeof window === "undefined") return null;
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

export function isLocalInternalDevice(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(INTERNAL_KEY) === "true";
  } catch {
    return false;
  }
}

export function setLocalInternalDevice(isInternal: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (isInternal) {
      localStorage.setItem(INTERNAL_KEY, "true");
    } else {
      localStorage.removeItem(INTERNAL_KEY);
    }
  } catch {
    // ignore
  }
}

function getSource(): string | null {
  if (typeof window === "undefined") return null;
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

// Chống ghi trùng lượt hoàn thành bài học (cho cả re-render, refresh, tab khác)
function isSessionTracked(sessionKey: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(TRACKED_SESSIONS_KEY);
    const set: string[] = raw ? JSON.parse(raw) : [];
    return set.includes(sessionKey);
  } catch {
    return false;
  }
}

function markSessionTracked(sessionKey: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(TRACKED_SESSIONS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(sessionKey)) {
      list.push(sessionKey);
      // Chỉ giữ tối đa 100 phiên gần nhất để tránh phình localStorage
      if (list.length > 100) list.splice(0, list.length - 100);
      localStorage.setItem(TRACKED_SESSIONS_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore
  }
}

export function trackUsage(
  event: UsageEvent,
  questions = 0,
  sessionKey?: string
): void {
  if (typeof window === "undefined" || !isSupabaseConfigured || !supabase) return;

  // Chống ghi trùng cho lượt hoàn thành bài học
  if (sessionKey && (event === "lesson" || event === "daily")) {
    if (isSessionTracked(sessionKey)) return;
    markSessionTracked(sessionKey);
  }

  const deviceId = getDeviceId();
  if (!deviceId) return;

  const isVisit = event === "visit";
  const isInternal = isLocalInternalDevice();

  supabase
    .rpc("track_usage", {
      p_device: deviceId,
      p_event: event,
      p_n: Math.max(0, Math.min(100, Math.round(questions) || 0)),
      p_ref: isVisit ? getSource() : null,
      p_path: isVisit ? window.location.pathname.slice(0, 100) : null,
      p_is_internal: isInternal,
    })
    .then(
      () => {},
      () => {}
    );
}

// Gọi 1 lần mỗi ngày (giờ Việt Nam) cho mỗi trình duyệt
export function trackDailyVisit(): void {
  if (typeof window === "undefined") return;
  try {
    const today = getVietnamDateString();
    if (localStorage.getItem(VISIT_KEY) === today) return;
    localStorage.setItem(VISIT_KEY, today);
  } catch {
    return;
  }
  trackUsage("visit");
}

// Gửi heartbeat đo hoạt động 5 phút (tối đa 1 lần / 50 giây trên tất cả các tab)
export function trackHeartbeat(): void {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const lastPing = Number(localStorage.getItem(LAST_HEARTBEAT_KEY) || 0);
    // Nếu tab nào đó đã ping trong vòng 50 giây qua, bỏ qua
    if (now - lastPing < 50000) return;
    localStorage.setItem(LAST_HEARTBEAT_KEY, String(now));
  } catch {
    return;
  }
  trackUsage("ping");
}
