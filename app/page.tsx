import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/ui/TopBar";
import { TabBar } from "@/components/ui/TabBar";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeStreak } from "@/components/home/HomeStreak";
import { HomeSearch } from "@/components/home/HomeSearch";
import { StudyPlanCard } from "@/components/study-plan/StudyPlanCard";
import { SUBJECTS, getChapters } from "@/lib/content";

export default async function HomePage() {
  const danSuChapters = getChapters("dan-su");
  const hanhChinhChapters = getChapters("hanh-chinh");
  const doanhNghiepChapters = getChapters("doanh-nghiep");

  const chapterCounts: Record<string, number> = {
    "dan-su": danSuChapters.length,
    "hanh-chinh": hanhChinhChapters.length,
    "doanh-nghiep": doanhNghiepChapters.length,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="flex-1 px-4 pt-2 pb-6">
        <p className="text-sm font-medium text-ink-2">Chào bạn,</p>
        <h1 className="mt-1 mb-3 text-[28px] font-bold tracking-tight text-ink">
          Hôm nay ôn gì?
        </h1>

        {/* FEATURE 6: TÌM KIẾM CÂU HỎI & ĐIỀU LUẬT */}
        <HomeSearch />

        {/* Dynamic Continue Card */}
        <HomeHero />

        {/* MỤC C: LỘ TRÌNH ÔN ĐẾN NGÀY THI */}
        <div className="mb-4">
          <StudyPlanCard />
        </div>

        {/* Dynamic Streak Card */}
        <HomeStreak />

        {/* FEATURE 3: THỬ THÁCH HẰNG NGÀY BANNER */}
        <Link
          href="/hang-ngay"
          className="press mb-6 flex items-center justify-between rounded-2xl border border-navy-bar/30 bg-navy-soft/60 p-4 transition-all hover:border-navy-bar"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-bar text-white shadow-sm">
              <Calendar size={20} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-navy-ink">Thử thách hôm nay</span>
                <span className="rounded bg-gold-soft px-1.5 py-0.2 text-[10px] font-bold text-gold-ink">
                  5 câu
                </span>
              </div>
              <p className="text-xs text-ink-2">
                Bộ đề chung toàn quốc · Thẻ kết quả Wordle chia sẻ story
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-navy-bar" />
        </Link>

        {/* Danh sách Môn học */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Môn học</h2>
          <span className="text-xs text-ink-3">3 môn · 6 chương mở</span>
        </div>

        <div className="flex flex-col gap-3">
          {SUBJECTS.map((sub) => {
            const count = chapterCounts[sub.slug] || 0;
            const isReady = count > 0;

            return (
              <Link
                key={sub.slug}
                href={`/mon/${sub.slug}`}
                className="press block overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <div className="relative h-28 w-full">
                  <Image
                    src={sub.coverPhoto}
                    alt={sub.name}
                    fill
                    sizes="(max-width: 480px) 100vw, 480px"
                    className={`object-cover ${!isReady ? "grayscale contrast-[0.8]" : ""}`}
                    style={{ objectPosition: sub.objectPosition }}
                  />
                  <div className="photo-shade absolute inset-0 pointer-events-none" />
                  <div className="absolute inset-0 flex flex-col justify-end p-3.5 z-10 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-medium text-white/80">
                          {sub.lawName}
                        </span>
                        <h3 className="text-lg font-bold text-white leading-tight">
                          {sub.name}
                        </h3>
                      </div>
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
                        {isReady ? `${count} chương` : "Đang soạn"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-ink-3">
          Ảnh minh họa theo Unsplash License · Biên soạn phục vụ học tập phi thương mại
        </p>
      </main>
      <TabBar />
    </div>
  );
}
