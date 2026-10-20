"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Flame,
  ChevronRight,
  User,
  AlertTriangle,
  Play,
  Award,
  Sparkles,
  Crown,
  Calendar,
  CheckCircle2,
  Star,
  BookOpen,
  Shield,
  Briefcase,
  Trophy,
  Lock,
  Scale,
  HeartHandshake,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { getMyStats, UserStats } from "@/lib/stats";
import { getLocalPlayer, PlayerProfile } from "@/lib/player";
import { NicknameModal } from "@/components/auth/NicknameModal";
import { getWeakestArticles, WeakArticleRecord } from "@/lib/weakness";
import { checkAllBadges, Badge } from "@/lib/badges";
import { getQuizItemById, QuizQuestion } from "@/lib/all-questions";
import { ContributeQuestionModal } from "@/components/contributions/ContributeQuestionModal";
import { getMyContributions, UserContribution } from "@/lib/contributions";
import {
  getExamDates,
  setExamDate,
  calculateSubjectPlan,
  SubjectSlug,
  SUBJECT_NAMES,
  SUBJECT_FULL_NAMES,
  ExamDates,
} from "@/lib/study-plan";
import { OnTapRunner } from "@/components/on-tap/OnTapRunner";

export function TienDoView() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [player, setPlayer] = useState<PlayerProfile | null>(() => getLocalPlayer());
  const [examDates, setExamDates] = useState<ExamDates>(() => getExamDates());
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [myContribs, setMyContribs] = useState<UserContribution[]>([]);

  const handleDateChange = (slug: SubjectSlug, dateStr: string) => {
    setExamDate(slug, dateStr || null);
    setExamDates(getExamDates());
  };
  const [showNickModal, setShowNickModal] = useState(false);
  const [weaknesses, setWeaknesses] = useState<WeakArticleRecord[]>(() => getWeakestArticles());
  const [badges, setBadges] = useState<Badge[]>(() => checkAllBadges());
  const [practiceItems, setPracticeItems] = useState<QuizQuestion[] | null>(null);
  const [practiceTitle, setPracticeTitle] = useState("");

  const refreshAll = () => {
      getMyContributions().then(setMyContribs).catch(() => {});
    getMyStats().then(setStats);
    setPlayer(getLocalPlayer());
    setWeaknesses(getWeakestArticles());
    setBadges(checkAllBadges());
  };

  useEffect(() => {
    let isMounted = true;
    getMyStats().then((s) => {
      if (isMounted) setStats(s);
    });
    const handler = () => {
      getMyStats().then((s) => {
        if (isMounted) setStats(s);
      });
      setPlayer(getLocalPlayer());
      setWeaknesses(getWeakestArticles());
      setBadges(checkAllBadges());
    };
    window.addEventListener("luat_attempts_updated", handler);
    window.addEventListener("luat_badges_unlocked", handler);
    return () => {
      isMounted = false;
      window.removeEventListener("luat_attempts_updated", handler);
      window.removeEventListener("luat_badges_unlocked", handler);
    };
  }, []);

  const xp = stats?.xp || 0;
  const streak = stats?.streak || 0;
  const answered = stats?.answered || 0;
  const pctCorrect = stats?.pctCorrect || 0;
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const week = stats?.week || [false, false, false, false, false, false, false];
  const todayIndex = (new Date().getDay() + 6) % 7;

  const subjectMeta: Record<string, { name: string; photo: string }> = {
    "dan-su": { name: "Luáº­t DÃ¢n sá»±", photo: "/photos/dan-su.jpg" },
    "hanh-chinh": { name: "Luáº­t HÃ nh chÃ­nh", photo: "/photos/hanh-chinh.jpg" },
    "doanh-nghiep": { name: "Luáº­t Doanh nghiá»‡p", photo: "/photos/doanh-nghiep.jpg" },
  };

  const bySubject = stats?.bySubject || [
    { slug: "dan-su", answered: 0, pctCorrect: 0 },
    { slug: "hanh-chinh", answered: 0, pctCorrect: 0 },
    { slug: "doanh-nghiep", answered: 0, pctCorrect: 0 },
  ];

  const handleStartWeaknessPractice = (weakness: WeakArticleRecord) => {
    const items = weakness.questionIds
      .map((id) => getQuizItemById(id))
      .filter((q): q is QuizQuestion => q !== null);

    if (items.length === 0) return;
    setPracticeTitle(`Ã”n táº­p: ${weakness.article}`);
    setPracticeItems(items);
  };

  if (practiceItems) {
    return (
      <OnTapRunner
        title={practiceTitle}
        items={practiceItems}
        onExit={() => {
          setPracticeItems(null);
          refreshAll();
        }}
      />
    );
  }

  // Icon map for badges
  const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
    const cls = unlocked ? "text-gold" : "text-ink-3";
    switch (iconName) {
      case "Sparkles":
        return <Sparkles size={20} className={cls} />;
      case "Flame":
        return <Flame size={20} className={unlocked ? "text-fire fill-current" : cls} />;
      case "Zap":
        return <Zap size={20} className={cls} />;
      case "Calendar":
        return <Calendar size={20} className={cls} />;
      case "Crown":
        return <Crown size={20} className={cls} />;
      case "CheckCircle2":
        return <CheckCircle2 size={20} className={cls} />;
      case "Award":
        return <Award size={20} className={cls} />;
      case "Star":
        return <Star size={20} className={cls} />;
      case "BookOpen":
        return <BookOpen size={20} className={cls} />;
      case "Shield":
        return <Shield size={20} className={cls} />;
      case "Briefcase":
        return <Briefcase size={20} className={cls} />;
      default:
        return <Trophy size={20} className={cls} />;
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-16">
      {/* Player Identity Card */}
      <Card className="p-4 flex items-center justify-between border-line">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-bar text-white font-black text-lg">
            {player ? player.nickname.charAt(0).toUpperCase() : <User size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-ink">
                {player ? player.nickname : "ChÆ°a Ä‘áº·t biá»‡t danh"}
              </span>
              {player && (
                <span className="text-[10px] font-bold text-navy-ink bg-navy-soft px-1.5 py-0.5 rounded">
                  {player.school}
                </span>
              )}
            </div>
            <p className="text-[11px] text-ink-3">
              {player
                ? "TÃ i khoáº£n áº©n danh Ä‘Ã£ kÃ­ch hoáº¡t cá»™ng Ä‘á»“ng"
                : "Äáº·t biá»‡t danh Ä‘á»ƒ xáº¿p háº¡ng vÃ  thÃ¡ch Ä‘áº¥u"}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowNickModal(true)}
          size="sm"
          variant="secondary"
          className="h-8 text-xs font-semibold"
        >
          {player ? "Sá»­a" : "Äáº·t tÃªn"}
        </Button>
      </Card>

      {/* Header with XP */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-ink">Há»“ sÆ¡ & Tiáº¿n Ä‘á»™</h1>
        <Chip aria-label={`${xp} XP`}>
          <Zap size={15} className="text-gold" fill="currentColor" />
          <span>{xp} XP</span>
        </Chip>
      </div>

      {/* Chuá»—i ngÃ y Card */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-ink">
            <Flame size={18} className="text-fire" fill="currentColor" />
            <span>Chuá»—i {streak} ngÃ y</span>
          </div>
          <span className="text-xs text-ink-2">
            {stats?.doneToday ? "ÄÃ£ Ã´n táº­p hÃ´m nay" : "ChÆ°a lÃ m bÃ i hÃ´m nay"}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {days.map((day, idx) => {
            const isDone = week[idx];
            const isToday = idx === todayIndex;

            let dotCls = "border border-line-2 text-transparent bg-bg-2";
            if (isDone) {
              dotCls = "bg-gold border-gold text-white font-bold";
            } else if (isToday) {
              dotCls = "border-2 border-gold text-gold font-bold";
            }

            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className={`text-[11px] font-medium ${isToday ? "text-ink font-bold" : "text-ink-3"}`}>
                  {day}
                </span>
                <span className={`grid h-8 w-8 place-items-center rounded-full text-xs ${dotCls}`}>
                  {isDone ? "âœ“" : isToday ? "â€¢" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3 Metric Tiles */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-line bg-surface p-3 text-center">
          <span className="text-xs text-ink-3 block mb-1">Tá»•ng XP</span>
          <span className="text-xl font-extrabold text-gold">+{xp}</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3 text-center">
          <span className="text-xs text-ink-3 block mb-1">CÃ¢u Ä‘Ã£ lÃ m</span>
          <span className="text-xl font-extrabold text-ink">{answered}</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3 text-center">
          <span className="text-xs text-ink-3 block mb-1">Tá»‰ lá»‡ Ä‘Ãºng</span>
          <span className="text-xl font-extrabold text-good">{pctCorrect}%</span>
        </div>
      </div>

      {/* FEATURE 5: THá»NG KÃŠ ÄIá»‚M Yáº¾U */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
            <AlertTriangle size={17} className="text-danger" />
            Äiá»ƒm yáº¿u cáº§n cá»§ng cá»‘
          </h2>
          <span className="text-xs text-ink-3">Äiá»u luáº­t sai nhiá»u</span>
        </div>

        {weaknesses.length > 0 ? (
          <div className="flex flex-col gap-2">
            {weaknesses.map((w) => (
              <Card key={w.key} className="p-3.5 flex items-center justify-between border-line">
                <div>
                  <span className="text-xs font-bold text-navy-ink block">
                    {w.article} Â· {w.lawName}
                  </span>
                  <span className="text-[11px] font-medium text-danger">
                    ÄÃ£ sai {w.wrongCount} láº§n ({w.questionIds.length} cÃ¢u liÃªn quan)
                  </span>
                </div>

                <Button
                  onClick={() => handleStartWeaknessPractice(w)}
                  size="sm"
                  className="h-8 text-xs font-bold"
                >
                  <Play size={12} className="mr-1 fill-current" />
                  Ã”n ngay
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-center border-dashed border-line">
            <p className="text-xs text-ink-3">
              ChÆ°a phÃ¡t hiá»‡n Ä‘iá»ƒm yáº¿u nÃ o tá»“n Ä‘á»ng! Há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng phÃ¢n tÃ­ch sau cÃ¡c bÃ i lÃ m cá»§a báº¡n.
            </p>
          </Card>
        )}
      </section>

      {/* FEATURE 4: HUY HIá»†U */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
            <Award size={18} className="text-gold" />
            Huy hiá»‡u Ä‘áº¡t Ä‘Æ°á»£c
          </h2>
          <span className="text-xs text-ink-3 font-semibold">
            {badges.filter((b) => b.unlocked).length} / {badges.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                badge.unlocked
                  ? "border-gold/40 bg-gold-soft/30 shadow-sm"
                  : "border-line bg-surface opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      badge.unlocked ? "bg-gold-soft" : "bg-bg-2"
                    }`}
                  >
                    {renderBadgeIcon(badge.iconName, badge.unlocked)}
                  </span>
                  {badge.unlocked ? (
                    <span className="text-[10px] font-bold text-good bg-good-soft px-1.5 py-0.5 rounded">
                      ÄÃ£ má»Ÿ
                    </span>
                  ) : (
                    <Lock size={13} className="text-ink-3" />
                  )}
                </div>

                <h3 className="text-xs font-bold text-ink leading-tight">{badge.title}</h3>
                <p className="mt-1 text-[10px] text-ink-3 leading-snug line-clamp-2">
                  {badge.description}
                </p>
              </div>

              <span className="mt-3 text-[10px] font-semibold text-ink-2">
                {badge.progressText}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Theo MÃ´n Card */}
      <section>
        <h2 className="text-base font-bold text-ink mb-3">Tiáº¿n Ä‘á»™ theo mÃ´n há»c</h2>
        <Card className="divide-y divide-line p-0 overflow-hidden">
          {bySubject.map((item) => {
            const meta = subjectMeta[item.slug];
            if (!meta) return null;

            return (
              <Link
                key={item.slug}
                href={`/mon/${item.slug}`}
                className="press flex items-center gap-3.5 p-3.5 hover:bg-bg-2"
              >
                <div className="relative h-12 w-12 flex-none overflow-hidden rounded-xl border border-line">
                  <Image
                    src={meta.photo}
                    alt={meta.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-ink">{meta.name}</span>
                    <span className="text-xs font-semibold text-good">
                      {item.answered > 0 ? `${item.pctCorrect}% Ä‘Ãºng` : "ChÆ°a lÃ m"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-navy-bar"
                        style={{ width: `${item.pctCorrect}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-ink-3 tabular-nums">
                      {item.answered} cÃ¢u
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} className="text-ink-3 flex-none" />
              </Link>
            );
          })}
        </Card>
      </section>

              {/* MỤC C: LỘ TRÌNH ÔN ĐẾN NGÀY THI */}
        <section id="lo-trinh" className="scroll-mt-6">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
              <Calendar size={18} className="text-gold" />
              Lộ trình & Ngày thi
            </h2>
            <span className="text-xs text-ink-3">Tự chia số câu mỗi ngày</span>
          </div>

          <div className="flex flex-col gap-3">
            {(["dan-su", "hanh-chinh", "doanh-nghiep"] as SubjectSlug[]).map((slug) => {
              const plan = calculateSubjectPlan(slug);
              const currentDate = examDates[slug] || "";

              return (
                <Card key={slug} className="p-4 border-line">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] text-ink-3 block font-medium">{SUBJECT_FULL_NAMES[slug]}</span>
                      <h3 className="font-bold text-sm text-navy-ink">Môn {SUBJECT_NAMES[slug]}</h3>
                    </div>
                    {plan && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          plan.isRush
                            ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                            : "bg-gold-soft text-gold-ink"
                        }`}
                      >
                        Còn {plan.daysLeft} ngày
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs text-ink-2 font-medium shrink-0">Ngày thi:</label>
                    <input
                      type="date"
                      value={currentDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleDateChange(slug, e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs border border-line rounded-lg bg-surface text-ink font-mono focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    {currentDate && (
                      <button
                        onClick={() => handleDateChange(slug, "")}
                        className="text-[11px] text-ink-3 hover:text-danger px-1.5 py-1 rounded transition cursor-pointer"
                        title="Xóa ngày thi"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  {plan ? (
                    <div className="p-2.5 bg-bg-2 rounded-xl text-xs space-y-1 text-ink-2">
                      <div className="flex items-center justify-between font-semibold text-navy-ink">
                        <span>Mục tiêu: {plan.dailyTarget} câu/ngày</span>
                        <span>
                          Hôm nay: {plan.doneToday}/{plan.dailyTarget} (
                          {Math.min(100, Math.round((plan.doneToday / plan.dailyTarget) * 100))}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-3">
                        {plan.unansweredCount} câu chưa làm · {plan.wrongCount} câu sai cần phục thù ·{" "}
                        {plan.unsolvedScenarios} tình huống
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-ink-3 italic">
                      Chưa đặt ngày thi. Chọn ngày ở trên để kích hoạt lộ trình.
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

                {/* MỤC E: ĐÓNG GÓP CÂU HỎI */}
        <section id="dong-gop">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
              <HeartHandshake size={18} className="text-gold" />
              Đóng góp câu hỏi
            </h2>
            <Button
              size="sm"
              onClick={() => setShowContributeModal(true)}
              className="h-8 text-xs font-bold"
            >
              + Đóng góp mới
            </Button>
          </div>

          {myContribs.length > 0 ? (
            <div className="space-y-2.5">
              {myContribs.map((c, idx) => (
                <Card key={c.id || idx} className="p-3.5 border-line">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === "approved"
                          ? "bg-good-soft text-good-ink"
                          : c.status === "rejected"
                          ? "bg-danger-soft text-danger-ink"
                          : "bg-gold-soft text-gold-ink"
                      }`}
                    >
                      {c.status === "approved"
                        ? "Đã duyệt"
                        : c.status === "rejected"
                        ? "Từ chối"
                        : "Chờ duyệt"}
                    </span>
                    <span className="text-[11px] text-ink-3 font-mono">
                      {new Date(c.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-ink line-clamp-2 mb-1">
                    {c.payload.question}
                  </p>
                  <p className="text-[11px] text-ink-3">
                    {c.payload.citationDoc} - Điều {c.payload.citationArticle}
                  </p>
                  {c.note && (
                    <p className="mt-1.5 text-[11px] text-danger bg-danger-soft p-2 rounded-lg">
                      <strong>Ghi chú admin:</strong> {c.note}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-4 text-center border-dashed border-line">
              <p className="text-xs text-ink-3 mb-2">
                Bạn chưa đóng góp câu hỏi nào. Đóng góp câu hỏi đúng chuẩn để mở khóa huy hiệu "Người đóng góp" và giúp đỡ các bạn khác!
              </p>
              <button
                onClick={() => setShowContributeModal(true)}
                className="text-xs font-bold text-gold hover:underline cursor-pointer"
              >
                Gửi câu hỏi đóng góp đầu tiên →
              </button>
            </Card>
          )}
        </section>

        <ContributeQuestionModal
          isOpen={showContributeModal}
          onClose={() => {
            setShowContributeModal(false);
            refreshAll();
          }}
        />

        <NicknameModal
        isOpen={showNickModal}
        onClose={() => setShowNickModal(false)}
        onSuccess={(p) => {
          setPlayer(p);
          refreshAll();
        }}
      />
    </div>
  );
}

