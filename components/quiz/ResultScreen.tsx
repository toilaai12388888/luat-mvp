"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Flame, Swords, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createChallenge } from "@/lib/challenge";
import { recordActivityToday } from "@/lib/push";

interface ResultScreenProps {
  correct: number;
  total: number;
  xpRun: number;
  maxCombo: number;
  wrongCount: number;
  streak: number;
  xpTotal?: number;
  itemIds?: string[];
  onRetryWrong?: () => void;
  onRestart?: () => void;
  switchHref?: string;
  switchLabel?: string;
  backHref?: string;
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
  totalXp?: number;
  correctCount?: number;
}

export function ResultScreen({
  correct: propCorrect,
  total,
  xpRun: propXpRun,
  maxCombo,
  wrongCount = 0,
  streak = 1,
  itemIds,
  onRetryWrong,
  switchHref,
  switchLabel,
  backHref = "/",
  onRetry,
  onBack,
  backLabel = "Về danh sách chương",
  totalXp,
  correctCount,
}: ResultScreenProps) {
  const correct = correctCount ?? propCorrect ?? 0;
  const xpRun = totalXp ?? propXpRun ?? 0;

  const pct = Math.round((correct / total) * 100);
  const strokeDashoffset = 402 * (1 - correct / total);

  const [challengeLink, setChallengeLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    recordActivityToday();
    const hasCompletedBefore = localStorage.getItem("luat_has_completed_quiz");
    if (!hasCompletedBefore) {
      localStorage.setItem("luat_has_completed_quiz", "true");
      window.dispatchEvent(new CustomEvent("luat_first_quiz_completed"));
    }
  }, []);

  let title = "Xong rồi!";
  let lead = "Hãy xem lại các câu sai để ghi nhớ điều luật nhé.";
  if (pct === 100) {
    title = "Xuất sắc!";
    lead = "Bạn đã trả lời chính xác tất cả các câu hỏi trong bài.";
  } else if (pct >= 70) {
    title = "Hoàn thành bài!";
    lead = "Kết quả rất tốt, hãy tiếp tục duy trì phong độ này.";
  }

  const handleCreateChallenge = async () => {
    if (!itemIds || itemIds.length === 0) return;
    setCreating(true);
    const id = await createChallenge(itemIds.slice(0, 10), correct);
    const url = `${window.location.origin}/thach-dau/${id}`;
    setChallengeLink(url);
    setCreating(false);

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Thách đấu Luật Lẹ",
          text: `Mình vừa đạt ${correct}/${total} câu môn Luật! Thách bạn vượt qua được mình đấy:`,
          url,
        });
      } catch {}
    }
  };

  const handleCopyLink = async () => {
    if (!challengeLink) return;
    await navigator.clipboard.writeText(challengeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="grid w-full grid-cols-3 gap-2 mb-6">
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

      {/* Challenge Link Banner if created */}
      {challengeLink && (
        <div className="mb-4 w-full rounded-2xl border border-fire/30 bg-gold-soft/40 p-3 text-left">
          <span className="text-xs font-bold text-fire block mb-1">⚔️ Link thách đấu của bạn:</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={challengeLink}
              className="h-8 flex-1 rounded-lg border border-line bg-surface px-2 text-xs text-ink truncate"
            />
            <Button onClick={handleCopyLink} size="sm" className="h-8 text-xs font-bold px-2.5">
              {copied ? <Check size={14} className="text-good" /> : <Copy size={14} />}
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex w-full flex-col gap-2.5">
        {/* FEATURE 9: THÁCH ĐẤU BẠN BÈ BUTTON */}
        {itemIds && itemIds.length >= 10 && !challengeLink && (
          <Button
            type="button"
            onClick={handleCreateChallenge}
            disabled={creating}
            className="bg-fire hover:bg-fire/90 border-fire text-white font-bold h-12"
          >
            <Swords size={18} className="mr-2" />
            {creating ? "Đang tạo link..." : "Thách đấu bạn bài này (10 câu)"}
          </Button>
        )}

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

        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Làm lại bài này
          </Button>
        )}

        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            {backLabel}
          </Button>
        ) : (
          <Link href={backHref}>
            <Button variant="ghost">{backLabel}</Button>
          </Link>
        )}
      </div>
    </main>
  );
}
