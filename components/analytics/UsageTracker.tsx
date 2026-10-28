"use client";

import { useEffect, useRef } from "react";
import { trackDailyVisit, trackHeartbeat } from "@/lib/usage";

export function UsageTracker() {
  const lastActiveRef = useRef<number>(0);

  useEffect(() => {
    lastActiveRef.current = Date.now();

    // 1. Ghi nhận lượt vào ngày hôm nay
    trackDailyVisit();
    trackHeartbeat();

    // 2. Lắng nghe tương tác người dùng để xác nhận tab đang có người dùng thật
    const updateActivity = () => {
      lastActiveRef.current = Date.now();
    };

    window.addEventListener("pointerdown", updateActivity, { passive: true });
    window.addEventListener("keydown", updateActivity, { passive: true });
    window.addEventListener("scroll", updateActivity, { passive: true });
    window.addEventListener("touchstart", updateActivity, { passive: true });

    // 3. Heartbeat định kỳ mỗi 60 giây (chỉ gửi khi tab hiển thị & có tương tác trong 3 phút)
    const interval = setInterval(() => {
      if (typeof document === "undefined") return;
      if (document.visibilityState !== "visible") return;
      // Nếu người dùng không tương tác trong hơn 3 phút, coi như đang treo tab, không ping
      if (Date.now() - lastActiveRef.current > 3 * 60 * 1000) return;

      trackHeartbeat();
    }, 60000);

    // 4. Khi quay lại tab đang mở
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        lastActiveRef.current = Date.now();
        trackHeartbeat();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pointerdown", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  return null;
}
