"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, Flame, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { getMyStats, UserStats } from "@/lib/stats";

export function TienDoView() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    getMyStats().then(setStats);
    const handler = () => {
      getMyStats().then(setStats);
    };
    window.addEventListener("luat_attempts_updated", handler);
    return () => window.removeEventListener("luat_attempts_updated", handler);
  }, []);

  const xp = stats?.xp || 0;
  const streak = stats?.streak || 0;
  const answered = stats?.answered || 0;
  const pctCorrect = stats?.pctCorrect || 0;
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const week = stats?.week || [false, false, false, false, false, false, false];
  const todayIndex = (new Date().getDay() + 6) % 7;

  const subjectMeta: Record<string, { name: string; photo: string }> = {
    "dan-su": { name: "Luật Dân sự", photo: "/photos/dan-su.jpg" },
    "hanh-chinh": { name: "Luật Hành chính", photo: "/photos/hanh-chinh.jpg" },
    "doanh-nghiep": { name: "Luật Doanh nghiệp", photo: "/photos/doanh-nghiep.jpg" },
  };

  const bySubject = stats?.bySubject || [
    { slug: "dan-su", answered: 0, pctCorrect: 0 },
    { slug: "hanh-chinh", answered: 0, pctCorrect: 0 },
    { slug: "doanh-nghiep", answered: 0, pctCorrect: 0 },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Tiến độ ôn tập</h1>
        <Chip aria-label={`${xp} XP`}>
          <Zap size={16} className="text-gold" fill="currentColor" />
          <span>{xp} XP</span>
        </Chip>
      </div>

      {/* Chuỗi ngày Card */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-ink">
            <Flame size={18} className="text-fire" fill="currentColor" />
            <span>Chuỗi {streak} ngày</span>
          </div>
          <span className="text-xs text-ink-2">
            {stats?.doneToday ? "Đã ôn tập hôm nay" : "Chưa làm bài hôm nay"}
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

      {/* 3 Metric Tiles */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-line bg-surface p-3 text-center">
          <span className="text-xs text-ink-3 block mb-1">Tổng XP</span>
          <span className="text-xl font-extrabold text-gold">+{xp}</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3 text-center">
          <span className="text-xs text-ink-3 block mb-1">Câu đã làm</span>
          <span className="text-xl font-extrabold text-ink">{answered}</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3 text-center">
          <span className="text-xs text-ink-3 block mb-1">Tỉ lệ đúng</span>
          <span className="text-xl font-extrabold text-good">{pctCorrect}%</span>
        </div>
      </div>

      {/* Theo Môn Card */}
      <section>
        <h2 className="text-base font-bold text-ink mb-3">Tiến độ theo môn học</h2>
        <Card className="divide-y divide-line p-0 overflow-hidden">
          {bySubject.map((item) => {
            const meta = subjectMeta[item.slug];
            if (!meta) return null;

            return (
              <Link
                key={item.slug}
                href={`/mon/${item.slug}`}
                className="press flex items-center gap-3.5 p-3.5 hover:bg-bg-2"
              >
                <div className="relative h-12 w-12 flex-none overflow-hidden rounded-xl border border-line">
                  <Image
                    src={meta.photo}
                    alt={meta.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-ink">{meta.name}</span>
                    <span className="text-xs font-semibold text-good">
                      {item.answered > 0 ? `${item.pctCorrect}% đúng` : "Chưa làm"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-navy-bar"
                        style={{ width: `${item.pctCorrect}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-ink-3 tabular-nums">
                      {item.answered} câu
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} className="text-ink-3 flex-none" />
              </Link>
            );
          })}
        </Card>
      </section>
    </div>
  );
}