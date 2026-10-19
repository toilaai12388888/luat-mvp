import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SUBJECTS, getSubject, getChapter } from "@/lib/content";
import { NhanDinhQuiz } from "@/components/nhan-dinh/NhanDinhQuiz";

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

export default async function NhanDinhPage({ params }: PageProps) {
  const { mon, chuong } = await params;
  const subject = getSubject(mon);
  const chapter = getChapter(mon, chuong);

  if (!subject) notFound();

  if (!chapter || chapter.nhan_dinh.length === 0) {
    return (
      <div className="flex min-h-screen flex-col p-4">
        <header className="flex h-14 items-center gap-3">
          <Link href={`/mon/${mon}`} className="press flex h-10 w-10 items-center justify-center rounded-xl text-ink-2">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-bold text-base text-ink">{subject.name}</span>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center text-center p-6">
          <h1 className="text-xl font-bold text-ink">Chương này đang được soạn</h1>
          <p className="mt-2 text-sm text-ink-2">Bộ câu hỏi nhận định đúng/sai sẽ sớm được cập nhật.</p>
          <div className="mt-6 w-full max-w-xs">
            <Link href={`/mon/${mon}`}>
              <Button variant="secondary">Quay lại danh sách chương</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return <NhanDinhQuiz chapter={chapter} />;
}