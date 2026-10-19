"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DieuHayRaDe } from "@/lib/content-schema";
import { saveAttempt } from "@/lib/attempts";

interface FlashcardRunnerProps {
  monName: string;
  chuongTitle: string;
  cards: DieuHayRaDe[];
  exitHref: string;
}

export function FlashcardRunner({
  monName,
  chuongTitle,
  cards,
  exitHref,
}: FlashcardRunnerProps) {
  const [queue, setQueue] = useState<DieuHayRaDe[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
      const [isFinished, setIsFinished] = useState(false);

  const current = queue[currentIndex];

  const handleNext = (remembered: boolean) => {
    setIsFlipped(false);

    if (remembered) {
            // Advance
      if (currentIndex + 1 >= queue.length) {
        finishSession();
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
            // Re-insert current card at end of queue for repetition
      setQueue((prev) => [...prev, current]);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const finishSession = () => {
    setIsFinished(true);
    // Award XP
    saveAttempt({
      itemId: `fc-${Date.now()}`,
      itemType: "mcq",
      subject: monName.includes("Dân sự")
        ? "dan-su"
        : monName.includes("Hành chính")
        ? "hanh-chinh"
        : "doanh-nghiep",
      isCorrect: true,
      xp: 20,
    });
  };

  if (isFinished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-bg">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gold-soft text-gold shadow-lg mb-4 animate-pop">
          <Award size={44} />
        </div>

        <h1 className="text-2xl font-black text-ink">Đã thuộc các điều luật!</h1>
        <p className="mt-2 text-sm text-ink-2 max-w-xs">
          Bạn đã rèn luyện xong toàn bộ {cards.length} điều luật trọng tâm của {chuongTitle}.
        </p>

        <div className="my-6 flex items-center justify-center gap-4">
          <div className="rounded-2xl border border-line bg-surface p-3 text-center min-w-24">
            <span className="text-xs text-ink-3 block">Nhớ ngay</span>
            <span className="text-xl font-bold text-good">{cards.length} điều</span>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-3 text-center min-w-24">
            <span className="text-xs text-ink-3 block">Thưởng</span>
            <span className="text-xl font-bold text-gold">+20 XP</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Link href={exitHref} className="w-full">
            <Button className="w-full h-12 font-bold text-sm">Quay lại Đề cương</Button>
          </Link>
          <Button
            onClick={() => {
              setQueue(cards);
              setCurrentIndex(0);
              setIsFinished(false);
              
            }}
            variant="secondary"
            className="w-full h-12 font-bold text-sm"
          >
            Luyện tập lại
          </Button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="flex h-screen flex-col bg-bg">
      {/* Top Header */}
      <header className="flex h-14 flex-none items-center justify-between border-b border-line bg-surface px-4">
        <Link
          href={exitHref}
          className="press flex h-9 w-9 items-center justify-center rounded-xl text-ink-2 hover:bg-bg-2"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="text-center">
          <span className="text-xs font-bold text-navy-ink block">{monName}</span>
          <span className="text-[10px] text-ink-3">
            Thẻ {currentIndex + 1} / {queue.length}
          </span>
        </div>

        <div className="w-9" />
      </header>

      {/* Main Flashcard area */}
      <main className="flex-1 p-5 flex flex-col justify-center items-center">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`press relative w-full max-w-sm h-80 rounded-3xl border p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-md ${
            isFlipped
              ? "border-navy-bar bg-surface text-ink ring-2 ring-navy-bar/20"
              : "border-line bg-surface text-ink hover:border-navy-bar/40"
          }`}
        >
          {/* Top tag */}
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isFlipped
                  ? "bg-navy-soft text-navy-ink"
                  : "bg-bg-2 text-ink-3"
              }`}
            >
              {isFlipped ? "Mặt sau · Tóm tắt nội dung" : "Mặt trước · Tên điều"}
            </span>
            <RotateCw size={16} className="text-ink-3" />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center text-center my-3">
            {!isFlipped ? (
              <div>
                <span className="text-xs font-bold text-navy-bar uppercase tracking-wider block mb-2">
                  {current.van_ban}
                </span>
                <h2 className="text-2xl font-black text-ink mb-2">{current.dieu}</h2>
                <p className="text-base font-semibold text-ink-2">{current.ten}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-navy-ink mb-3">{current.ten}</h3>
                <p className="text-sm font-medium text-ink leading-relaxed">
                  {current.ghi_chu}
                </p>
                {current.link && (
                  <a
                    href={current.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-navy-bar hover:underline mt-4"
                  >
                    Xem văn bản gốc <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Bottom Hint */}
          <div className="text-center text-[11px] text-ink-3">
            {isFlipped ? "Chọn 'Nhớ rồi' hoặc 'Chưa nhớ' bên dưới" : "Chạm vào thẻ để lật xem nội dung cốt lõi"}
          </div>
        </div>
      </main>

      {/* Action buttons */}
      <footer className="border-t border-line bg-surface p-4 flex items-center gap-3">
        <Button
          onClick={() => handleNext(false)}
          variant="secondary"
          className="flex-1 h-12 text-sm font-bold text-danger border-danger/30 hover:bg-danger-soft"
        >
          <XCircle size={18} className="mr-1.5" />
          Chưa nhớ (lặp lại)
        </Button>

        <Button
          onClick={() => handleNext(true)}
          variant="primary"
          className="flex-1 h-12 text-sm font-bold bg-good hover:bg-good-hover border-good text-white"
        >
          <CheckCircle2 size={18} className="mr-1.5" />
          Nhớ rồi!
        </Button>
      </footer>
    </div>
  );
}
