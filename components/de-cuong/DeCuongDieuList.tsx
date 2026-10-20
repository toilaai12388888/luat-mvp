"use client";

import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { DieuHayRaDe } from "@/lib/content-schema";
import { getDieuLuat, TraCuuDieuResult } from "@/lib/van-ban";
import { DieuLuatSheet } from "@/components/van-ban/DieuLuatSheet";

interface DeCuongDieuListProps {
  items: DieuHayRaDe[];
  monSlug: string;
}

export function DeCuongDieuList({ items, monSlug }: DeCuongDieuListProps) {
  const [selected, setSelected] = useState<{
    data: TraCuuDieuResult | null;
    fallbackLink?: string;
    fallbackTitle?: string;
  } | null>(null);

  const handleClick = (d: DieuHayRaDe) => {
    const res = getDieuLuat(d.van_ban || monSlug, d.dieu);
    setSelected({
      data: res,
      fallbackLink: d.link,
      fallbackTitle: `${d.dieu} · ${d.ten}`,
    });
  };

  return (
    <>
      <div className="divide-y divide-line rounded-2xl border border-line bg-surface overflow-hidden">
        {items.map((d, i) => (
          <div
            key={i}
            onClick={() => handleClick(d)}
            className="press flex items-start gap-3 p-4 hover:bg-bg-2/60 transition-colors cursor-pointer"
          >
            <span className="flex-none rounded-lg bg-navy-soft px-2.5 py-1 text-xs font-bold text-navy-ink flex items-center gap-1">
              <BookOpen size={12} className="opacity-75" />
              {d.dieu}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-ink">{d.ten}</span>
                <span className="text-xs text-navy-bar font-semibold hover:underline flex-none">
                  Nguyên văn →
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-2 leading-normal">{d.ghi_chu}</p>
            </div>
          </div>
        ))}
      </div>

      <DieuLuatSheet
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        data={selected?.data || null}
        fallbackLink={selected?.fallbackLink}
        fallbackTitle={selected?.fallbackTitle}
      />
    </>
  );
}
