"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { X, Flame, Volume2, VolumeX, Bookmark } from "lucide-react";
import { isSoundEnabled, setSoundEnabled } from "./sound";
import { isBookmarked, toggleBookmark } from "@/lib/attempts";

interface QuizTopBarProps {
  results: ("good" | "bad")[];
  index: number;
  total: number;
  combo: number;
  exitHref: string;
  currentItemId?: string;
}

export function QuizTopBar({
  results,
  index,
  total,
  combo,
  exitHref,
  currentItemId,
}: QuizTopBarProps) {
  const [sound, setSound] = useState(() => isSoundEnabled());
  const bookmarked = useSyncExternalStore(
    (cb) => {
      window.addEventListener("luat_bookmarks_updated", cb);
      return () => window.removeEventListener("luat_bookmarks_updated", cb);
    },
    () => (currentItemId ? isBookmarked(currentItemId) : false),
    () => false
  );

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
  };

  const handleToggleBookmark = () => {
    if (!currentItemId) return;
    toggleBookmark(currentItemId);
  };

  return (
    <header className="flex h-14 flex-none items-center justify-between gap-2 px-2 border-b border-line bg-surface">
      <Link
        href={exitHref}
        className="press flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-bg-2"
        aria-label="Thoát bài"
      >
        <X size={22} />
      </Link>

      {/* Progress Bars */}
      <div className="flex flex-1 items-center gap-1 px-1" role="progressbar" aria-label="Tiến độ bài">
        {Array.from({ length: total }).map((_, i) => {
          let color = "bg-line";
          if (i < results.length) {
            color = results[i] === "good" ? "bg-good" : "bg-bad";
          } else if (i === index) {
            color = "bg-ink-3";
          }
          return (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${color}`}
            />
          );
        })}
      </div>

      {/* Combo chip */}
      {combo >= 2 && (
        <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-xs font-bold text-gold-ink animate-pop">
          <Flame size={14} className="text-fire" fill="currentColor" />
          <span>x{combo}</span>
        </span>
      )}

      {/* Bookmark button */}
      {currentItemId && (
        <button
          type="button"
          onClick={handleToggleBookmark}
          className={`press flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            bookmarked ? "text-gold bg-gold-soft" : "text-ink-3 hover:text-ink hover:bg-bg-2"
          }`}
          aria-label={bookmarked ? "Bỏ đánh dấu câu hỏi" : "Đánh dấu câu hỏi"}
        >
          <Bookmark size={20} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      )}

      {/* Sound Toggle */}
      <button
        type="button"
        onClick={toggleSound}
        className="press flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-bg-2"
        aria-label={sound ? "Tắt âm thanh" : "Bật âm thanh"}
      >
        {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </header>
  );
}
