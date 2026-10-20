import { supabase, isSupabaseConfigured } from "./supabase";

export function getVietnamDateString(date = new Date()): string {
  // Convert to UTC+7
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const vnTime = new Date(utc + 7 * 3600000);
  return vnTime.toISOString().split("T")[0]; // YYYY-MM-DD
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isWebkit = /WebKit/.test(ua);
  const isSafari = isIos && isWebkit && !/CriOS|FxiOS|OPiOS/.test(ua);
  const isStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
  return isSafari && !isStandalone;
}

export async function recordActivityToday(): Promise<void> {
  const todayVn = getVietnamDateString();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("luat_last_active_date_vn", todayVn);
    } catch {}
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: authData } = await supabase.auth.getSession();
      const user = authData?.session?.user;
      if (user) {
        await supabase
          .from("push_subscriptions")
          .update({ last_active_date: todayVn })
          .eq("player_id", user.id);
      }
    } catch (err) {
      console.warn("Failed to update push_subscription active date:", err);
    }
  }
}

export async function subscribeToPush(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { success: false, error: "Trình duyệt không hỗ trợ Web Push." };
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    return { success: false, error: "Chưa cấu hình VAPID key." };
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Bạn chưa cấp quyền thông báo." };
    }

    // Ensure user session exists in Supabase
    let userId: string | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user) {
        const signRes = await supabase.auth.signInAnonymously();
        if (signRes.data?.user) {
          userId = signRes.data.user.id;
        }
      } else {
        userId = data.session.user.id;
      }
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    const subJson = sub.toJSON();
    const endpoint = subJson.endpoint;
    const p256dh = subJson.keys?.p256dh;
    const auth = subJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return { success: false, error: "Không lấy được khóa thông báo." };
    }

    const todayVn = getVietnamDateString();

    if (isSupabaseConfigured && supabase && userId) {
      await supabase.from("push_subscriptions").upsert({
        player_id: userId,
        endpoint,
        p256dh,
        auth,
        last_active_date: todayVn,
      });
    }

    localStorage.setItem("luat_push_subscribed", "true");
    return { success: true };
  } catch (err: unknown) {
    console.error("Push subscribe error:", err);
    return { success: false, error: (err as Error).message || "Lỗi khi đăng ký thông báo." };
  }
}
