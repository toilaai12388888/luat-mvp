import React from "react";
import { notFound } from "next/navigation";
import { SUBJECTS, getSubject, getChapter } from "@/lib/content";
import { FlashcardRunner } from "@/components/flashcard/FlashcardRunner";

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

export default async function FlashcardPage({ params }: PageProps) {
  const { mon, chuong } = await params;
  const subject = getSubject(mon);
  const chapter = getChapter(mon, chuong);

  if (!subject || !chapter) {
    notFound();
  }

  const cards = chapter.de_cuong.dieu_hay_ra_de;

  return (
    <FlashcardRunner
      monName={subject.name}
      chuongTitle={chapter.ten_chuong}
      cards={cards}
      exitHref={`/mon/${mon}/de-cuong/${chuong}`}
    />
  );
}
