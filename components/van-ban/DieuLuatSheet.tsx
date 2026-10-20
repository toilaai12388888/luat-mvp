"use client";

import React from "react";
import { BookOpen, ExternalLink, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TraCuuDieuResult } from "@/lib/van-ban";

interface DieuLuatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: TraCuuDieuResult | null;
  fallbackLink?: string;
  fallbackTitle?: string;
}

export function DieuLuatSheet({
  isOpen,
  onClose,
  data,
  fallbackLink,
  fallbackTitle,
}: DieuLuatSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[640px] rounded-t-3xl sm:rounded-3xl border border-line bg-surface flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250">
        {/* Header */}
        <header className="flex h-14 flex-none items-center justify-between border-b border-line px-5">
          <div className="flex items-center gap-2 text-navy-bar">
            <BookOpen size={18} />
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Nguyên văn điều luật
            </span>
          </div>
          <button
            onClick={onClose}
            className="press flex h-9 w-9 items-center justify-center rounded-xl text-ink-3 hover:text-ink"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {data ? (
            <>
              {/* Document metadata banner */}
              <div className="rounded-2xl border border-line bg-bg-2 p-3 text-xs flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{data.vanBanTen}</span>
                  <span className="rounded bg-navy-soft px-2 py-0.5 text-[11px] font-semibold text-navy-ink">
                    {data.soHieu}
                  </span>
                </div>
                {data.suaDoi && data.suaDoi.length > 0 && (
                  <div className="mt-1 text-[11px] text-ink-3">
                    <span className="font-medium text-ink-2">Văn bản sửa đổi, bổ sung: </span>
                    {data.suaDoi.map((s, idx) => (
                      <span key={idx}>
                        {idx > 0 && ", "}
                        {s.van_ban}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Article Heading */}
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Điều {data.dieuSo}. {data.ten}
                </h3>
              </div>

              {/* Verbatim content */}
              <div className="rounded-2xl border border-line-2 bg-surface p-4 text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line font-normal">
                {data.noiDung}
              </div>

              {/* Legal source copyright disclaimer */}
              <div className="rounded-xl border border-line bg-bg p-3 text-[11px] text-ink-3 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-ink-2">
                  <ShieldCheck size={13} className="text-good" />
                  Nguồn chính thức:
                </div>
                <p>
                  Văn bản: <span className="font-medium text-ink">{data.vanBanTen}</span> ({data.soHieu})
                </p>
                <p className="text-[10px] text-ink-3 italic leading-normal">
                  * Văn bản quy phạm pháp luật không thuộc đối tượng bảo hộ quyền tác giả theo quy định tại Điều 15 Luật Sở hữu trí tuệ.
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-ink-3 text-xs flex flex-col items-center">
              <BookOpen size={36} className="mb-2 opacity-40 text-navy-bar" />
              <p className="font-semibold text-ink text-sm">
                {fallbackTitle || "Điều luật chính thức"}
              </p>
              <p className="mt-1 max-w-xs text-ink-3">
                Nội dung chi tiết có thể được tra cứu trực tiếp từ văn bản gốc trên Thư Viện Pháp Luật.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <footer className="border-t border-line bg-surface p-3 px-5 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Đóng
          </Button>

          {(data?.link || fallbackLink) && (
            <a
              href={data?.link || fallbackLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="primary" size="sm" className="text-xs font-bold flex items-center gap-1.5">
                <span>Xem văn bản gốc</span>
                <ExternalLink size={13} />
              </Button>
            </a>
          )}
        </footer>
      </div>
    </div>
  );
}
