"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BarChart2 } from "lucide-react";

export function TabBar() {
  const pathname = usePathname();
  const isLearn = pathname === "/" || pathname.startsWith("/mon");
  const isProgress = pathname.startsWith("/tien-do");

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 flex h-16 w-full max-w-[480px] -translate-x-1/2 items-center justify-around border-t border-line bg-surface/95 backdrop-blur-md px-2"
      aria-label="Điều hướng chính"
    >
      <Link
        href="/"
        className={`press flex flex-1 flex-col items-center justify-center gap-1 py-1 text-xs font-semibold ${
          isLearn ? "text-navy-bar font-bold" : "text-ink-3"
        }`}
      >
        <BookOpen size={22} />
        <span>Học</span>
      </Link>
      <Link
        href="/tien-do"
        className={`press flex flex-1 flex-col items-center justify-center gap-1 py-1 text-xs font-semibold ${
          isProgress ? "text-navy-bar font-bold" : "text-ink-3"
        }`}
      >
        <BarChart2 size={22} />
        <span>Tiến độ</span>
      </Link>
    </nav>
  );
}