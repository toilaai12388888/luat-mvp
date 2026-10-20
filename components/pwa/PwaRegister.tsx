"use client";

import { useEffect } from "react";
import { PushPromptModal } from "./PushPromptModal";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Check updates
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn("Service Worker registration failed:", err);
        });
    }
  }, []);

  return <PushPromptModal />;
}
