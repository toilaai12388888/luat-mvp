"use client";

import React, { useState, useEffect } from "react";
import { Chapter, Mcq } from "@/lib/content-schema";
import { useQuizSession } from "@/components/quiz/useQuizSession";
import { optionState } from "@/components/quiz/optionState";
import { QuizTopBar } from "@/components/quiz/QuizTopBar";
import { CheckBar } from "@/components/quiz/CheckBar";
import { FeedbackSheet } from "@/components/quiz/FeedbackSheet";
import { ResultScreen } from "@/components/quiz/ResultScreen";
import { getMyStats, UserStats } from "@/lib/stats";

interface McqQuizProps {
  chapter: Chapter;
}

export function McqQuiz({ chapter }: McqQuizProps) {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    getMyStats().then(setStats);
  }, []);

  const session = useQuizSession({
    items: chapter.trac_nghiem,
    subject: chapter.mon,
    itemType: "mcq",
  });

  const {
    current,
    index,
    total,
    selected,
    picked,
    isCorrect,
    results,
    combo,
    maxCombo,
    xpRun,
    lastGain,
    correctCount,
    wrongCount,
    finished,
    select,
    check,
    next,
    restart,
  } = session;

  const currentMcq = current as Mcq;
  const exitHref = `/mon/${chapter.mon}`;
  const keys = ["A", "B", "C", "D"];

  if (finished) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <ResultScreen
          correct={correctCount}
          total={total}
          xpRun={xpRun}
          maxCombo={maxCombo}
          wrongCount={wrongCount}
          streak={stats?.streak ?? 1}
          xpTotal={(stats?.xp ?? 0) + xpRun}
          onRetryWrong={() => restart(true)}
          switchHref={`/mon/${chapter.mon}/nhan-dinh/${chapter.chuong}`}
          switchLabel="Làm nhận định đúng / sai"
          backHref={exitHref}
        />
      </div>
    );
  }

  const answered = picked !== null;
  const subtitle = isCorrect
    ? combo >= 3
      ? `Combo x${combo}, câu này được 15 XP`
      : "Giữ nhịp này nhé"
    : `Đáp án đúng là ${keys[currentMcq.dap_an]}`;

  return (
    <div className="flex min-h-screen flex-col bg-bg pb-24">
      <QuizTopBar
        results={results}
        index={index}
        total={total}
        combo={combo}
        exitHref={exitHref}
      />

      <main className="flex-1 px-4 pt-4">
        {/* Kicker */}
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          Trắc nghiệm · Câu {index + 1} trên {total}
        </div>

        {/* Question */}
        <h1 className="mt-2 mb-6 text-xl font-semibold leading-snug tracking-[-0.01em] text-ink">
          {currentMcq.cau_hoi}
        </h1>

        {/* 4 Choices */}
        <div className="flex flex-col gap-3" role="radiogroup">
          {currentMcq.lua_chon.map((text, i) => {
            const state = optionState(i, selected, picked, currentMcq.dap_an);
            let cls = "border-line-2 bg-surface text-ink";
            let keyCls = "bg-bg-2 text-ink-2";

            if (state === "sel") {
              cls = "border-navy-bar bg-navy-soft shadow-[inset_0_0_0_1px_var(--navy-bar)] text-ink";
              keyCls = "bg-navy-bar text-on-navy";
            } else if (state === "good") {
              cls = "border-good bg-good-soft shadow-[inset_0_0_0_1px_var(--good)] animate-pop text-ink";
              keyCls = "bg-good text-white";
            } else if (state === "bad") {
              cls = "border-bad bg-bad-soft shadow-[inset_0_0_0_1px_var(--bad)] animate-shake text-ink";
              keyCls = "bg-bad text-white";
            } else if (state === "dim") {
              cls = "border-line bg-surface opacity-45";
              keyCls = "bg-bg-2 text-ink-3";
            }

            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => select(i)}
                className={`press flex w-full items-center gap-3.5 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-all ${cls} ${
                  answered ? "pointer-events-none" : "cursor-pointer"
                }`}
              >
                <span
                  className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold transition-colors ${keyCls}`}
                >
                  {keys[i]}
                </span>
                <span className="flex-1 text-[15px] leading-relaxed">{text}</span>
              </button>
            );
          })}
        </div>
      </main>

      {!answered && (
        <CheckBar disabled={selected === null} onCheck={check} />
      )}

      {answered && (
        <FeedbackSheet
          isCorrect={isCorrect}
          subtitle={subtitle}
          gain={lastGain}
          giaiThich={currentMcq.giai_thich}
          canCu={currentMcq.can_cu}
          itemId={currentMcq.id}
          isLast={index + 1 === total}
          onNext={next}
        />
      )}
    </div>
  );
}