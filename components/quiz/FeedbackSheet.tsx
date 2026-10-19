import React from "react";
import { Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CanCuList } from "@/components/ui/CanCuList";
import { AiNote } from "@/components/ui/AiNote";
import { CanCu } from "@/lib/content-schema";


interface FeedbackSheetProps {
  isCorrect: boolean;
  subtitle: string;
  gain: number;
  giaiThich: string;
  canCu: CanCu[];
  itemId?: string;
  isLast: boolean;
  onNext: () => void;
}

export function FeedbackSheet({
  isCorrect,
  subtitle,
  gain,
  giaiThich,
  canCu,
  itemId,
  isLast,
  onNext,
}: FeedbackSheetProps) {
  const title = isCorrect ? "Chính xác" : "Chưa đúng";

  return (
    <section
      aria-live="polite"
      className={`fixed bottom-0 left-1/2 z-30 flex max-h-[460px] w-full max-w-[480px] -translate-x-1/2 flex-col rounded-t-3xl border-t p-4 shadow-xl backdrop-blur-md animate-rise ${
        isCorrect
          ? "border-good/30 bg-good-soft/95 text-good-ink"
          : "border-bad/30 bg-bad-soft/95 text-bad-ink"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 flex-none items-center justify-center rounded-full text-white ${
              isCorrect ? "bg-good" : "bg-bad"
            }`}
          >
            {isCorrect ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}
          </span>
          <div>
            <h2 className="text-lg font-bold leading-tight">{title}</h2>
            <p className="text-xs opacity-90">{subtitle}</p>
          </div>
        </div>

        {isCorrect && gain > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-xs font-bold text-gold-ink animate-pop">
            <Zap size={14} fill="currentColor" />
            <span>+{gain} XP</span>
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 text-sm text-ink leading-relaxed">
        <p>{giaiThich}</p>
        <CanCuList items={canCu} />
        <AiNote itemId={itemId} />
      </div>

      <div className="mt-4 pt-2">
        <Button
          variant={isCorrect ? "good" : "bad"}
          onClick={onNext}
        >
          {isLast ? "Xem kết quả" : "Tiếp tục"}
        </Button>
      </div>
    </section>
  );
}