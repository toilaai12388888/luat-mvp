"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, RotateCcw, Timer, Trophy, User } from "lucide-react";

export function TabBar() {
  const pathname = usePathname();

  const isLearn = pathname === "/" || pathname.startsWith("/mon");
  const isReview = pathname.startsWith("/on-tap");
  const isMock = pathname.startsWith("/thi-thu");
  const isLeaderboard = pathname.startsWith("/xep-hang");
  const isMe = pathname.startsWith("/tien-do") || pathname.startsWith("/toi");

  const tabs = [
    { name: "Học", href: "/", icon: BookOpen, active: isLearn },
    { name: "Ôn tập", href: "/on-tap", icon: RotateCcw, active: isReview },
    { name: "Thi thử", href: "/thi-thu", icon: Timer, active: isMock },
    { name: "Xếp hạng", href: "/xep-hang", icon: Trophy, active: isLeaderboard },
    { name: "Tôi", href: "/tien-do", icon: User, active: isMe },
  ];

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 flex h-16 w-full max-w-[480px] -translate-x-1/2 items-center justify-around border-t border-line bg-surface/95 backdrop-blur-md px-1"
      aria-label="Điều hướng chính"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`press flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] transition-colors ${
              tab.active ? "text-navy-bar font-bold" : "text-ink-3 hover:text-ink-2 font-medium"
            }`}
          >
            <Icon size={20} strokeWidth={tab.active ? 2.5 : 2} />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
