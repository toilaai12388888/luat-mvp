"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TinhHuong, TinhHuongBuoc } from "@/lib/content-schema";
import { saveAttempt } from "@/lib/attempts";
import { syncWeeklyXpToSupabase } from "@/lib/player";
import { saveSolvedScenario } from "@/lib/badges";
import { recordActivityToday } from "@/lib/push";
import { trackUsage } from "@/lib/usage";
import { CanCuList } from "@/components/ui/CanCuList";

interface TinhHuongRunnerProps {
  monSlug: string;
  monName: string;
  chuongSlug: string;
  chuongTitle: string;
  scenarios: TinhHuong[];
  exitHref: string;
}

export function TinhHuongRunner({
  monSlug,
  monName,
  chuongTitle,
  scenarios,
  exitHref,
}: TinhHuongRunnerProps) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isFinishedAll, setIsFinishedAll] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [stepResults, setStepResults] = useState<{ isCorrect: boolean; selected: number }[]>([]);

  const currentScenario = scenarios[scenarioIndex];
  const currentStep: TinhHuongBuoc | undefined = currentScenario?.buoc[stepIndex];

  useEffect(() => {
    recordActivityToday();
  }, []);

  if (!currentScenario) return null;

  const isStepCorrect =
    selectedOption !== null && currentStep && selectedOption === currentStep.dap_an;

  const handleCheck = () => {
    if (selectedOption === null || !currentStep) return;
    setIsChecked(true);

    const correct = selectedOption === currentStep.dap_an;
    setStepResults((prev) => [...prev, { isCorrect: correct, selected: selectedOption }]);

    // Record attempt for weakness & stats
    saveAttempt({
      itemId: `${currentScenario.id}-b${stepIndex + 1}`,
      itemType: "mcq",
      subject: monSlug as "dan-su" | "hanh-chinh" | "doanh-nghiep",
      isCorrect: correct,
      xp: correct ? 5 : 0,
    });
  };

  const handleNextStep = () => {
    setSelectedOption(null);
    setIsChecked(false);

    if (stepIndex < 2) {
      setStepIndex((prev) => prev + 1);
    } else {
      // Completed all 3 steps of current scenario
      setShowSummary(true);
      const scenarioXp = 15;
      setEarnedXp((prev) => prev + scenarioXp);
      saveSolvedScenario(currentScenario.id);
      syncWeeklyXpToSupabase(scenarioXp);
    }
  };

  const handleNextScenario = () => {
    setShowSummary(false);
    setSelectedOption(null);
    setIsChecked(false);
    setStepIndex(0);
    setStepResults([]);

    if (scenarioIndex + 1 < scenarios.length) {
      setScenarioIndex((prev) => prev + 1);
    } else {
      setIsFinishedAll(true);
      trackUsage("lesson", scenarios.reduce((sum, s) => sum + s.buoc.length, 0), `th_${monSlug}_${Date.now()}`);
    }
  };

  if (isFinishedAll) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-bg">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gold-soft text-gold shadow-lg mb-4 animate-pop">
          <Award size={44} />
        </div>

        <h1 className="text-2xl font-black text-ink">Hoàn thành bài tập tình huống!</h1>
        <p className="mt-2 text-sm text-ink-2 max-w-xs">
          Bạn đã rèn luyện phương pháp tư duy pháp lý 3 bước qua toàn bộ tình huống của {chuongTitle}.
        </p>

        <div className="my-6 flex items-center justify-center gap-4">
          <div className="rounded-2xl border border-line bg-surface p-3 text-center min-w-28">
            <span className="text-xs text-ink-3 block">Đã giải</span>
            <span className="text-xl font-bold text-good">{scenarios.length} tình huống</span>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-3 text-center min-w-28">
            <span className="text-xs text-ink-3 block">XP nhận</span>
            <span className="text-xl font-bold text-gold">+{earnedXp} XP</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full max-w-xs">
          <Link href={exitHref} className="w-full">
            <Button className="w-full h-12 font-bold text-sm">Quay lại danh sách chương</Button>
          </Link>
          <Button
            onClick={() => {
              setScenarioIndex(0);
              setStepIndex(0);
              setSelectedOption(null);
              setIsChecked(false);
              setShowSummary(false);
              setIsFinishedAll(false);
              setStepResults([]);
            }}
            variant="secondary"
            className="w-full h-12 font-bold text-sm"
          >
            <RotateCcw size={16} className="mr-1.5" />
            Làm lại từ đầu
          </Button>
        </div>
      </div>
    );
  }

  // Model Legal Analysis Memorandum (Lời giải mẫu ghép 3 bước)
  if (showSummary) {
    return (
      <div className="flex min-h-screen flex-col bg-bg pb-20">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-good" />
            <h2 className="text-sm font-bold text-ink">Lời giải mẫu ({stepResults.filter((r) => r.isCorrect).length}/3 bước đúng)</h2>
          </div>
          <span className="rounded-lg bg-gold-soft px-2.5 py-1 text-xs font-bold text-gold">
            +15 XP
          </span>
        </header>

        <main className="flex-1 p-4 space-y-4 max-w-[480px] mx-auto w-full">
          {/* Scenario Case statement */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs">
            <span className="text-[11px] font-bold text-navy-ink uppercase tracking-wider block mb-1">
              Đề bài tình huống
            </span>
            <h3 className="text-sm font-bold text-ink mb-2">{currentScenario.tieu_de}</h3>
            <p className="text-xs text-ink-2 leading-relaxed bg-bg-2 p-3 rounded-xl border border-line">
              {currentScenario.de_bai}
            </p>
          </div>

          {/* 3 Step Breakdown */}
          <div className="rounded-2xl border border-line bg-surface p-4 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-navy-bar font-bold text-xs uppercase tracking-wider border-b border-line pb-2">
              <FileText size={15} />
              Bản ghi nhớ phân tích pháp lý (3 bước)
            </div>

            {currentScenario.buoc.map((b, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="font-bold text-navy-ink flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-bar text-white text-[10px]">
                    {idx + 1}
                  </span>
                  {idx === 0
                    ? "Vấn đề pháp lý trọng tâm:"
                    : idx === 1
                    ? "Căn cứ pháp lý áp dụng:"
                    : "Kết luận và hướng xử lý:"}
                </div>

                <div className="rounded-xl border border-good/30 bg-good-soft/30 p-3 text-ink leading-relaxed">
                  <p className="font-semibold text-good-text mb-1">
                    ✓ {b.lua_chon[b.dap_an]}
                  </p>
                  <p className="text-[11px] text-ink-2">{b.giai_thich}</p>
                </div>

                <CanCuList items={b.can_cu} />
              </div>
            ))}
          </div>
        </main>

        <footer className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-surface p-3">
          <Button onClick={handleNextScenario} variant="primary" className="w-full h-11 font-bold text-xs">
            {scenarioIndex + 1 < scenarios.length
              ? `Tiếp tục tình huống ${scenarioIndex + 2}/${scenarios.length} →`
              : "Hoàn thành toàn bộ tình huống"}
          </Button>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface px-4 backdrop-blur-md">
        <Link
          href={exitHref}
          className="press flex h-9 w-9 items-center justify-center rounded-xl text-ink-2 hover:bg-bg-2"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="text-center">
          <span className="text-xs font-bold text-navy-ink block truncate max-w-[200px]">
            {monName}
          </span>
          <span className="text-[10px] text-ink-3">
            Tình huống {scenarioIndex + 1}/{scenarios.length} · Bước {stepIndex + 1}/3
          </span>
        </div>

        <div className="flex items-center gap-1 text-gold text-xs font-bold">
          <Sparkles size={14} />
          <span>+15 XP</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 space-y-3.5 max-w-[480px] mx-auto w-full">
        {/* Pinned Case Statement (Đề bài ghim trên cùng) */}
        <div className="rounded-2xl border border-navy-bar/30 bg-surface p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="rounded bg-navy-soft px-2 py-0.5 text-[10px] font-bold text-navy-ink uppercase">
              Tình huống {scenarioIndex + 1}
            </span>
            <span className="text-[10px] font-semibold text-ink-3">
              Bước {stepIndex + 1} của 3
            </span>
          </div>

          <h2 className="text-sm font-bold text-ink mb-1.5">{currentScenario.tieu_de}</h2>
          <p className="text-xs text-ink-2 leading-relaxed bg-bg-2 p-3 rounded-xl border border-line">
            {currentScenario.de_bai}
          </p>
        </div>

        {/* Step Progress Pill Indicator */}
        <div className="grid grid-cols-3 gap-1.5">
          {["1. Vấn đề pháp lý", "2. Chọn căn cứ", "3. Kết luận"].map((label, idx) => (
            <div
              key={idx}
              className={`rounded-xl border py-1.5 text-center text-[11px] font-semibold transition-all ${
                idx === stepIndex
                  ? "border-navy-bar bg-navy-soft text-navy-ink shadow-xs"
                  : idx < stepIndex
                  ? "border-good/40 bg-good-soft/40 text-good-text"
                  : "border-line bg-surface text-ink-3"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Current Step Question & Options */}
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-ink leading-relaxed">
            {currentStep?.hoi}
          </h3>

          <div className="flex flex-col gap-2">
            {currentStep?.lua_chon.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectTarget = currentStep.dap_an === idx;

              let style = "border-line bg-bg hover:border-navy-bar/40 text-ink";
              if (isChecked) {
                if (isCorrectTarget) {
                  style = "border-good bg-good-soft text-good-text font-semibold";
                } else if (isSelected && !isCorrectTarget) {
                  style = "border-danger bg-danger-soft text-danger font-semibold";
                } else {
                  style = "border-line bg-bg opacity-50 text-ink-3";
                }
              } else if (isSelected) {
                style = "border-navy-bar bg-navy-soft/60 text-navy-ink font-semibold ring-1 ring-navy-bar";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isChecked}
                  onClick={() => setSelectedOption(idx)}
                  className={`press flex items-start gap-2.5 rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${style}`}
                >
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${
                      isChecked && isCorrectTarget
                        ? "bg-good text-white"
                        : isChecked && isSelected
                        ? "bg-danger text-white"
                        : isSelected
                        ? "bg-navy-bar text-white"
                        : "bg-bg-2 text-ink-3"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback Sheet inside card after check */}
          {isChecked && currentStep && (
            <div
              className={`rounded-xl border p-3 text-xs animate-in fade-in duration-200 ${
                isStepCorrect
                  ? "border-good/40 bg-good-soft/30"
                  : "border-danger/40 bg-danger-soft/30"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1.5">
                {isStepCorrect ? (
                  <>
                    <CheckCircle2 size={16} className="text-good" />
                    <span className="text-good-text">Chính xác!</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-danger" />
                    <span className="text-danger">Chưa chính xác!</span>
                  </>
                )}
              </div>

              <p className="text-ink-2 leading-relaxed text-[11px] mb-2">
                {currentStep.giai_thich}
              </p>

              <div className="pt-1 border-t border-line/40">
                <span className="text-[10px] font-semibold text-ink-3 block mb-1">
                  Căn cứ điều luật:
                </span>
                <CanCuList items={currentStep.can_cu} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-surface p-3">
        {!isChecked ? (
          <Button
            type="button"
            onClick={handleCheck}
            disabled={selectedOption === null}
            variant="primary"
            className="w-full h-11 font-bold text-xs"
          >
            Kiểm tra câu trả lời
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNextStep}
            variant="primary"
            className="w-full h-11 font-bold text-xs flex items-center justify-center gap-1"
          >
            <span>{stepIndex < 2 ? "Bước tiếp theo" : "Xem lời giải mẫu tổng hợp"}</span>
            <ChevronRight size={16} />
          </Button>
        )}
      </footer>
    </div>
  );
}
