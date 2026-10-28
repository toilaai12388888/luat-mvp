"use client";

import React, { useState } from "react";
import { CaseStudy } from "@/lib/case-study-schema";
import { CaseStudyCard } from "./CaseStudyCard";
import { Scale } from "lucide-react";

interface CaseStudyListViewProps {
  cases: CaseStudy[];
}

type FilterTab = "all" | "dan-su" | "doanh-nghiep" | "hanh-chinh";

export function CaseStudyListView({ cases }: CaseStudyListViewProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filteredCases = cases.filter((c) => {
    if (filter === "all") return true;
    return c.mon === filter;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "Tất cả", count: cases.length },
    {
      key: "dan-su",
      label: "Dân sự",
      count: cases.filter((c) => c.mon === "dan-su").length,
    },
    {
      key: "doanh-nghiep",
      label: "Doanh nghiệp",
      count: cases.filter((c) => c.mon === "doanh-nghiep").length,
    },
    {
      key: "hanh-chinh",
      label: "Hành chính",
      count: cases.filter((c) => c.mon === "hanh-chinh").length,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Intro Banner */}
      <div className="rounded-2xl border border-navy-bar/20 bg-navy-soft/30 p-4 space-y-2">
        <div className="flex items-center gap-2 text-navy-ink font-bold text-sm">
          <Scale size={18} className="text-navy-bar" />
          <span>Luyện án thật là gì?</span>
        </div>
        <p className="text-xs text-ink-2 leading-relaxed">
          Tập giải quyết các vụ án và án lệ có thật được Tòa án công bố chính thức. Qua mỗi lượt luyện 5–8 phút, bạn sẽ rèn luyện kỹ năng:{" "}
          <span className="font-semibold text-ink">Xác định vấn đề pháp lý → Trích dẫn căn cứ đúng thời điểm → Soạn lập luận → Đối chiếu nhận định và phán quyết thực tế của Hội đồng xét xử</span>.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-ink-3">
          <span>✓ Nguồn án chính thức</span>
          <span>✓ Ẩn danh bảo vệ dữ liệu</span>
          <span>✓ Tự đối chiếu khách quan</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.key)}
              className={`press shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? "bg-navy-bar text-white shadow-sm"
                  : "border border-line bg-surface text-ink-2 hover:border-ink-3 hover:text-ink"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filteredCases.map((c) => (
          <CaseStudyCard key={c.id} caseStudy={c} />
        ))}

        {filteredCases.length === 0 && (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-xs text-ink-3">
            Chưa có vụ án nào cho bộ lọc này.
          </div>
        )}
      </div>
    </div>
  );
}
