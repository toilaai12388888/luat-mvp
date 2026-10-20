import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

// Giới hạn đoán mã: 5 lần sai / 15 phút / IP (bộ nhớ của từng instance server).
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; first: number; lockedUntil: number }>();

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // vẫn so sánh để thời gian phản hồi không lộ độ dài
    timingSafeEqual(bb, bb);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export type AdminCheck =
  | { ok: true }
  | { ok: false; status: number; error: string };

export function checkAdminPin(req: NextRequest, providedPin: string | null | undefined): AdminCheck {
  const expected = (process.env.ADMIN_PIN || "").trim();
  if (expected.length < 12) {
    return { ok: false, status: 503, error: "Trang quản trị chưa được cấu hình (ADMIN_PIN chưa cài hoặc ngắn hơn 12 ký tự)." };
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const rec = fails.get(ip);
  if (rec && rec.lockedUntil > now) {
    const mins = Math.ceil((rec.lockedUntil - now) / 60000);
    return { ok: false, status: 429, error: `Nhập sai quá nhiều lần. Thử lại sau ${mins} phút.` };
  }

  const pin = (providedPin || "").trim();
  if (pin && safeEqual(pin, expected)) {
    fails.delete(ip);
    return { ok: true };
  }

  const cur = rec && now - rec.first < WINDOW_MS ? rec : { count: 0, first: now, lockedUntil: 0 };
  cur.count += 1;
  if (cur.count >= MAX_FAILS) cur.lockedUntil = now + WINDOW_MS;
  fails.set(ip, cur);
  return { ok: false, status: 401, error: "Mã PIN không chính xác" };
}
