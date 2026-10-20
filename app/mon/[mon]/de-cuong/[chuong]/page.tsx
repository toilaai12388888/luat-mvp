import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/Button";
import { SUBJECTS, getSubject, getChapter } from "@/lib/content";
import { DeCuongDieuList } from "@/components/de-cuong/DeCuongDieuList";

export function generateStaticParams() {
  const params: { mon: string; chuong: string }[] = [];
  for (const s of SUBJECTS) {
    for (const c of ["c01", "c02"]) {
      params.push({ mon: s.slug, chuong: c });
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ mon: string; chuong: string }>;
}

export default async function DeCuongPage({ params }: PageProps) {
  const { mon, chuong } = await params;
  const subject = getSubject(mon);
  const chapter = getChapter(mon, chuong);

  if (!subject || !chapter) {
    notFound();
  }

  const { de_cuong, ten_chuong, trac_nghiem } = chapter;
  const mcqCount = trac_nghiem.length;

  return (
    <div className="flex min-h-screen flex-col pb-24">
      {/* Sub Topbar */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-md">
        <Link
          href={`/mon/${mon}`}
          className="press flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-bg-2"
          aria-label="Quay lại môn"
        >
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-base text-ink truncate">{subject.name}</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-navy-ink">
          {chuong.toUpperCase()} · ĐỀ CƯƠNG
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {ten_chuong.replace(" (MẪU)", "")}
        </h1>
        <p className="mt-1 mb-4 text-sm text-ink-2">{subject.lawName}</p>

        {/* FLASHCARD ACTION BANNER */}
        <Link
          href={`/mon/${mon}/flashcard/${chuong}`}
          className="press mb-6 flex items-center justify-between rounded-2xl border border-navy-bar/40 bg-navy-soft/60 p-4 transition-all hover:border-navy-bar"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-bar text-white shadow-sm">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-navy-ink">Lật thẻ Flashcard ghi nhớ</h2>
              <p className="text-xs text-ink-2">
                Học nhanh {de_cuong.dieu_hay_ra_de.length} điều luật trọng tâm bằng lặp lại ngắt quãng
              </p>
            </div>
          </div>
          <span className="rounded-xl bg-navy-bar px-3 py-1.5 text-xs font-bold text-white shadow-sm flex-none">
            Học ngay
          </span>
        </Link>

        {/* Section: Tóm tắt */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-ink">Tóm tắt trọng tâm</h2>
          <div className="prose prose-sm max-w-none text-ink leading-relaxed rounded-2xl border border-line bg-surface p-4 text-[15px]">
            <ReactMarkdown>{de_cuong.tom_tat}</ReactMarkdown>
          </div>
        </section>

        {/* Section: Điều hay ra đề */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-ink">Điều luật hay ra đề</h2>
            <Link
              href={`/mon/${mon}/flashcard/${chuong}`}
              className="text-xs font-bold text-navy-bar hover:underline flex items-center gap-1"
            >
              Luyện Flashcard ({de_cuong.dieu_hay_ra_de.length} điều) →
            </Link>
          </div>
          <DeCuongDieuList items={de_cuong.dieu_hay_ra_de} monSlug={mon} />
        </section>
      </main>

      {/* Sticky Bottom Dock */}
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-surface/95 p-4 backdrop-blur-md">
        <Link href={`/mon/${mon}/trac-nghiem/${chuong}`}>
          <Button variant="primary">
            Làm {mcqCount > 0 ? `${mcqCount} câu` : ""} trắc nghiệm
          </Button>
        </Link>
      </div>
    </div>
  );
}
