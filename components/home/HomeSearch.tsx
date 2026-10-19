"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { searchQuestions } from "@/lib/all-questions";

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const [closed, setClosed] = useState(false);

  const results = !closed && query.trim().length >= 2 ? searchQuestions(query).slice(0, 10) : [];
  const isOpen = !closed && query.trim().length >= 2;

  const handleClear = () => {
    setQuery("");
    setClosed(false);
  };

  return (
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
        <div className="absolute left-0 right-0 top-12 z-40 max-h-80 overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-xl animate-in fade-in duration-150">
          <div className="px-2 py-1 text-[11px] font-bold text-ink-3">
            Tìm thấy {results.length} kết quả phù hợp:
          </div>

          {results.length > 0 ? (
            <div className="flex flex-col gap-1">
              {results.map((res) => {
                const item = res.item;
                const targetUrl = `/mon/${item.subject}/${item.type === "mcq" ? "trac-nghiem" : "nhan-dinh"}/${item.chapter}`;
                return (
                  <Link
                    key={item.id}
                    href={targetUrl}
                    onClick={() => setClosed(true)}
                    className="press flex flex-col gap-1 rounded-xl p-2.5 text-left hover:bg-bg-2 transition-colors border-b border-line/40 last:border-b-0"
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

                    <p className="text-xs font-semibold text-ink line-clamp-2">
                      {item.cau_hoi || item.nhan_dinh}
                    </p>

                    <p className="text-[11px] text-ink-3 line-clamp-1 italic">
                      {item.giai_thich}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-ink-3">
              Không tìm thấy câu hỏi hoặc điều luật nào khớp với &quot;{query}&quot;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
