"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMyStats, UserStats } from "@/lib/stats";

export function HomeHero() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    getMyStats().then(setStats);
    const handler = () => {
      getMyStats().then(setStats);
    };
    window.addEventListener("luat_attempts_updated", handler);
    return () => window.removeEventListener("luat_attempts_updated", handler);
  }, []);

  const last = stats?.lastChapter;
  const monSlug = last?.mon || "dan-su";
  const chuongSlug = last?.chuong || "c01";

  const monNames: Record<string, string> = {
    "dan-su": "Luật Dân sự",
    "hanh-chinh": "Luật Hành chính",
    "doanh-nghiep": "Luật Doanh nghiệp",
  };

  const monPhotos: Record<string, string> = {
    "dan-su": "/photos/hero-books.jpg",
    "hanh-chinh": "/photos/hanh-chinh.jpg",
    "doanh-nghiep": "/photos/doanh-nghiep.jpg",
  };

  const subjectName = monNames[monSlug] || "Luật Dân sự";
  const photo = monPhotos[monSlug] || "/photos/hero-books.jpg";
  const done = last?.done || 0;
  const total = last?.total || 25;
  const remaining = Math.max(0, total - done);
  const pct = Math.min(100, Math.round((done / total) * 100));

  return (
    <Link href={`/mon/${monSlug}/de-cuong/${chuongSlug}`} className="block mb-6">
      <div className="press relative h-[216px] w-full overflow-hidden rounded-2xl text-white">
        <Image
          src={photo}
          alt={subjectName}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
        />
        <div className="photo-shade absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
          <span className="text-xs font-semibold tracking-wider uppercase text-white/80">
            Tiếp tục học
          </span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
            {subjectName}
          </h2>
          <p className="text-sm text-white/80">
            {chuongSlug.toUpperCase()} · {remaining > 0 ? `còn ${remaining} câu` : "Đã hoàn thành lượt làm"}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.max(5, pct)}%` }}
              />
            </div>
            <span className="press inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-bold text-ink">
              Tiếp tục
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}