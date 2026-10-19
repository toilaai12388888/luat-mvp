"use client";

import React, { useState, useEffect } from "react";
import { Timer, Award, Play, History,  } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TabBar } from "@/components/ui/TabBar";
import {
  MockTestConfig,
  MockTestResultRecord,
  getMockTestHistory,
  generateMockQuestions,
} from "@/lib/mock-test";
import { QuizQuestion } from "@/lib/all-questions";
import { MockTestRunner } from "./MockTestRunner";

export function ThiThuView() {
  const [config, setConfig] = useState<MockTestConfig>({
    subject: "all",
    chapter: "all",
    questionCount: 10,
  });

  const [history, setHistory] = useState<MockTestResultRecord[]>(() => getMockTestHistory());
  const [activeSession, setActiveSession] = useState<QuizQuestion[] | null>(null);

  useEffect(() => {
    const handleUpdate = () => setHistory(getMockTestHistory());
    window.addEventListener("luat_mock_history_updated", handleUpdate);
    return () => window.removeEventListener("luat_mock_history_updated", handleUpdate);
  }, []);

  const handleStart = () => {
    const questions = generateMockQuestions(config);
    if (questions.length === 0) {
      alert("Không tìm thấy câu hỏi phù hợp với bộ lọc đã chọn.");
      return;
    }
    setActiveSession(questions);
  };

  if (activeSession) {
    return (
      <MockTestRunner
        items={activeSession}
        config={config}
        onExit={() => {
          setActiveSession(null);
          setHistory(getMockTestHistory());
        }}
      />
    );
  }

  const durationMinutes = config.questionCount; // 1 min per question

  return (
    <div className="flex min-h-screen flex-col pb-20">
      {/* Header */}
      <header className="border-b border-line bg-surface p-4">
        <div className="flex items-center gap-2">
          <Timer size={22} className="text-navy-bar" />
          <h1 className="text-xl font-bold tracking-tight text-ink">Thi thử có giờ</h1>
        </div>
        <p className="mt-1 text-xs text-ink-2">
          Luyện đề áp lực thời gian thực tế (~1 phút/câu), chấm điểm thang 10 chuẩn đại học.
        </p>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-5">
        {/* Configuration Card */}
        <Card className="p-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-bar text-[11px] font-bold text-white">
              1
            </span>
            Thiết lập đề thi
          </h2>

          {/* Chọn Môn */}
          <div>
            <label className="text-xs font-semibold text-ink-2 block mb-2">Môn thi</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "all", label: "Tất cả các môn" },
                { id: "dan-su", label: "Dân sự" },
                { id: "hanh-chinh", label: "Hành chính" },
                { id: "doanh-nghiep", label: "Doanh nghiệp" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, subject: s.id as MockTestConfig["subject"] }))}
                  className={`press rounded-xl border p-2.5 text-xs font-medium text-left transition-colors ${
                    config.subject === s.id
                      ? "border-navy-bar bg-navy-soft text-navy-ink font-bold"
                      : "border-line bg-bg-2 text-ink hover:bg-bg-3"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Chương */}
          <div>
            <label className="text-xs font-semibold text-ink-2 block mb-2">Phạm vi kiến thức</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "all", label: "Toàn bộ" },
                { id: "c01", label: "Chương 1" },
                { id: "c02", label: "Chương 2" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, chapter: c.id as MockTestConfig["chapter"] }))}
                  className={`press rounded-xl border p-2.5 text-xs font-medium text-center transition-colors ${
                    config.chapter === c.id
                      ? "border-navy-bar bg-navy-soft text-navy-ink font-bold"
                      : "border-line bg-bg-2 text-ink hover:bg-bg-3"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Số câu */}
          <div>
            <label className="text-xs font-semibold text-ink-2 block mb-2">Số lượng câu & Thời gian</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 10, label: "10 câu", time: "10 phút" },
                { count: 20, label: "20 câu", time: "20 phút" },
                { count: 40, label: "40 câu", time: "40 phút" },
              ].map((q) => (
                <button
                  key={q.count}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, questionCount: q.count as MockTestConfig["questionCount"] }))}
                  className={`press flex flex-col items-center justify-center rounded-xl border p-2.5 transition-colors ${
                    config.questionCount === q.count
                      ? "border-navy-bar bg-navy-soft text-navy-ink font-bold"
                      : "border-line bg-bg-2 text-ink hover:bg-bg-3"
                  }`}
                >
                  <span className="text-xs font-bold">{q.label}</span>
                  <span className="text-[10px] text-ink-3">{q.time}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleStart}
            className="mt-2 h-12 w-full font-bold text-sm"
          >
            <Play size={16} className="mr-2 fill-current" />
            Bắt đầu thi ({config.questionCount} câu · {durationMinutes} phút)
          </Button>
        </Card>

        {/* Mock Test History */}
        <div>
          <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
            <History size={16} className="text-navy-bar" />
            Lịch sử thi gần đây ({history.length})
          </h2>

          {history.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {history.slice(0, 10).map((h) => {
                const isGreat = h.score >= 8.0;
                const isGood = h.score >= 6.5 && h.score < 8.0;
                return (
                  <Card key={h.id} className="p-3.5 flex items-center justify-between border-line">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">
                          {h.subject === "all"
                            ? "Tổng hợp các môn"
                            : h.subject === "dan-su"
                            ? "Dân sự"
                            : h.subject === "hanh-chinh"
                            ? "Hành chính"
                            : "Doanh nghiệp"}
                        </span>
                        <span className="text-[11px] text-ink-3">
                          · {h.totalQuestions} câu
                        </span>
                      </div>
                      <span className="text-[11px] text-ink-3 block mt-0.5">
                        {new Date(h.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span
                          className={`text-lg font-black ${
                            isGreat ? "text-good" : isGood ? "text-gold-ink" : "text-ink"
                          }`}
                        >
                          {h.score.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-ink-3 block">
                          {h.correctCount}/{h.totalQuestions} đúng
                        </span>
                      </div>
                      <span
                        className={`rounded-lg px-2 py-1 text-xs font-bold ${
                          isGreat
                            ? "bg-good-soft text-good"
                            : isGood
                            ? "bg-gold-soft text-gold-ink"
                            : "bg-bg-2 text-ink-2"
                        }`}
                      >
                        {isGreat ? "Giỏi" : isGood ? "Khá" : "Đạt"}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-6 text-center bg-surface/50">
              <Award size={32} className="mx-auto text-ink-3" />
              <p className="mt-2 text-xs text-ink-3">
                Chưa có kết quả thi thử nào. Hãy làm thử bài thi đầu tiên để ghi nhận điểm số!
              </p>
            </div>
          )}
        </div>
      </main>

      <TabBar />
    </div>
  );
}
