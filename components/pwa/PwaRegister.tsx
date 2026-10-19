"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("Service Worker registration failed:", err);
        });
    }

    // Daily 20:00 study reminder check
    const checkNotification = () => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission === "granted") {
        const now = new Date();
        const hour = now.getHours();
        // If it's around 20:00 and not shown today
        const lastNotif = localStorage.getItem("luat_last_notif_date");
        const today = now.toISOString().split("T")[0];

        if (hour >= 20 && lastNotif !== today) {
          localStorage.setItem("luat_last_notif_date", today);
          new Notification("Luật Lẹ — Đã đến giờ ôn bài! ⚖️", {
            body: "Dành 5 phút làm Thử thách hằng ngày để duy trì chuỗi học tập bạn nhé!",
            icon: "/photos/dan-su.jpg",
          });
        }
      }
    };

    const interval = setInterval(checkNotification, 1000 * 60 * 15); // check every 15 mins
    checkNotification();

    return () => clearInterval(interval);
  }, []);

  return null;
}
