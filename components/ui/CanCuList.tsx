"use client";

import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { CanCu } from "@/lib/content-schema";
import { getDieuLuat, TraCuuDieuResult } from "@/lib/van-ban";
import { DieuLuatSheet } from "@/components/van-ban/DieuLuatSheet";

interface CanCuListProps {
  items: CanCu[];
}

export function CanCuList({ items }: CanCuListProps) {
  const [selected, setSelected] = useState<{
    data: TraCuuDieuResult | null;
    fallbackLink?: string;
    fallbackTitle?: string;
  } | null>(null);

  if (!items || items.length === 0) return null;

  const handleClick = (c: CanCu) => {
    const res = getDieuLuat(c.van_ban, c.dieu);
    setSelected({
      data: res,
      fallbackLink: c.link,
      fallbackTitle: `${c.dieu} · ${c.van_ban}`,
    });
  };

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(c)}
            className="press inline-flex items-center gap-1.5 rounded-lg border border-line-2 bg-surface px-3 py-1.5 text-xs font-medium text-navy-bar hover:bg-navy-soft/40 transition-colors cursor-pointer"
          >
            <BookOpen size={13} className="opacity-80" />
            <span>
              {c.dieu} · {c.van_ban}
            </span>
          </button>
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
