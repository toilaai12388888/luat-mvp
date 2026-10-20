"use client";

import React, { useState } from "react";
import { Flag, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { submitItemReport } from "@/lib/reports";

interface ReportButtonProps {
  itemId?: string;
}

const REPORT_REASONS = [
  "Đáp án sai",
  "Căn cứ điều luật sai hoặc hết hiệu lực",
  "Giải thích khó hiểu / chưa chính xác",
  "Khác",
] as const;

export function ReportButton({ itemId }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!itemId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await submitItemReport({
      itemId,
      reason,
      note,
    });

    setSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
        setNote("");
      }, 1800);
    } else {
      setError(res.error || "Không thể gửi báo cáo, vui lòng thử lại.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs text-ink-3 underline hover:text-ink-2 transition-colors cursor-pointer"
      >
        Báo sai
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-ink">
                <Flag size={16} className="text-danger" />
                <h3 className="text-sm font-bold">Báo sai câu hỏi</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="press flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 hover:text-ink"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={40} className="text-success mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-ink">Đã gửi báo cáo thành công</h4>
                <p className="text-xs text-ink-3 mt-1">
                  Cảm ơn bạn! Đội ngũ sẽ đối chiếu điều luật và cập nhật sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                <div className="text-[11px] text-ink-3 font-medium">
                  Mã câu: <span className="font-mono text-ink">{itemId}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink">Lý do báo sai:</label>
                  <div className="flex flex-col gap-1.5">
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs cursor-pointer transition-colors ${
                          reason === r
                            ? "border-navy-bar bg-navy-soft/30 text-ink font-semibold"
                            : "border-line bg-bg text-ink-2 hover:border-ink-3"
                        }`}
                      >
                        <input
                          type="radio"
                          name="report_reason"
                          value={r}
                          checked={reason === r}
                          onChange={(e) => setReason(e.target.value)}
                          className="accent-navy-bar"
                        />
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink">Ghi chú thêm (không bắt buộc):</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Theo Điều 117 BLDS 2015 thì..."
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-xs text-ink placeholder:text-ink-3 focus:border-navy-bar focus:outline-none resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-1.5 text-xs text-danger font-medium">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submitting}
                    className="font-bold min-w-24"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : "Gửi báo cáo"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
