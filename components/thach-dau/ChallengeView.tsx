"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Swords,
  Share2,
  Check,
  ArrowLeft,
  Users,
  } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TabBar } from "@/components/ui/TabBar";
import {
  Challenge,
  ChallengeResult,
  getChallenge,
  submitChallengeResult,
  getChallengeResults,
} from "@/lib/challenge";
import { getQuizItemById, QuizQuestion } from "@/lib/all-questions";
import { QuizItem, useQuizSession } from "@/components/quiz/useQuizSession";
import { QuizTopBar } from "@/components/quiz/QuizTopBar";
import { CheckBar } from "@/components/quiz/CheckBar";
import { FeedbackSheet } from "@/components/quiz/FeedbackSheet";
import { TrueFalseOptions } from "@/components/nhan-dinh/TrueFalseOptions";
import { getLocalPlayer, PlayerProfile } from "@/lib/player";
import { NicknameModal } from "@/components/auth/NicknameModal";

interface ChallengeViewProps {
  challengeId: string;
}

export function ChallengeView({ challengeId }: ChallengeViewProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showNickModal, setShowNickModal] = useState(false);
  const [player, setPlayer] = useState<PlayerProfile | null>(() => getLocalPlayer());

  useEffect(() => {
    let isMounted = true;
    getChallenge(challengeId).then((c) => {
      if (!isMounted) return;
      if (c) {
        setChallenge(c);
        const qList = c.itemIds
          .map((id) => getQuizItemById(id))
          .filter((q): q is QuizQuestion => q !== null);
        setQuestions(qList);
      }
    });
    getChallengeResults(challengeId).then((res) => {
      if (isMounted) setResults(res);
    });
    return () => {
      isMounted = false;
    };
  }, [challengeId]);

  const handleFinish = async (correctCount: number) => {
    setMyScore(correctCount);
    await submitChallengeResult(challengeId, correctCount);
    const updated = await getChallengeResults(challengeId);
    setResults(updated);
    setIsPlaying(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `⚔️ Thách đấu Luật Lẹ: Mình được ${challenge?.creatorScore || 10}/10 câu! Bạn có dám thử sức?`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Thách đấu Luật Lẹ", text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!challenge) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <Swords size={40} className="text-ink-3 mb-2 animate-bounce" />
        <h1 className="text-base font-bold text-ink">Đang tải phòng thách đấu...</h1>
        <p className="mt-1 text-xs text-ink-3">Vui lòng đợi trong giây lát</p>
      </div>
    );
  }

  // Quiz running screen
  if (isPlaying && questions.length > 0) {
    return (
      <ChallengeQuizRunner
        items={questions}
        onComplete={handleFinish}
        onExit={() => setIsPlaying(false)}
      />
    );
  }

  // Result screen (after taking challenge)
  const hasCompleted = myScore !== null;
  const isWinner = hasCompleted && myScore > challenge.creatorScore;
  const isTie = hasCompleted && myScore === challenge.creatorScore;

  return (
    <div className="flex min-h-screen flex-col pb-20">
      {/* Top Header */}
      <header className="border-b border-line bg-surface p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="press text-ink-2 hover:text-ink mr-1">
            <ArrowLeft size={20} />
          </Link>
          <Swords size={22} className="text-fire" />
          <h1 className="text-lg font-bold tracking-tight text-ink">Đấu trường Thách đấu</h1>
        </div>
        <Button onClick={handleShare} size="sm" variant="secondary" className="h-8 text-xs font-bold">
          {copied ? <Check size={14} className="text-good mr-1" /> : <Share2 size={14} className="mr-1" />}
          Chia sẻ
        </Button>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-5">
        {/* Challenge Matchup Card */}
        <Card className="p-6 border-line text-center flex flex-col items-center">
          <span className="text-xs font-bold text-navy-ink bg-navy-soft px-3 py-1 rounded-full mb-3">
            THÁCH ĐẤU 10 CÂU HỎI
          </span>

          <h2 className="text-base font-bold text-ink">
            {challenge.creatorNickname} ({challenge.creatorSchool})
          </h2>
          <p className="text-xs text-ink-3 mt-0.5">đã gửi lời thách thức tới bạn!</p>

          {/* Versus Display */}
          <div className="my-6 grid grid-cols-2 gap-4 w-full">
            {/* Creator Score */}
            <div className="flex flex-col items-center rounded-2xl border border-line bg-surface p-4">
              <span className="text-xs font-semibold text-ink-3">Người thách đấu</span>
              <span className="mt-1 text-3xl font-black text-navy-bar">
                {challenge.creatorScore}/10
              </span>
              <span className="text-[11px] font-bold text-ink-2 mt-1 truncate max-w-full">
                {challenge.creatorNickname}
              </span>
            </div>

            {/* Challenger Score */}
            <div
              className={`flex flex-col items-center rounded-2xl border p-4 transition-all ${
                hasCompleted
                  ? isWinner
                    ? "border-good bg-good-soft/30"
                    : isTie
                    ? "border-gold bg-gold-soft/30"
                    : "border-line bg-surface"
                  : "border-dashed border-line bg-bg-2"
              }`}
            >
              <span className="text-xs font-semibold text-ink-3">Điểm của bạn</span>
              <span className="mt-1 text-3xl font-black text-ink">
                {hasCompleted ? `${myScore}/10` : "?"}
              </span>
              <span className="text-[11px] font-bold text-ink-2 mt-1 truncate max-w-full">
                {player ? player.nickname : "Bạn"}
              </span>
            </div>
          </div>

          {/* Match Outcome Banner if finished */}
          {hasCompleted && (
            <div
              className={`mb-4 w-full rounded-2xl p-3 text-xs font-bold text-center ${
                isWinner
                  ? "bg-good-soft text-good border border-good/30"
                  : isTie
                  ? "bg-gold-soft text-gold-ink border border-gold/30"
                  : "bg-danger-soft text-danger border border-danger/30"
              }`}
            >
              {isWinner
                ? "🎉 XUẤT SẮC! BẠN ĐÃ CHIẾN THẮNG LỜI THÁCH ĐẤU!"
                : isTie
                ? "🤝 KẾT QUẢ HÒA! BẤT PHÂN THẮNG BẠI!"
                : "💪 CHƯA VƯỢT QUA ĐƯỢC ĐIỂM CỦA BẠN MÌNH. HÃY THỬ LẠI!"}
            </div>
          )}

          {/* Primary Action Button */}
          {!hasCompleted ? (
            <Button
              onClick={() => {
                if (!player) {
                  setShowNickModal(true);
                } else {
                  setIsPlaying(true);
                }
              }}
              className="w-full h-12 font-bold text-sm"
            >
              <Swords size={18} className="mr-2" />
              Chấp nhận thách đấu ngay!
            </Button>
          ) : (
            <Button
              onClick={() => setIsPlaying(true)}
              variant="secondary"
              className="w-full h-11 font-bold text-xs"
            >
              Thách đấu lại lần nữa
            </Button>
          )}
        </Card>

        {/* List of past challengers */}
        <div>
          <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
            <Users size={16} className="text-navy-bar" />
            Những người đã nhận lời thách đấu ({results.length})
          </h3>

          {results.length > 0 ? (
            <div className="flex flex-col gap-2">
              {results.map((res) => (
                <Card key={res.id} className="p-3.5 flex items-center justify-between border-line">
                  <div>
                    <span className="text-xs font-bold text-ink block">{res.nickname}</span>
                    <span className="text-[11px] text-ink-3">{res.school}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-navy-ink">{res.score}/10</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        res.score > challenge.creatorScore
                          ? "bg-good-soft text-good"
                          : res.score === challenge.creatorScore
                          ? "bg-gold-soft text-gold-ink"
                          : "bg-bg-2 text-ink-3"
                      }`}
                    >
                      {res.score > challenge.creatorScore
                        ? "Thắng"
                        : res.score === challenge.creatorScore
                        ? "Hòa"
                        : "Thua"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-6 text-center bg-surface/50">
              <p className="text-xs text-ink-3">
                Chưa có ai nhận lời thách đấu này. Hãy là người đầu tiên so tài!
              </p>
            </div>
          )}
        </div>
      </main>

      <TabBar />

      <NicknameModal
        isOpen={showNickModal}
        onClose={() => setShowNickModal(false)}
        onSuccess={(p) => {
          setPlayer(p);
          setIsPlaying(true);
        }}
      />
    </div>
  );
}

// Sub-component for interactive 10-question challenge runner
function ChallengeQuizRunner({
  items,
  onComplete,
  }: {
  items: QuizItem[];
  onComplete: (correctCount: number) => void;
  onExit?: () => void;
}) {
  const session = useQuizSession({
    items,
    onFinish: (results) => {
      const correct = results.filter((r) => r === "good").length;
      onComplete(correct);
    },
  });

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
          <span className="text-xs font-bold text-fire bg-gold-soft px-2.5 py-1 rounded-full">
            ⚔️ Thách đấu (10 câu)
          </span>
          <span className="text-xs font-semibold text-ink-3">
            Câu {session.currentIndex + 1}/10
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
