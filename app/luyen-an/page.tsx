import React from "react";
import { Metadata } from "next";
import { TopBar } from "@/components/ui/TopBar";
import { TabBar } from "@/components/ui/TabBar";
import { getAllCaseStudies } from "@/lib/case-studies";
import { CaseStudyListView } from "@/components/luyen-an/CaseStudyListView";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Luyện án thật — Áp dụng luật vào vụ việc thực tế | Luật Lẹ",
  description:
    "Luyện tập phân tích hồ sơ vụ án, xác định vấn đề pháp lý, tìm căn cứ và đối chiếu lập luận với bản án và án lệ có thật được Tòa án công bố chính thức.",
};

export default function LuyenAnPage() {
  const cases = getAllCaseStudies();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <TopBar />
      <main className="mx-auto w-full max-w-[480px] flex-1 px-4 pt-2 pb-24">
        {/* Header Title */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-ink">
            <Scale size={14} className="text-navy-bar" />
            <span>Thực hành tranh tụng & áp dụng luật</span>
          </div>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-ink">
            Luyện án thật
          </h1>
          <p className="mt-1 text-xs text-ink-2">
            Hồ sơ vụ việc, bản án và án lệ chính thức từ Tòa án nhân dân.
          </p>
        </div>

        {/* List & Filter View */}
        <CaseStudyListView cases={cases} />
      </main>
      <TabBar />
    </div>
  );
}
