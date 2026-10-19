"use client";

import React, { useState } from "react";
import { Check, X, Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CanCuList } from "@/components/ui/CanCuList";
import { AiNote } from "@/components/ui/AiNote";
import { CanCu } from "@/lib/content-schema";
import { CommentModal } from "@/components/comments/CommentModal";

export interface FeedbackSheetProps {
  isCorrect: boolean;
  subtitle?: string;
  gain?: number;
  giaiThich?: string;
  canCu?: CanCu[];
  itemId?: string;
  isLast?: boolean;
  onNext?: () => void;
  isOpen?: boolean;
  explanation?: string;
  references?: CanCu[];
  onContinue?: () => void;
}

export function FeedbackSheet({
  isCorrect,
  subtitle,
  gain = 10,
  giaiThich,
  canCu,
  itemId,
  isLast = false,
  onNext,
  isOpen = true,
  explanation,
  references,
  onContinue,
}: FeedbackSheetProps) {
  const [showComments, setShowComments] = useState(false);
  const title = isCorrect ? "Chính xác" : "Chưa đúng";
  const displayExplanation = giaiThich || explanation || "";
  const displayCanCu = canCu || references || [];
  const handleNext = onNext || onContinue || (() => {});
  const displaySubtitle = subtitle || (isCorrect ? `+${gain} XP` : "Xem giải thích chi tiết");

  if (!isOpen) return null;

  return (
    <>
      <section
        aria-live="polite"
        className={`fixed bottom-0 left-1/2 z-30 flex max-h-[460px] w-full max-w-[480px] -translate-x-1/2 flex-col rounded-t-2xl border-t border-line bg-surface p-5 shadow-2xl backdrop-blur-md ${
          isCorrect ? "border-good/30 bg-good-soft/95" : "border-danger/30 bg-danger-soft/95"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                isCorrect ? "bg-good text-white" : "bg-danger text-white"
              }`}
            >
              {isCorrect ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">{title}</h3>
              <p className="text-xs text-ink-2">{displaySubtitle}</p>
            </div>
          </div>
          {gain > 0 && isCorrect && (
            <div className="flex items-center gap-1 text-xs font-bold text-navy-ink">
              <Zap size={14} className="fill-current" />
              +{gain} XP
            </div>
          )}
        </div>

        <div className="my-3 flex-1 overflow-y-auto rounded-xl border border-line bg-surface/90 p-3.5 text-xs text-ink">
          <p className="mb-2 font-medium leading-relaxed">{displayExplanation}</p>
          {displayCanCu.length > 0 && (
            <div className="mt-2 border-t border-line/60 pt-2">
              <span className="mb-1 block font-semibold text-ink-2">Căn cứ pháp lý:</span>
              <CanCuList items={displayCanCu} />
            </div>
          )}
          <AiNote />
        </div>

        <div className="flex items-center gap-2">
          {itemId && (
            <Button
              variant="secondary"
              className="flex items-center gap-1.5 px-3"
              onClick={() => setShowComments(true)}
            >
              <MessageSquare size={16} />
              <span className="text-xs font-semibold">Thảo luận</span>
            </Button>
          )}

          <Button variant="primary" className="flex-1" onClick={handleNext}>
            {isLast ? "Hoàn thành" : "Tiếp tục"}
          </Button>
        </div>
      </section>

      {itemId && (
        <CommentModal
          itemId={itemId}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
}
