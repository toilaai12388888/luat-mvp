"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Calendar, CheckCircle2, Flame, ArrowRight, Zap, Target } from "lucide-react";
import { getClosestActivePlan, SubjectStudyPlan } from "@/lib/study-plan";

export function StudyPlanCard() {
  const [plan, setPlan] = useState<SubjectStudyPlan | null>(null);
  const [mounted, setMounted] = useState(false);

  const refreshPlan = useCallback(() => {
    setPlan(getClosestActivePlan());
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshPlan();

    window.addEventListener("luat_attempts_updated", refreshPlan);
    window.addEventListener("luat_exam_dates_updated", refreshPlan);
    window.addEventListener("luat_daily_goal_rewarded", refreshPlan);

    return () => {
      window.removeEventListener("luat_attempts_updated", refreshPlan);
      window.removeEventListener("luat_exam_dates_updated", refreshPlan);
      window.removeEventListener("luat_daily_goal_rewarded", refreshPlan);
    };
  }, [refreshPlan]);

  if (!mounted) return null;

  // Empty state: No active exam date
  if (!plan) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-800 to-navy-900 border border-gold/30 shadow-md text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center shrink-0 border border-gold/40">
            <Calendar size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-gold-light mb-1 flex items-center gap-1.5">
              <Target size={16} /> Lộ trình ôn thi thông minh
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Đặt ngày thi từng môn để app tự chia số câu ôn mỗi ngày, ưu tiên câu sai và đề thi thử nước rút.
            </p>
            <Link
              href="/tien-do#lo-trinh"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs transition shadow-sm"
            >
              Đặt ngày thi ngay <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = Math.min(100, Math.round((plan.doneToday / plan.dailyTarget) * 100));

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-800 border border-gold/40 shadow-lg text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-gold/20 text-gold border border-gold/30">
            <Target size={18} />
          </span>
          <div>
            <h3 className="font-bold text-sm text-gold-light">
              Còn {plan.daysLeft} ngày thi {plan.subjectName}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Ngày thi: {plan.examDate.split("-").reverse().join("/")}
            </p>
          </div>
        </div>

        {plan.isRush ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <Zap size={12} /> Nước rút
          </span>
        ) : (
          <Link
            href="/tien-do#lo-trinh"
            className="text-[11px] text-slate-400 hover:text-gold transition"
          >
            Đổi ngày thi
          </Link>
        )}
      </div>

      {/* RUSH MODE (<= 3 DAYS) */}
      {plan.isRush ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
            ⚡ Chỉ còn <strong>{plan.daysLeft} ngày</strong> nữa! Chuyển sang chế độ thi thử toàn diện bấm giờ để rèn phản xạ phòng thi.
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/thi-thu"
              className="flex-1 py-2.5 bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-gold/20"
            >
              <Zap size={14} /> Vào thi thử 60 phút ngay
            </Link>
            <Link
              href={`/mon/${plan.subject}`}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
            >
              Ôn bài
            </Link>
          </div>
        </div>
      ) : (
        /* NORMAL MODE */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Mục tiêu hôm nay: <strong className="text-white">{plan.dailyTarget} câu</strong>
            </span>
            <span className="font-mono text-slate-300">
              {plan.doneToday}/{plan.dailyTarget} câu ({progressPct}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950/60 rounded-full h-2.5 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                plan.isCompletedToday
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : "bg-gradient-to-r from-gold to-amber-400"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Status Message & CTA */}
          {plan.isCompletedToday ? (
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>Đã xong mục tiêu hôm nay! (+20 XP thưởng)</span>
              </div>
              <Link
                href={`/mon/${plan.subject}`}
                className="text-xs font-semibold text-emerald-400 hover:underline shrink-0"
              >
                Ôn thêm →
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Flame size={14} className="text-amber-400" />
                <span>Còn {Math.max(0, plan.dailyTarget - plan.doneToday)} câu để hoàn thành</span>
              </div>
              <Link
                href={`/mon/${plan.subject}`}
                className="px-4 py-2 bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs rounded-xl transition shadow-md shadow-gold/20 flex items-center gap-1"
              >
                Bắt đầu học <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
