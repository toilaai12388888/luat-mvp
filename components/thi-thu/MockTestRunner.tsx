"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Timer,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QuizQuestion } from "@/lib/all-questions";
import { MockTestConfig, saveMockTestResult } from "@/lib/mock-test";
import { saveAttempt } from "@/lib/attempts";
import { trackUsage } from "@/lib/usage";
import { TrueFalseOptions } from "@/components/nhan-dinh/TrueFalseOptions";

interface MockTestRunnerProps {
  items: QuizQuestion[];
  config: MockTestConfig;
  onExit: () => void;
}

export function MockTestRunner({ items, config, onExit }: MockTestRunnerProps) {
  const total = items.length;
  const initialSeconds = total * 60; // 1 min per question

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | "dung" | "sai">>({});
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    trackUsage("lesson", Object.keys(answers).length);

    let correct = 0;
    items.forEach((item, idx) => {
      const userAns = answers[idx];
      const isCorrect = userAns !== undefined && userAns === item.dap_an;
      if (isCorrect) correct++;

      saveAttempt({
        itemId: item.id,
        itemType: item.type,
        subject: item.subject,
        isCorrect,
        xp: isCorrect ? 10 : 0,
      });
    });

    const finalScore = (correct / total) * 10;
    setCorrectCount(correct);
    setScore(finalScore);

    const timeSpent = initialSeconds - timeLeft;
    saveMockTestResult({
      subject: config.subject,
      chapter: config.chapter,
      score: Math.round(finalScore * 10) / 10,
      correctCount: correct,
      totalQuestions: total,
      durationSeconds: timeSpent,
    });
  };

  // Countdown timer
  useEffect(() => {
    if (isSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted]);

  const handleSelectAnswer = (ans: number | "dung" | "sai") => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: ans }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const current = items[currentIndex];
  const answeredCount = Object.keys(answers).length;

  // ==========================================
  // RESULT & REVIEW SCREEN
  // ==========================================
  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col bg-bg pb-20">
        <header className="border-b border-line bg-surface p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={22} className="text-navy-bar" />
            <h1 className="text-lg font-bold text-ink">Kết quả bài thi</h1>
          </div>
          <button onClick={onExit} className="press text-sm font-semibold text-ink-2 hover:text-ink">
            Thoát
          </button>
        </header>

        <main className="flex-1 p-4 flex flex-col gap-5">
          {/* Score card */}
          <Card className="p-6 text-center border-line">
            <span className="text-xs font-bold text-ink-3 uppercase tracking-wider">
              Điểm thi (Thang điểm 10)
            </span>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-5xl font-black text-navy-ink">{score.toFixed(1)}</span>
              <span className="text-xl font-bold text-ink-3">/ 10</span>
            </div>

            <p className="mt-2 text-sm font-semibold text-ink">
              Đúng {correctCount} / {total} câu · Thời gian làm: {formatTime(initialSeconds - timeLeft)}
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Button onClick={() => {}} className="h-10 text-xs font-bold">
                <BookOpen size={15} className="mr-1.5" />
                Xem giải thích từng câu
              </Button>
              <Button onClick={onExit} variant="secondary" className="h-10 text-xs font-bold">
                Xong
              </Button>
            </div>
          </Card>

          {/* List of questions with correct/wrong status */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-ink">Chi tiết đáp án & căn cứ pháp lý:</h2>
            {items.map((item, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns !== undefined && userAns === item.dap_an;
              return (
                <Card
                  key={item.id}
                  className={`p-4 border ${isCorrect ? "border-good/30 bg-good-soft/20" : "border-danger/30 bg-danger-soft/20"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-ink">
                      Câu {idx + 1} ({item.subject === "dan-su" ? "Dân sự" : item.subject === "hanh-chinh" ? "Hành chính" : "Doanh nghiệp"})
                    </span>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-good">
                        <CheckCircle2 size={16} /> Đúng
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-danger">
                        <XCircle size={16} /> Sai
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-ink mb-3">{item.cau_hoi || item.nhan_dinh}</p>

                  <div className="rounded-xl bg-surface p-3 border border-line text-xs flex flex-col gap-1.5">
                    <div>
                      <span className="font-semibold text-ink-2">Bạn chọn: </span>
                      <span className={isCorrect ? "font-bold text-good" : "font-bold text-danger"}>
                        {userAns !== undefined
                          ? item.type === "mcq"
                            ? `${String.fromCharCode(65 + (userAns as number))}. ${item.lua_chon?.[userAns as number]}`
                            : userAns === "dung"
                            ? "ĐÚNG"
                            : "SAI"
                          : "Chưa chọn"}
                      </span>
                    </div>

                    {!isCorrect && (
                      <div>
                        <span className="font-semibold text-ink-2">Đáp án đúng: </span>
                        <span className="font-bold text-good">
                          {item.type === "mcq"
                            ? `${String.fromCharCode(65 + (item.dap_an as number))}. ${item.lua_chon?.[item.dap_an as number]}`
                            : item.dap_an === "dung"
                            ? "ĐÚNG"
                            : "SAI"}
                        </span>
                      </div>
                    )}

                    <div className="mt-1 text-ink leading-relaxed border-t border-line/60 pt-2">
                      <span className="font-bold text-navy-ink">Giải thích: </span>
                      {item.giai_thich}
                    </div>

                    <div className="text-navy-bar font-medium">
                      Căn cứ: {item.can_cu.map((r) => `${r.dieu} ${r.van_ban}`).join("; ")}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // IN-PROGRESS EXAM SCREEN
  // ==========================================
  const isUrgent = timeLeft < 60;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg">
      {/* Top Header */}
      <header className="flex h-14 flex-none items-center justify-between border-b border-line bg-surface px-4">
        <button
          type="button"
          onClick={() => {
            if (confirm("Bạn có chắc muốn dừng bài thi thử? Điểm số sẽ không được lưu.")) {
              onExit();
            }
          }}
          className="press flex h-9 w-9 items-center justify-center rounded-xl text-ink-2 hover:bg-bg-2"
          aria-label="Thoát"
        >
          <X size={20} />
        </button>

        {/* Timer countdown display */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-black transition-colors ${
            isUrgent ? "bg-danger text-white animate-pulse" : "bg-navy-soft text-navy-ink"
          }`}
        >
          <Timer size={15} />
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={() => {
            const unans = total - answeredCount;
            if (unans > 0) {
              if (confirm(`Còn ${unans} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`)) {
                handleSubmit();
              }
            } else {
              handleSubmit();
            }
          }}
          className="press rounded-xl bg-good px-3 py-1.5 text-xs font-bold text-white shadow-sm"
        >
          Nộp bài
        </button>
      </header>

      {/* Question palette scroll */}
      <div className="border-b border-line bg-surface px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {items.map((_, idx) => {
          const isAnswered = answers[idx] !== undefined;
          const isCur = idx === currentIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`press flex h-7 w-7 flex-none items-center justify-center rounded-lg text-xs font-bold transition-all ${
                isCur
                  ? "bg-navy-bar text-white ring-2 ring-navy-bar/40"
                  : isAnswered
                  ? "bg-navy-soft text-navy-ink font-semibold"
                  : "bg-bg-2 text-ink-3"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Body */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="mb-3 flex items-center justify-between text-xs text-ink-2">
          <span className="font-bold text-navy-bar">
            Câu {currentIndex + 1} / {total}
          </span>
          <span className="font-medium text-ink-3">
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
              {current.cau_hoi}
            </h2>
            <div className="flex flex-col gap-2.5">
              {current.lua_chon?.map((option, idx) => {
                const isSelected = answers[currentIndex] === idx;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAnswer(idx)}
                    className={`press flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-navy-bar bg-navy-soft/60 text-navy-ink shadow-sm ring-1 ring-navy-bar"
                        : "border-line bg-surface text-ink hover:bg-bg-2"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 flex-none items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected ? "bg-navy-bar text-white" : "bg-bg-2 text-ink-2"
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
              <p className="text-base font-medium text-ink leading-relaxed">{current.nhan_dinh}</p>
            </div>

            <TrueFalseOptions
              dungState={answers[currentIndex] === "dung" ? "sel" : "idle"}
              saiState={answers[currentIndex] === "sai" ? "sel" : "idle"}
              disabled={isSubmitted}
              onSelect={(ans) => handleSelectAnswer(ans)}
            />
          </div>
        )}
      </main>

      {/* Bottom Nav dock */}
      <footer className="fixed bottom-0 left-1/2 z-20 flex h-16 w-full max-w-[480px] -translate-x-1/2 items-center justify-between border-t border-line bg-surface px-4">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="press flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-ink disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Câu trước
        </button>

        <span className="text-xs font-medium text-ink-3">
          Đã làm {answeredCount}/{total} câu
        </span>

        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
          disabled={currentIndex === total - 1}
          className="press flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-navy-bar disabled:opacity-30"
        >
          Câu sau <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
}
