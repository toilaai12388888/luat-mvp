"use client";

import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getMyStats, UserStats } from "@/lib/stats";

export function HomeStreak() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    getMyStats().then(setStats);
    const handler = () => {
      getMyStats().then(setStats);
    };
    window.addEventListener("luat_attempts_updated", handler);
    return () => window.removeEventListener("luat_attempts_updated", handler);
  }, []);

  const streakDays = stats?.streak || 0;
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const week = stats?.week || [false, false, false, false, false, false, false];

  const todayIndex = (new Date().getDay() + 6) % 7; // 0: T2 ... 6: CN

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-bold text-sm text-ink">
          <Flame size={18} className="text-fire" fill="currentColor" />
          <span>Chuỗi {streakDays} ngày</span>
        </div>
        <span className="text-xs text-ink-2">
          {stats?.doneToday ? "Đã giữ chuỗi hôm nay" : "Làm 1 bài để giữ chuỗi"}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {days.map((day, idx) => {
          const isDone = week[idx];
          const isToday = idx === todayIndex;

          let dotCls = "border border-line-2 text-transparent bg-bg-2";
          if (isDone) {
            dotCls = "bg-gold border-gold text-white font-bold";
          } else if (isToday) {
            dotCls = "border-2 border-gold text-gold font-bold";
          }

          return (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <span className={`text-[11px] font-medium ${isToday ? "text-ink font-bold" : "text-ink-3"}`}>
                {day}
              </span>
              <span className={`grid h-8 w-8 place-items-center rounded-full text-xs ${dotCls}`}>
                {isDone ? "✓" : isToday ? "•" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}