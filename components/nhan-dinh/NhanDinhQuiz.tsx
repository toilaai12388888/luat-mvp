"use client";

import React, { useState, useEffect } from "react";
import { Chapter, NhanDinh } from "@/lib/content-schema";
import { useQuizSession } from "@/components/quiz/useQuizSession";
import { optionState } from "@/components/quiz/optionState";
import { QuizTopBar } from "@/components/quiz/QuizTopBar";
import { CheckBar } from "@/components/quiz/CheckBar";
import { FeedbackSheet } from "@/components/quiz/FeedbackSheet";
import { ResultScreen } from "@/components/quiz/ResultScreen";
import { NhanDinhCard } from "./NhanDinhCard";
import { TrueFalseOptions } from "./TrueFalseOptions";
import { getMyStats, UserStats } from "@/lib/stats";

interface NhanDinhQuizProps {
  chapter: Chapter;
}

export function NhanDinhQuiz({ chapter }: NhanDinhQuizProps) {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    getMyStats().then(setStats);
  }, []);

  const session = useQuizSession({
    items: chapter.nhan_dinh,
    subject: chapter.mon,
    itemType: "nhan_dinh",
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

  const currentNd = current as NhanDinh;
  const exitHref = `/mon/${chapter.mon}`;

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
          switchHref={`/mon/${chapter.mon}/trac-nghiem/${chapter.chuong}`}
          switchLabel="Làm trắc nghiệm"
          backHref={exitHref}
        />
      </div>
    );
  }

  const answered = picked !== null;
  const subtitle = `Nhận định này ${currentNd.dap_an === "dung" ? "đúng" : "sai"}.`;
  const dungState = optionState("dung", selected, picked, currentNd.dap_an);
  const saiState = optionState("sai", selected, picked, currentNd.dap_an);

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
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-3">
          Nhận định · Câu {index + 1} trên {total}
        </div>

        <NhanDinhCard statement={currentNd.nhan_dinh} />

        <TrueFalseOptions
          dungState={dungState}
          saiState={saiState}
          disabled={answered}
          onSelect={(val) => select(val)}
        />
      </main>

      {!answered && (
        <CheckBar disabled={selected === null} onCheck={check} />
      )}

      {answered && (
        <FeedbackSheet
          isCorrect={isCorrect}
          subtitle={subtitle}
          gain={lastGain}
          giaiThich={currentNd.giai_thich}
          canCu={currentNd.can_cu}
          itemId={currentNd.id}
          isLast={index + 1 === total}
          onNext={next}
        />
      )}
    </div>
  );
}