import React from "react";
import Link from "next/link";
import Image from "next/image";
import { TopBar } from "@/components/ui/TopBar";
import { TabBar } from "@/components/ui/TabBar";
import { Card } from "@/components/ui/Card";
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

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="flex-1 px-4 pt-2 pb-6">
        <p className="text-sm font-medium text-ink-2">Chào bạn,</p>
        <h1 className="mt-1 mb-4 text-[28px] font-bold tracking-tight text-ink">
          Hôm nay ôn gì?
        </h1>

        {/* Hero Card: Tiếp tục học */}
        <Link href="/mon/dan-su/de-cuong/c01" className="block mb-6">
          <div className="press relative h-[216px] w-full overflow-hidden rounded-2xl text-white">
            <Image
              src="/photos/hero-books.jpg"
              alt="Tiếp tục học"
              fill
              sizes="(max-width: 480px) 100vw, 480px"
              className="object-cover"
              priority
            />
            <div className="photo-shade absolute inset-0 pointer-events-none" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
              <span className="text-xs font-semibold tracking-wider uppercase text-white/80">
                Tiếp tục học
              </span>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
                Luật Dân sự
              </h2>
              <p className="text-sm text-white/80">
                Giao dịch dân sự · 25 câu hỏi
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30">
                  <div className="h-full w-1/3 rounded-full bg-white" />
                </div>
                <span className="press inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-bold text-ink">
                  Tiếp tục
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Card Chuỗi ngày: 7 chấm tuần */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-ink">Chuỗi ngày ôn luyện</span>
            <span className="text-xs text-ink-2">Mục tiêu: 1 bài / ngày</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {daysOfWeek.map((day, idx) => (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-medium text-ink-3">{day}</span>
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                    idx === 0
                      ? "border-2 border-gold text-gold"
                      : "border border-line-2 text-ink-3 bg-bg-2"
                  }`}
                >
                  {idx === 0 ? "✓" : ""}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Danh sách Môn học */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Môn học</h2>
          <span className="text-xs text-ink-3">3 môn cốt lõi</span>
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