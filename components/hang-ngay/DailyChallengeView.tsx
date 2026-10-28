"use client";

import { SITE_URL } from "@/lib/config";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
    Share2,
  Copy,
  Download,
  CheckCircle2,
  XCircle,
  Flame,
  ArrowLeft,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TabBar } from "@/components/ui/TabBar";
import {
  getDailyRecord,
  getDailyQuestions,
  saveDailyRecord,
  formatWordleShareText,
  getTodayDateString,
  DailyResultRecord,
} from "@/lib/daily-challenge";
import { QuizItem, useQuizSession } from "@/components/quiz/useQuizSession";
import { QuizTopBar } from "@/components/quiz/QuizTopBar";
import { CheckBar } from "@/components/quiz/CheckBar";
import { FeedbackSheet } from "@/components/quiz/FeedbackSheet";
import { TrueFalseOptions } from "@/components/nhan-dinh/TrueFalseOptions";
import { getStoredStreak } from "@/lib/stats";
import { trackUsage } from "@/lib/usage";

export function DailyChallengeView() {
  const todayStr = getTodayDateString();
  const [record, setRecord] = useState<DailyResultRecord | null>(() => getDailyRecord(todayStr));
  const [questions] = useState<QuizItem[]>(() => getDailyQuestions(todayStr));
  const [copied, setCopied] = useState(false);
  const [streak, setStreak] = useState(() => getStoredStreak());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const handler = () => {
      setRecord(getDailyRecord(todayStr));
      setStreak(getStoredStreak());
    };
    window.addEventListener("luat_daily_updated", handler);
    return () => window.removeEventListener("luat_daily_updated", handler);
  }, [todayStr]);

  const handleFinish = (results: ("good" | "bad")[], answers: (number | "dung" | "sai")[]) => {
    const boolResults = results.map((r) => r === "good");
    const correctCount = boolResults.filter(Boolean).length;

    const newRecord: DailyResultRecord = {
      date: todayStr,
      completed: true,
      answers,
      results: boolResults,
      score: correctCount,
      total: 5,
      completedAt: new Date().toISOString(),
    };

    saveDailyRecord(newRecord);
    setRecord(newRecord);
    trackUsage("daily", 5, `daily_${todayStr}`);
  };

  const handleCopy = async () => {
    if (!record) return;
    const text = formatWordleShareText(record, streak);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Đã sao chép vào bộ nhớ tạm:\n" + text);
    }
  };

  const handleShare = async () => {
    if (!record) return;
    const text = formatWordleShareText(record, streak);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Thử thách hằng ngày Luật Lẹ",
          text,
          url: `${SITE_URL}/`,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadImage = () => {
    if (!record || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw Story card (1080 x 1920 px)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background Navy
    ctx.fillStyle = "#1e293b"; // Slate 800
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Inner card
    ctx.fillStyle = "#0f172a";
    ctx.roundRect(100, 260, 880, 1400, 48);
    ctx.fill();

    // Border
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 6;
    ctx.roundRect(100, 260, 880, 1400, 48);
    ctx.stroke();

    // Header Badge
    ctx.fillStyle = "#2563eb";
    ctx.roundRect(180, 340, 360, 70, 35);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText("⚖️ LUẬT LẸ DAILY", 215, 388);

    // Date
    const [, month, day] = record.date.split("-");
    ctx.fillStyle = "#94a3b8";
    ctx.font = "32px sans-serif";
    ctx.fillText(`Ngày ${day}/${month}`, 700, 388);

    // Main Score Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px sans-serif";
    ctx.fillText(`Thử thách: ${record.score}/5 đúng`, 180, 530);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(`+${record.score * 10} XP · Chuỗi 🔥 ${streak} ngày`, 180, 610);

    // Wordle Squares
    const squareSize = 120;
    const gap = 30;
    const startX = (1080 - (5 * squareSize + 4 * gap)) / 2;
    const startY = 720;

    record.results.forEach((isCorrect, idx) => {
      const x = startX + idx * (squareSize + gap);
      ctx.fillStyle = isCorrect ? "#10b981" : "#ef4444";
      ctx.roundRect(x, startY, squareSize, squareSize, 24);
      ctx.fill();

      // Check or cross text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isCorrect ? "✓" : "✗", x + squareSize / 2, startY + squareSize / 2);
    });

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    // Quote / Motivation
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "italic 36px sans-serif";
    ctx.fillText("“Học Luật thông minh — Vững vàng kỳ thi”", 180, 1000);

    // App URL & Branding
    ctx.fillStyle = "#64748b";
    ctx.font = "34px sans-serif";
    ctx.fillText("Ôn tập miễn phí mỗi ngày tại:", 180, 1480);

    ctx.fillStyle = "#60a5fa";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), 180, 1540);

    // Trigger download
    const link = document.createElement("a");
    link.download = `luat-le-daily-${record.date}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ==========================================
  // IF NOT COMPLETED TODAY: RUN QUIZ
  // ==========================================
  if (!record && questions.length > 0) {
    return (
      <DailyQuizRunner
        items={questions}
        onComplete={handleFinish}
        onExit={() => window.history.back()}
      />
    );
  }

  // ==========================================
  // ALREADY COMPLETED: SHOW WORDLE CARD & REVIEW
  // ==========================================
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <header className="border-b border-line bg-surface p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="press text-ink-2 hover:text-ink mr-1">
            <ArrowLeft size={20} />
          </Link>
          <Calendar size={22} className="text-navy-bar" />
          <h1 className="text-xl font-bold tracking-tight text-ink">Thử thách hằng ngày</h1>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-gold-ink bg-gold-soft px-2.5 py-1 rounded-full">
          <Flame size={14} className="fill-current text-fire" />
          {streak} ngày
        </span>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-5">
        {/* Wordle-style Card */}
        <Card className="p-6 border-line text-center flex flex-col items-center">
          <span className="text-xs font-bold text-navy-ink bg-navy-soft px-3 py-1 rounded-full">
            KẾT QUẢ NGÀY {todayStr.split("-").reverse().join("/")}
          </span>

          <h2 className="mt-4 text-3xl font-black text-ink">
            {record?.score} / {record?.total} câu đúng
          </h2>
          <p className="mt-1 text-xs font-bold text-good">
            +{((record?.score ?? 0) * 10)} XP đã cộng vào tài khoản
          </p>

          {/* 5 Squares */}
          <div className="my-5 flex items-center justify-center gap-2">
            {record?.results.map((res, i) => (
              <div
                key={i}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm transition-transform ${
                  res ? "bg-good" : "bg-danger"
                }`}
              >
                {res ? "✓" : "✗"}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 w-full mt-2">
            <Button
              onClick={handleShare}
              variant="primary"
              className="h-11 text-xs font-bold w-full"
            >
              <Share2 size={16} className="mr-1.5" />
              Chia sẻ Story
            </Button>

            <Button
              onClick={handleCopy}
              variant="secondary"
              className="h-11 text-xs font-bold w-full"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-1.5 text-good" /> Đã sao chép!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-1.5" /> Sao chép text
                </>
              )}
            </Button>
          </div>

          <Button
            onClick={handleDownloadImage}
            variant="ghost"
            className="mt-2 text-xs font-bold text-navy-ink"
          >
            <Download size={15} className="mr-1.5" />
            Tải ảnh Story (1080×1920)
          </Button>

          {/* Hidden Canvas for Story Export */}
          <canvas ref={canvasRef} className="hidden" />
        </Card>

        {/* Question Review List */}
        <div>
          <h3 className="text-sm font-bold text-ink mb-3">Xem lại 5 câu hỏi hôm nay:</h3>
          <div className="flex flex-col gap-3">
            {questions.map((q, idx) => {
              const isCorrect = record?.results[idx];
              return (
                <Card key={q.id} className="p-4 border-line">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-ink">Câu {idx + 1}</span>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-good font-bold">
                        <CheckCircle2 size={15} /> Đúng
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-danger font-bold">
                        <XCircle size={15} /> Sai
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-ink mb-2">
                    {q.question || q.statement}
                  </p>

                  <div className="rounded-xl bg-bg-2 p-3 text-xs flex flex-col gap-1 border border-line">
                    <div className="text-ink leading-relaxed">
                      <span className="font-bold text-navy-ink">Giải thích: </span>
                      {q.explanation}
                    </div>
                    <div className="text-navy-bar font-semibold mt-1">
                      Căn cứ: {q.can_cu?.map((r) => `${r.dieu} ${r.van_ban}`).join("; ") || ""}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <TabBar />
    </div>
  );
}

// Sub-component for interactive 5-question runner
function DailyQuizRunner({
  items,
  onComplete,
  onExit,
}: {
  items: QuizItem[];
  onComplete: (results: ("good" | "bad")[], answers: (number | "dung" | "sai")[]) => void;
  onExit?: () => void;
}) {
  void onExit;
  const [recordedAnswers, setRecordedAnswers] = useState<(number | "dung" | "sai")[]>([]);

  const session = useQuizSession({
    items,
    onFinish: (results) => {
      onComplete(results, recordedAnswers);
    },
  });

  const current = session.currentItem;
  if (!current) return null;

  const handleCheck = () => {
    if (session.selectedAnswer !== null) {
      setRecordedAnswers((prev) => [...prev, session.selectedAnswer!]);
    }
    session.checkAnswer();
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg">
      <QuizTopBar
        results={session.results}
        index={session.currentIndex}
        total={session.total}
        combo={session.combo}
        exitHref="/"
        currentItemId={current.id}
      />

      <main className="flex-1 overflow-y-auto p-4 pb-28">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-navy-ink bg-navy-soft px-2.5 py-1 rounded-full">
            Thử thách hằng ngày (5 câu)
          </span>
          <span className="text-xs font-semibold text-ink-3">
            Câu {session.currentIndex + 1}/5
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
              <p className="text-base font-medium text-ink leading-relaxed">{current.statement}</p>
            </div>

            <TrueFalseOptions
              selected={
                session.selectedAnswer === "dung" || session.selectedAnswer === "sai"
                  ? session.selectedAnswer
                  : null
              }
              onSelect={session.selectAnswer}
              disabled={session.status === "checked"}
            />
          </div>
        )}
      </main>

      <CheckBar
        status={session.status}
        hasSelection={session.selectedAnswer !== null}
        onCheck={handleCheck}
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
