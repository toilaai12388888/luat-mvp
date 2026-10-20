import React from "react";
import { notFound } from "next/navigation";
import { SUBJECTS, getSubject, getChapter } from "@/lib/content";
import { TinhHuongRunner } from "@/components/tinh-huong/TinhHuongRunner";

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

export default async function TinhHuongPage({ params }: PageProps) {
  const { mon, chuong } = await params;
  const subject = getSubject(mon);
  const chapter = getChapter(mon, chuong);

  if (!subject || !chapter) {
    notFound();
  }

  const scenarios = chapter.tinh_huong || [];

  return (
    <TinhHuongRunner
      monSlug={mon}
      monName={subject.name}
      chuongSlug={chuong}
      chuongTitle={chapter.ten_chuong}
      scenarios={scenarios}
      exitHref={`/mon/${mon}`}
    />
  );
}
