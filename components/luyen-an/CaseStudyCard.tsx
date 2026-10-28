"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Scale, CheckCircle2, ChevronRight, Clock, HelpCircle } from "lucide-react";
import { CaseStudy } from "@/lib/case-study-schema";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  const [isCompleted] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("luatle_completed_cases");
      if (raw) {
        const list: string[] = JSON.parse(raw);
        return list.includes(caseStudy.slug) || list.includes(caseStudy.id);
      }
    } catch {
      // Bỏ qua
    }
    return false;
  });

  const subjectName =
    caseStudy.mon === "dan-su"
      ? "Luật Dân sự"
      : caseStudy.mon === "doanh-nghiep"
      ? "Luật Doanh nghiệp"
      : "Luật Hành chính";

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 transition-all hover:border-navy-bar hover:shadow-md">
      <div className="space-y-2.5">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-navy-soft px-2 py-0.5 text-[11px] font-bold text-navy-ink">
              {subjectName}
            </span>
            <span className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-3">
              {caseStudy.chuong.toUpperCase()}
            </span>
            {caseStudy.nguon.la_an_le ? (
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20">
                {caseStudy.nguon.so_an_le || "Án lệ"}
              </span>
            ) : (
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/20">
                Bản án thực tế
              </span>
            )}
          </div>

          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-bold text-good">
              <CheckCircle2 size={12} /> Đã luyện
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold leading-snug text-ink group-hover:text-navy-bar transition-colors">
          <Link href={`/luyen-an/${caseStudy.slug}`} className="hover:underline">
            {caseStudy.title}
          </Link>
        </h3>

        {/* Legal issue snippet */}
        <p className="text-xs text-ink-2 line-clamp-2 leading-relaxed">
          {caseStudy.ho_so.yeu_cau_khoi_kien}
        </p>

        {/* Official source snippet */}
        <div className="flex items-center gap-1 text-[11px] text-ink-3">
          <Scale size={12} className="shrink-0 text-navy-bar" />
          <span className="truncate">{caseStudy.nguon.toa_an}</span>
          <span>·</span>
          <span>{caseStudy.nguon.so_hieu}</span>
        </div>
      </div>

      {/* Footer Info & Action Button */}
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
        <div className="flex items-center gap-3 text-ink-3 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> ~{caseStudy.thoi_gian_phut}p
          </span>
          <span className="inline-flex items-center gap-1">
            <HelpCircle size={12} /> {caseStudy.cau_hoi.length} câu hỏi
          </span>
        </div>

        <Link
          href={`/luyen-an/${caseStudy.slug}`}
          className="press inline-flex items-center gap-1 rounded-xl bg-navy-bar px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95"
        >
          <span>{isCompleted ? "Luyện lại" : "Luyện ngay"}</span>
          <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}
