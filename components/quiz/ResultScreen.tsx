import React from "react";
import Link from "next/link";
import { Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ResultScreenProps {
  correct: number;
  total: number;
  xpRun: number;
  maxCombo: number;
  wrongCount: number;
  streak: number;
  xpTotal: number;
  loggedIn?: boolean;
  onRetryWrong?: () => void;
  onRestart?: () => void;
  switchHref?: string;
  switchLabel?: string;
  backHref: string;
}

export function ResultScreen({
  correct,
  total,
  xpRun,
  maxCombo,
  wrongCount,
  streak,
  onRetryWrong,
  switchHref,
  switchLabel,
  backHref,
}: ResultScreenProps) {
  const pct = Math.round((correct / total) * 100);
  const strokeDashoffset = 402 * (1 - correct / total);

  let title = "Xong rồi!";
  let lead = "Hãy xem lại các câu sai để ghi nhớ điều luật nhé.";
  if (pct === 100) {
    title = "Xuất sắc!";
    lead = "Bạn đã trả lời chính xác tất cả các câu hỏi trong bài.";
  } else if (pct >= 70) {
    title = "Hoàn thành bài!";
    lead = "Kết quả rất tốt, hãy tiếp tục duy trì phong độ này.";
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
      {/* Circle Score */}
      <div className="relative my-4 flex h-[156px] w-[156px] items-center justify-center" role="img" aria-label={`Đúng ${correct}/${total} câu`}>
        <svg width="156" height="156" viewBox="0 0 156 156" className="-rotate-90">
          <circle cx="78" cy="78" r="64" fill="none" stroke="var(--line)" strokeWidth="10" />
          <circle
            cx="78"
            cy="78"
            r="64"
            fill="none"
            stroke="var(--good)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="402"
            strokeDashoffset={strokeDashoffset}
            className="animate-draw"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-ink tabular-nums">{correct}/{total}</span>
          <span className="text-xs text-ink-3 font-semibold uppercase tracking-wider">câu đúng</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-1 mb-6 max-w-xs text-sm text-ink-2">{lead}</p>

      {/* 3 Metric Tiles */}
      <div className="grid w-full grid-cols-3 gap-2 mb-8">
        <div className="rounded-2xl border border-line bg-surface p-3 text-center">
          <span className="text-xs text-ink-3 block mb-1">XP nhận</span>
          <div className="flex items-center justify-center gap-1 font-bold text-base text-gold">
            <Zap size={16} fill="currentColor" />
            <span>+{xpRun}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3 text-center">
          <span className="text-xs text-ink-3 block mb-1">Combo max</span>
          <div className="font-bold text-base text-ink">
            <span>x{maxCombo}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3 text-center">
          <span className="text-xs text-ink-3 block mb-1">Chuỗi</span>
          <div className="flex items-center justify-center gap-1 font-bold text-base text-fire">
            <Flame size={16} fill="currentColor" />
            <span>{streak} ngày</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full flex-col gap-3">
        {switchHref && switchLabel && (
          <Link href={switchHref}>
            <Button variant="primary">{switchLabel}</Button>
          </Link>
        )}

        {wrongCount > 0 && onRetryWrong && (
          <Button variant="secondary" onClick={onRetryWrong}>
            Làm lại {wrongCount} câu sai
          </Button>
        )}

        <Link href={backHref}>
          <Button variant="ghost">Về danh sách chương</Button>
        </Link>
      </div>
    </main>
  );
}