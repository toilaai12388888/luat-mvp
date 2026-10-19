"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Bookmark,
  AlertCircle,
  Play,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TabBar } from "@/components/ui/TabBar";
import { getActiveWrongIds, getBookmarkedIds, getWrongItemState } from "@/lib/attempts";
import { getQuizItemById, QuizQuestion } from "@/lib/all-questions";
import { OnTapRunner } from "./OnTapRunner";

export function OnTapView() {
  const [activeWrongIds, setActiveWrongIds] = useState<string[]>(() => getActiveWrongIds());
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => getBookmarkedIds());
  const [sessionItems, setSessionItems] = useState<QuizQuestion[] | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [activeTab, setActiveTab] = useState<"cau_sai" | "danh_dau">("cau_sai");

  const refreshData = () => {
    setActiveWrongIds(getActiveWrongIds());
    setBookmarkedIds(getBookmarkedIds());
  };

  useEffect(() => {
    const handleUpdate = () => {
      setActiveWrongIds(getActiveWrongIds());
      setBookmarkedIds(getBookmarkedIds());
    };
    window.addEventListener("luat_attempts_updated", handleUpdate);
    window.addEventListener("luat_bookmarks_updated", handleUpdate);
    return () => {
      window.removeEventListener("luat_attempts_updated", handleUpdate);
      window.removeEventListener("luat_bookmarks_updated", handleUpdate);
    };
  }, []);

  // Prepare items
  const wrongQuestions = activeWrongIds
    .map((id) => getQuizItemById(id))
    .filter((q): q is QuizQuestion => q !== null);

  const bookmarkedQuestions = bookmarkedIds
    .map((id) => getQuizItemById(id))
    .filter((q): q is QuizQuestion => q !== null);

  const startPractice = (type: "cau_sai" | "danh_dau") => {
    const items = type === "cau_sai" ? wrongQuestions : bookmarkedQuestions;
    if (items.length === 0) return;
    setSessionTitle(type === "cau_sai" ? "Ôn câu sai cần phục thù" : "Ôn câu đã đánh dấu");
    setSessionItems(items);
  };

  if (sessionItems) {
    return (
      <OnTapRunner
        title={sessionTitle}
        items={sessionItems}
        onExit={() => {
          setSessionItems(null);
          refreshData();
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      {/* Header */}
      <header className="border-b border-line bg-surface p-4">
        <div className="flex items-center gap-2">
          <RotateCcw size={22} className="text-navy-bar" />
          <h1 className="text-xl font-bold tracking-tight text-ink">Ôn tập thông minh</h1>
        </div>
        <p className="mt-1 text-xs text-ink-2">
          Luyện tập lại các câu đã làm sai hoặc đánh dấu quan trọng để khắc sâu kiến thức.
        </p>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-5">
        {/* Quick action cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Wrong items card */}
          <div
            onClick={() => wrongQuestions.length > 0 && startPractice("cau_sai")}
            className={`press flex flex-col justify-between rounded-2xl border p-4 transition-all ${
              wrongQuestions.length > 0
                ? "border-danger/30 bg-danger-soft/40 cursor-pointer hover:border-danger/60"
                : "border-line bg-surface opacity-75"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger-soft text-danger">
                  <AlertCircle size={20} />
                </span>
                <span className="text-2xl font-black text-danger">{wrongQuestions.length}</span>
              </div>
              <h2 className="mt-3 text-sm font-bold text-ink">Câu sai</h2>
              <p className="mt-1 text-[11px] text-ink-3 leading-tight">
                Đúng 2 lần liên tiếp để gỡ khỏi danh sách
              </p>
            </div>

            <Button
              size="sm"
              variant={wrongQuestions.length > 0 ? "primary" : "secondary"}
              disabled={wrongQuestions.length === 0}
              className="mt-4 w-full h-9 text-xs"
            >
              <Play size={13} className="mr-1 fill-current" />
              Ôn ngay
            </Button>
          </div>

          {/* Bookmarked items card */}
          <div
            onClick={() => bookmarkedQuestions.length > 0 && startPractice("danh_dau")}
            className={`press flex flex-col justify-between rounded-2xl border p-4 transition-all ${
              bookmarkedQuestions.length > 0
                ? "border-gold/30 bg-gold-soft/40 cursor-pointer hover:border-gold/60"
                : "border-line bg-surface opacity-75"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-soft text-gold-ink">
                  <Bookmark size={20} fill="currentColor" />
                </span>
                <span className="text-2xl font-black text-gold-ink">{bookmarkedQuestions.length}</span>
              </div>
              <h2 className="mt-3 text-sm font-bold text-ink">Đã đánh dấu</h2>
              <p className="mt-1 text-[11px] text-ink-3 leading-tight">
                Các câu hỏi bạn chủ động lưu lại khi học
              </p>
            </div>

            <Button
              size="sm"
              variant={bookmarkedQuestions.length > 0 ? "primary" : "secondary"}
              disabled={bookmarkedQuestions.length === 0}
              className="mt-4 w-full h-9 text-xs"
            >
              <Play size={13} className="mr-1 fill-current" />
              Ôn ngay
            </Button>
          </div>
        </div>

        {/* Tab switcher: List view */}
        <div className="flex rounded-xl border border-line bg-bg-2 p-1">
          <button
            onClick={() => setActiveTab("cau_sai")}
            className={`press flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "cau_sai"
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            Danh sách câu sai ({wrongQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab("danh_dau")}
            className={`press flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "danh_dau"
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            Đã đánh dấu ({bookmarkedQuestions.length})
          </button>
        </div>

        {/* List render */}
        {activeTab === "cau_sai" ? (
          wrongQuestions.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {wrongQuestions.map((q) => {
                const state = getWrongItemState(q.id);
                return (
                  <Card key={q.id} className="p-3.5 flex flex-col gap-2 border-line">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-danger bg-danger-soft px-2 py-0.5 rounded">
                        {q.subject === "dan-su"
                          ? "Dân sự"
                          : q.subject === "hanh-chinh"
                          ? "Hành chính"
                          : "Doanh nghiệp"}{" "}
                        · {q.type === "mcq" ? "Trắc nghiệm" : "Nhận định"}
                      </span>
                      <span className="text-[11px] font-medium text-ink-3">
                        Đã đúng: {state?.consecutiveCorrect ?? 0}/2 lần
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-ink line-clamp-2">
                      {q.cau_hoi || q.nhan_dinh}
                    </p>

                    <div className="text-[11px] text-ink-3">
                      Căn cứ: {q.can_cu?.[0]?.dieu} ({q.can_cu?.[0]?.van_ban})
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-8 text-center bg-surface/50">
              <CheckCircle2 size={36} className="mx-auto text-good" />
              <h3 className="mt-3 text-sm font-bold text-ink">Tuyệt vời! Không có câu sai tồn đọng</h3>
              <p className="mt-1 text-xs text-ink-3">
                Bạn đã trả lời đúng hoặc hoàn thành quy tắc 2 lần liên tiếp cho toàn bộ câu hỏi.
              </p>
            </div>
          )
        ) : bookmarkedQuestions.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {bookmarkedQuestions.map((q) => (
              <Card key={q.id} className="p-3.5 flex flex-col gap-2 border-line">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gold-ink bg-gold-soft px-2 py-0.5 rounded">
                    {q.subject === "dan-su"
                      ? "Dân sự"
                      : q.subject === "hanh-chinh"
                      ? "Hành chính"
                      : "Doanh nghiệp"}{" "}
                    · {q.type === "mcq" ? "Trắc nghiệm" : "Nhận định"}
                  </span>
                  <Bookmark size={15} className="text-gold fill-current" />
                </div>

                <p className="text-xs font-semibold text-ink line-clamp-2">
                  {q.cau_hoi || q.nhan_dinh}
                </p>

                <div className="text-[11px] text-ink-3">
                  Căn cứ: {q.can_cu?.[0]?.dieu} ({q.can_cu?.[0]?.van_ban})
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center bg-surface/50">
            <Bookmark size={36} className="mx-auto text-ink-3" />
            <h3 className="mt-3 text-sm font-bold text-ink">Chưa có câu nào được đánh dấu</h3>
            <p className="mt-1 text-xs text-ink-3">
              Khi làm bài, bấm biểu tượng lá cờ / bookmark trên thanh trên cùng để lưu câu hỏi khó vào đây.
            </p>
          </div>
        )}
      </main>

      <TabBar />
    </div>
  );
}
