"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, X, BookOpen, ChevronRight } from "lucide-react";
import { searchQuestions } from "@/lib/all-questions";
import { searchDieuLuat, TraCuuDieuResult } from "@/lib/van-ban";
import { DieuLuatSheet } from "@/components/van-ban/DieuLuatSheet";

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const [closed, setClosed] = useState(false);
  const [selectedDieu, setSelectedDieu] = useState<TraCuuDieuResult | null>(null);

  const trimmed = query.trim();
  const isOpen = !closed && trimmed.length >= 2;

  const questionResults = isOpen ? searchQuestions(trimmed).slice(0, 5) : [];
  const lawResults = isOpen ? searchDieuLuat(trimmed).slice(0, 3) : [];
  const totalCount = questionResults.length + lawResults.length;

  const handleClear = () => {
    setQuery("");
    setClosed(false);
  };

  return (
    <>
      <div className="relative mb-4 w-full">
        <div className="relative flex items-center">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 text-ink-3"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setClosed(false);
            }}
            placeholder="Tìm câu hỏi, 'Điều 117', khái niệm hợp đồng..."
            className="h-11 w-full rounded-2xl border border-line bg-surface pl-10 pr-10 text-xs text-ink placeholder:text-ink-3 focus:border-navy-bar focus:outline-none focus:ring-1 focus:ring-navy-bar transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="press absolute right-3 text-ink-3 hover:text-ink"
              aria-label="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown search results */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-12 z-40 max-h-96 overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-xl animate-in fade-in duration-150">
            <div className="px-2 py-1 text-[11px] font-bold text-ink-3 flex items-center justify-between">
              <span>Tìm thấy {totalCount} kết quả phù hợp:</span>
              <Link
                href="/tra-cuu"
                onClick={() => setClosed(true)}
                className="text-navy-bar hover:underline font-semibold"
              >
                Tra cứu luật →
              </Link>
            </div>

            {totalCount > 0 ? (
              <div className="flex flex-col gap-2">
                {/* Law articles section */}
                {lawResults.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navy-ink px-2 pt-1 flex items-center gap-1">
                      <BookOpen size={11} /> Nguyên văn điều luật
                    </span>
                    {lawResults.map((item) => (
                      <div
                        key={`${item.vanBanSlug}-${item.dieuSo}`}
                        onClick={() => {
                          setSelectedDieu(item);
                          setClosed(true);
                        }}
                        className="press flex flex-col gap-0.5 rounded-xl p-2 text-left hover:bg-navy-soft/30 transition-colors border border-line/50 cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-navy-bar">
                            Điều {item.dieuSo}. {item.ten}
                          </span>
                          <span className="text-[10px] text-ink-3">{item.vanBanTen}</span>
                        </div>
                        <p className="text-[11px] text-ink-2 line-clamp-1">
                          {item.noiDung}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Questions section */}
                {questionResults.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3 px-2 pt-1">
                      Câu hỏi trắc nghiệm & nhận định
                    </span>
                    {questionResults.map((res) => {
                      const item = res.item;
                      const targetUrl = `/mon/${item.subject}/${item.type === "mcq" ? "trac-nghiem" : "nhan-dinh"}/${item.chapter}`;
                      return (
                        <Link
                          key={item.id}
                          href={targetUrl}
                          onClick={() => setClosed(true)}
                          className="press flex flex-col gap-1 rounded-xl p-2 text-left hover:bg-bg-2 transition-colors border-b border-line/40 last:border-b-0"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-navy-bar">
                              {item.can_cu?.[0]?.dieu} ({item.can_cu?.[0]?.van_ban})
                            </span>
                            <span className="text-ink-3 font-medium">
                              {item.type === "mcq" ? "Trắc nghiệm" : "Nhận định"} ·{" "}
                              {item.subject === "dan-su"
                                ? "Dân sự"
                                : item.subject === "hanh-chinh"
                                ? "Hành chính"
                                : "Doanh nghiệp"}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-ink line-clamp-1">
                            {item.cau_hoi || item.nhan_dinh}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Footer link to Tra Cuu */}
                <Link
                  href="/tra-cuu"
                  onClick={() => setClosed(true)}
                  className="press mt-1 flex items-center justify-between rounded-xl bg-bg-2 p-2.5 text-xs font-semibold text-navy-bar hover:bg-navy-soft/30"
                >
                  <span>Mở kho tra cứu 77 điều luật</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-ink-3">
                Không tìm thấy câu hỏi hoặc điều luật nào khớp với &quot;{query}&quot;.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-up sheet for selected law article */}
      <DieuLuatSheet
        isOpen={Boolean(selectedDieu)}
        onClose={() => setSelectedDieu(null)}
        data={selectedDieu}
      />
    </>
  );
}
