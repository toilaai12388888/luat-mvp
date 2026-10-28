"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  School,
  Globe,
  Crown,
  Medal,
  Zap,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TabBar } from "@/components/ui/TabBar";
import { PlayerProfile, getLocalPlayer } from "@/lib/player";
import { fetchLeaderboard, LeaderboardEntry, LeaderboardStatus } from "@/lib/leaderboard";
import { NicknameModal } from "@/components/auth/NicknameModal";

export function LeaderboardView() {
  const [scope, setScope] = useState<"all" | "school">("all");
  const [player, setPlayer] = useState<PlayerProfile | null>(() => getLocalPlayer());
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [status, setStatus] = useState<LeaderboardStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showNickModal, setShowNickModal] = useState(false);

  const handleRefresh = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");
    const res = await fetchLeaderboard(scope);
    setEntries(res.entries);
    setMyEntry(res.myEntry);
    setStatus(res.status);
    if (res.errorMessage) {
      setErrorMessage(res.errorMessage);
    }
  }, [scope]);

  useEffect(() => {
    let ignore = false;
    fetchLeaderboard(scope).then((res) => {
      if (!ignore) {
        setEntries(res.entries);
        setMyEntry(res.myEntry);
        setStatus(res.status);
        if (res.errorMessage) {
          setErrorMessage(res.errorMessage);
        }
      }
    });
    return () => {
      ignore = true;
    };
  }, [scope]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="flex min-h-screen flex-col pb-28">
      {/* Header */}
      <header className="border-b border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={22} className="text-gold" />
            <h1 className="text-xl font-bold tracking-tight text-ink">Bảng xếp hạng tuần</h1>
          </div>
          <span className="text-[11px] font-bold text-navy-ink bg-navy-soft px-2.5 py-1 rounded-full">
            T2 — Chủ Nhật
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-2">
          Đua top tuần toàn quốc và nội bộ trường luật. Tích lũy XP qua từng câu hỏi!
        </p>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        {/* Nickname prompt banner if not set */}
        {!player && (
          <div className="flex items-center justify-between rounded-2xl border border-navy-bar/40 bg-navy-soft/60 p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy-bar text-white">
                <Sparkles size={16} />
              </span>
              <div>
                <span className="text-xs font-bold text-navy-ink block">Chưa có tên trên bảng</span>
                <span className="text-[11px] text-ink-2">Chọn biệt danh và trường học</span>
              </div>
            </div>
            <Button
              onClick={() => setShowNickModal(true)}
              size="sm"
              className="h-8 text-xs font-bold"
            >
              Đặt tên
            </Button>
          </div>
        )}

        {/* Tab switcher: Toàn quốc vs Trường tôi */}
        <div className="flex rounded-xl border border-line bg-bg-2 p-1">
          <button
            onClick={() => setScope("all")}
            className={`press flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              scope === "all"
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            <Globe size={14} />
            Toàn quốc
          </button>
          <button
            onClick={() => {
              if (!player) {
                setShowNickModal(true);
              } else {
                setScope("school");
              }
            }}
            className={`press flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              scope === "school"
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            <School size={14} />
            {player ? player.school : "Trường tôi"}
          </button>
        </div>

        {/* 1. TRẠNG THÁI ĐANG TẢI (LOADING) */}
        {status === "loading" && (
          <div className="flex flex-col gap-3 py-4">
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="h-32 rounded-2xl bg-bg-2 animate-pulse" />
              <div className="h-36 rounded-2xl bg-bg-2 animate-pulse -translate-y-2" />
              <div className="h-32 rounded-2xl bg-bg-2 animate-pulse" />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-bg-2 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* 2. TRẠNG THÁI LỖI TRUY VẤN HOẶC MẤT MẠNG */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-line bg-surface mt-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-sm font-bold text-ink">Chưa thể tải bảng xếp hạng</h3>
            <p className="mt-1 text-xs text-ink-2 max-w-xs">
              {errorMessage || "Đã có lỗi xảy ra trong quá trình tải dữ liệu. Vui lòng kiểm tra kết nối mạng và thử lại."}
            </p>
            <Button
              onClick={handleRefresh}
              size="sm"
              className="mt-4 h-9 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              Thử lại
            </Button>
          </div>
        )}

        {/* 3. TRẠNG THÁI CHƯA CÓ NGƯỜI TÍCH LŨY XP TUẦN NÀY (EMPTY) */}
        {status === "empty" && (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-line bg-surface mt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-soft text-gold mb-3">
              <Trophy size={28} />
            </div>
            <h3 className="text-sm font-bold text-ink">Tuần này chưa có người tích lũy XP</h3>
            <p className="mt-1.5 text-xs text-ink-2 max-w-xs leading-relaxed">
              {scope === "school" && player
                ? `Trường ${player.school} chưa có sinh viên nào tích lũy điểm trong tuần. Hãy là người mở đầu!`
                : "Bảng xếp hạng được làm mới vào đầu mỗi tuần (Thứ Hai). Hãy làm bài tập ngay để trở thành người dẫn đầu tuần này!"}
            </p>
            <div className="mt-5 flex gap-2">
              <Link href="/">
                <Button size="sm" className="h-9 px-4 text-xs font-bold flex items-center gap-1.5">
                  <BookOpen size={14} />
                  Bắt đầu làm bài
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-9 px-3 text-xs font-bold text-ink-2"
              >
                <RefreshCw size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* 4. TRẠNG THÁI CÓ DỮ LIỆU THẬT */}
        {status === "ok" && (
          <>
            {/* Top 3 Podium Cards */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {/* Rank 2 */}
                {top3[1] && (
                  <div className="flex flex-col items-center justify-end rounded-2xl border border-line bg-surface p-3 text-center shadow-sm">
                    <div className="relative mb-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-2 text-ink-2 font-bold text-base border border-line">
                        2
                      </div>
                      <Medal size={16} className="absolute -bottom-1 -right-1 text-slate-400" />
                    </div>
                    <span className="text-xs font-bold text-ink truncate w-full">
                      {top3[1].nickname}
                    </span>
                    <span className="text-[10px] text-ink-3 truncate w-full">
                      {top3[1].school}
                    </span>
                    <span className="mt-1 text-xs font-extrabold text-navy-ink">
                      {top3[1].xp} XP
                    </span>
                  </div>
                )}

                {/* Rank 1 (Tallest/Prominent) */}
                {top3[0] && (
                  <div className="flex flex-col items-center justify-end rounded-2xl border-2 border-gold/60 bg-gold-soft/30 p-3 text-center shadow-md relative -translate-y-2">
                    <Crown size={20} className="text-gold fill-current mb-1" />
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gold text-white font-black text-lg shadow-sm mb-2">
                      1
                    </div>
                    <span className="text-xs font-black text-ink truncate w-full">
                      {top3[0].nickname}
                    </span>
                    <span className="text-[10px] text-ink-3 truncate w-full font-medium">
                      {top3[0].school}
                    </span>
                    <span className="mt-1 text-xs font-black text-gold-ink">
                      {top3[0].xp} XP
                    </span>
                  </div>
                )}

                {/* Rank 3 */}
                {top3[2] && (
                  <div className="flex flex-col items-center justify-end rounded-2xl border border-line bg-surface p-3 text-center shadow-sm">
                    <div className="relative mb-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-2 text-ink-2 font-bold text-base border border-line">
                        3
                      </div>
                      <Medal size={16} className="absolute -bottom-1 -right-1 text-amber-700" />
                    </div>
                    <span className="text-xs font-bold text-ink truncate w-full">
                      {top3[2].nickname}
                    </span>
                    <span className="text-[10px] text-ink-3 truncate w-full">
                      {top3[2].school}
                    </span>
                    <span className="mt-1 text-xs font-extrabold text-navy-ink">
                      {top3[2].xp} XP
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Rest of the leaderboard (4-50) */}
            {rest.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                {rest.map((entry) => (
                  <div
                    key={entry.playerId}
                    className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                      entry.isMe
                        ? "border-navy-bar bg-navy-soft/60 text-navy-ink shadow-sm"
                        : "border-line bg-surface text-ink"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-ink-3">
                        #{entry.rank}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-ink">
                            {entry.nickname}
                          </span>
                          {entry.isMe && (
                            <span className="rounded bg-navy-bar px-1.5 py-0.2 text-[9px] font-bold text-white">
                              BẠN
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-ink-3 block">
                          {entry.school}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-black text-navy-ink">
                      +{entry.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky Bottom: My Current Rank */}
      {myEntry && (
        <div className="fixed bottom-16 left-1/2 z-20 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-between border-t border-navy-bar/40 bg-navy-soft/95 backdrop-blur-md px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-bar text-xs font-black text-white">
              #{myEntry.rank}
            </span>
            <div>
              <span className="text-xs font-bold text-navy-ink block">
                {myEntry.nickname} (Bạn)
              </span>
              <span className="text-[10px] text-ink-2 font-medium">
                {myEntry.school}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-navy-ink">
            <Zap size={14} className="text-gold fill-current" />
            <span>{myEntry.xp} XP</span>
          </div>
        </div>
      )}

      <TabBar />

      <NicknameModal
        isOpen={showNickModal}
        onClose={() => setShowNickModal(false)}
        onSuccess={(p) => {
          setPlayer(p);
          handleRefresh();
        }}
      />
    </div>
  );
}
