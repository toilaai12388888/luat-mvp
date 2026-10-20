"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X, BookOpen, ShieldCheck } from "lucide-react";
import { searchDieuLuat, getAllDieuLuat, TraCuuDieuResult } from "@/lib/van-ban";
import { DieuLuatSheet } from "@/components/van-ban/DieuLuatSheet";
import { TabBar } from "@/components/ui/TabBar";

export default function TraCuuPage() {
  const [query, setQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<string>("all");
  const [selectedDieu, setSelectedDieu] = useState<TraCuuDieuResult | null>(null);

  const allItems = useMemo(() => getAllDieuLuat(), []);

  const filteredItems = useMemo(() => {
    let list = query.trim() ? searchDieuLuat(query) : allItems;
    if (selectedDoc !== "all") {
      list = list.filter((item) => item.vanBanSlug === selectedDoc);
    }
    return list;
  }, [query, selectedDoc, allItems]);

  const docCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allItems.length };
    for (const item of allItems) {
      counts[item.vanBanSlug] = (counts[item.vanBanSlug] || 0) + 1;
    }
    return counts;
  }, [allItems]);

  return (
    <div className="flex min-h-screen flex-col bg-bg pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="press flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-bg-2"
            aria-label="Về trang chủ"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-ink">Tra cứu điều luật</h1>
            <p className="text-[10px] text-ink-3">77 điều luật trích dẫn trong đề thi & bài tập</p>
          </div>
        </div>
      </header>

      {/* Main search and filter */}
      <main className="flex-1 p-4 space-y-3">
        {/* Search input */}
        <div className="relative w-full">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-3 text-ink-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo số điều (vd: 117), từ khóa, tên điều..."
            className="h-11 w-full rounded-2xl border border-line bg-surface pl-10 pr-10 text-xs text-ink placeholder:text-ink-3 focus:border-navy-bar focus:outline-none focus:ring-1 focus:ring-navy-bar"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="press absolute right-3 top-3 text-ink-3 hover:text-ink"
              aria-label="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedDoc("all")}
            className={`press flex-none rounded-xl px-3 py-1.5 font-semibold transition-colors ${
              selectedDoc === "all"
                ? "bg-navy-bar text-white shadow-sm"
                : "border border-line bg-surface text-ink-2 hover:bg-bg-2"
            }`}
          >
            Tất cả ({docCounts.all || 0})
          </button>
          <button
            onClick={() => setSelectedDoc("bo-luat-dan-su-2015")}
            className={`press flex-none rounded-xl px-3 py-1.5 font-semibold transition-colors ${
              selectedDoc === "bo-luat-dan-su-2015"
                ? "bg-navy-bar text-white shadow-sm"
                : "border border-line bg-surface text-ink-2 hover:bg-bg-2"
            }`}
          >
            BL Dân sự 2015 ({docCounts["bo-luat-dan-su-2015"] || 0})
          </button>
          <button
            onClick={() => setSelectedDoc("luat-xu-ly-vi-pham-hanh-chinh-2012")}
            className={`press flex-none rounded-xl px-3 py-1.5 font-semibold transition-colors ${
              selectedDoc === "luat-xu-ly-vi-pham-hanh-chinh-2012"
                ? "bg-navy-bar text-white shadow-sm"
                : "border border-line bg-surface text-ink-2 hover:bg-bg-2"
            }`}
          >
            Luật XLVPHC ({docCounts["luat-xu-ly-vi-pham-hanh-chinh-2012"] || 0})
          </button>
          <button
            onClick={() => setSelectedDoc("luat-doanh-nghiep-2020")}
            className={`press flex-none rounded-xl px-3 py-1.5 font-semibold transition-colors ${
              selectedDoc === "luat-doanh-nghiep-2020"
                ? "bg-navy-bar text-white shadow-sm"
                : "border border-line bg-surface text-ink-2 hover:bg-bg-2"
            }`}
          >
            Luật Doanh nghiệp ({docCounts["luat-doanh-nghiep-2020"] || 0})
          </button>
        </div>

        {/* Results count & status */}
        <div className="flex items-center justify-between text-[11px] text-ink-3 px-1">
          <span>Tìm thấy {filteredItems.length} điều luật</span>
          <span className="flex items-center gap-1 text-good">
            <ShieldCheck size={12} /> Nguyên văn hiện hành
          </span>
        </div>

        {/* List of articles */}
        <div className="space-y-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={`${item.vanBanSlug}-${item.dieuSo}`}
                onClick={() => setSelectedDieu(item)}
                className="press rounded-2xl border border-line bg-surface p-3.5 hover:border-navy-bar/40 hover:bg-bg-2/50 transition-all cursor-pointer flex flex-col gap-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-navy-soft px-2 py-0.5 text-xs font-bold text-navy-ink">
                      Điều {item.dieuSo}
                    </span>
                    <span className="font-bold text-sm text-ink">{item.ten}</span>
                  </div>
                  <BookOpen size={14} className="text-navy-bar flex-none opacity-80" />
                </div>

                <p className="text-xs text-ink-2 line-clamp-2 leading-relaxed">
                  {item.noiDung}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-line/40 text-[10px] text-ink-3">
                  <span>{item.vanBanTen} ({item.soHieu})</span>
                  <span className="text-navy-bar font-semibold hover:underline flex items-center gap-0.5">
                    Xem nguyên văn →
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-3 text-xs flex flex-col items-center">
              <BookOpen size={36} className="mb-2 opacity-30 text-navy-bar" />
              <p className="font-semibold text-ink text-sm">Không tìm thấy điều luật phù hợp</p>
              <p className="mt-1 max-w-xs text-ink-3">
                Thử tìm theo từ khóa khác hoặc bấm chọn tab văn bản cụ thể phía trên.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Slide-up DieuLuatSheet */}
      <DieuLuatSheet
        isOpen={Boolean(selectedDieu)}
        onClose={() => setSelectedDieu(null)}
        data={selectedDieu}
      />

      <TabBar />
    </div>
  );
}
