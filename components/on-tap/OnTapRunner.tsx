"use client";

import React from "react";
import { QuizItem, useQuizSession } from "@/components/quiz/useQuizSession";
import { QuizTopBar } from "@/components/quiz/QuizTopBar";
import { CheckBar } from "@/components/quiz/CheckBar";
import { FeedbackSheet } from "@/components/quiz/FeedbackSheet";
import { ResultScreen } from "@/components/quiz/ResultScreen";
import { TrueFalseOptions } from "@/components/nhan-dinh/TrueFalseOptions";

interface OnTapRunnerProps {
  title: string;
  items: QuizItem[];
  onExit: () => void;
}

export function OnTapRunner({ title, items, onExit }: OnTapRunnerProps) {
  const session = useQuizSession({
    items,
    onFinish: () => {},
  });

  if (session.isFinished) {
    return (
      <ResultScreen
        correct={session.correctCount}
        total={session.total}
        xpRun={session.totalXp}
        maxCombo={session.maxCombo}
        wrongCount={session.wrongCount}
        streak={1}
        onRetry={session.retry}
        onBack={onExit}
        backLabel="Về trang Ôn tập"
      />
    );
  }

  const current = session.currentItem;
  if (!current) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg">
      <QuizTopBar
        results={session.results}
        index={session.currentIndex}
        total={session.total}
        combo={session.combo}
        exitHref="#"
        currentItemId={current.id}
      />

      <main className="flex-1 overflow-y-auto p-4 pb-28">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-navy-ink bg-navy-soft px-2.5 py-1 rounded-full">
            {title}
          </span>
          <span className="text-xs font-semibold text-ink-3">
            {current.subject === "dan-su"
              ? "Dân sự"
              : current.subject === "hanh-chinh"
              ? "Hành chính"
              : "Doanh nghiệp"}
          </span>
        </div>

        {current.type === "mcq" ? (
          <div>
            <h2 className="text-base font-bold text-ink leading-relaxed mb-4">
              {current.question}
            </h2>
            <div className="flex flex-col gap-2.5">
              {current.options?.map((option, idx) => {
                const isSelected = session.selectedAnswer === idx;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => session.selectAnswer(idx)}
                    disabled={session.status === "checked"}
                    className={`press flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-navy-bar bg-navy-soft/60 text-navy-ink shadow-sm ring-1 ring-navy-bar"
                        : "border-line bg-surface text-ink hover:bg-bg-2"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 flex-none items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected
                          ? "bg-navy-bar text-white"
                          : "bg-bg-2 text-ink-2"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm font-medium leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="rounded-2xl border border-line bg-surface p-5 mb-5 shadow-sm">
              <span className="mb-2 inline-block rounded bg-gold-soft px-2 py-0.5 text-xs font-bold text-gold-ink">
                Nhận định đúng hay sai?
              </span>
              <p className="text-base font-medium text-ink leading-relaxed">
                {current.statement}
              </p>
            </div>

            <TrueFalseOptions
              selected={session.selectedAnswer === "dung" || session.selectedAnswer === "sai" ? session.selectedAnswer : null}
              onSelect={session.selectAnswer}
              disabled={session.status === "checked"}
            />
          </div>
        )}
      </main>

      <CheckBar
        status={session.status}
        hasSelection={session.selectedAnswer !== null}
        onCheck={session.checkAnswer}
        onContinue={session.nextQuestion}
      />

      <FeedbackSheet
        isOpen={session.status === "checked"}
        isCorrect={session.isCurrentCorrect}
        explanation={current.explanation}
        references={current.references}
        onContinue={session.nextQuestion}
      />
    </div>
  );
}
