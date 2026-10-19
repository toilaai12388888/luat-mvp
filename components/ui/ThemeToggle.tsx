"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { IconButton } from "./IconButton";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  const observer = new MutationObserver(() => callback());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    window.removeEventListener("storage", callback);
    observer.disconnect();
  };
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

function getServerSnapshot() {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <IconButton onClick={toggle} aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}>
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </IconButton>
  );
}