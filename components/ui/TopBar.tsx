"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Zap } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { Chip } from "./Chip";
import { ThemeToggle } from "./ThemeToggle";
import { getMyStats } from "@/lib/stats";

interface TopBarProps {
  streak?: number;
  xp?: number;
  showChips?: boolean;
}

export function TopBar({ streak: propStreak, xp: propXp, showChips = true }: TopBarProps) {
  const [streak, setStreak] = useState(propStreak ?? 0);
  const [xp, setXp] = useState(propXp ?? 0);

  useEffect(() => {
    if (propStreak !== undefined && propXp !== undefined) return;
    getMyStats().then((s) => {
      setStreak(s.streak);
      setXp(s.xp);
    });

    const handler = () => {
      getMyStats().then((s) => {
        setStreak(s.streak);
        setXp(s.xp);
      });
    };
    window.addEventListener("luat_attempts_updated", handler);
    return () => window.removeEventListener("luat_attempts_updated", handler);
  }, [propStreak, propXp]);

  return (
    <header className="flex h-14 flex-none items-center justify-between gap-2 px-4 bg-bg">
      <Link href="/" className="press flex items-center gap-2.5 font-bold text-[17px] tracking-[-0.01em] text-ink">
        <span
          className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-btn text-btn-ink font-['Lora',Georgia,serif] text-[19px] leading-none"
          aria-hidden="true"
        >
          §
        </span>
        <span>{APP_NAME}</span>
      </Link>
      <div className="flex items-center gap-1.5">
        {showChips && (
          <>
            <Chip aria-label={`Chuỗi ${streak} ngày`}>
              <Flame size={16} className="text-fire" fill="currentColor" />
              <span>{streak}</span>
            </Chip>
            <Chip aria-label={`${xp} XP`}>
              <Zap size={16} className="text-gold" fill="currentColor" />
              <span>{xp}</span>
            </Chip>
          </>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}