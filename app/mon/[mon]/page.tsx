import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckSquare,
  HelpCircle,
  ChevronRight,
  Scale,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TabBar } from "@/components/ui/TabBar";
import { SUBJECTS, getSubject, getChapter } from "@/lib/content";
import { getCaseStudiesBySubject } from "@/lib/case-studies";
import { CaseStudyCard } from "@/components/luyen-an/CaseStudyCard";
import { CommunityQuestionsList } from "@/components/contributions/CommunityQuestionsList";

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ mon: s.slug }));
}

interface PageProps {
  params: Promise<{ mon: string }>;
}

export default async function SubjectPage({ params }: PageProps) {
  const { mon } = await params;
  const subject = getSubject(mon);
  if (!subject) notFound();

  const c01 = getChapter(mon, "c01");
  const c02 = getChapter(mon, "c02");
  const caseStudies = getCaseStudiesBySubject(mon);

  const chapters = [
    {
      id: "c01",
      no: "Chương 1",
      title: c01 ? c01.ten_chuong.replace(" (MẪU)", "") : "Chương 1",
      data: c01,
      isReady: !!c01,
    },
    {
      id: "c02",
      no: "Chương 2",
      title: c02 ? c02.ten_chuong : "Chương 2",
      data: c02,
      isReady: !!c02,
    },
  ];

  const totalQuestions =
    (c01 ? c01.trac_nghiem.length + c01.nhan_dinh.length : 0) +
    (c02 ? c02.trac_nghiem.length + c02.nhan_dinh.length : 0);

  return (
    <div className="flex min-h-screen flex-col pb-16">
      {/* Top Cover Banner */}
      <div className="relative h-[220px] w-full text-white">
        <Image
          src={subject.coverPhoto}
          alt={subject.name}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
          style={{ objectPosition: subject.objectPosition }}
        />
        <div className="photo-shade absolute inset-0 pointer-events-none" />

        <Link
          href="/"
          className="press absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
          <span className="text-xs font-medium text-white/80">{subject.lawName}</span>
          <h1 className="text-2xl font-bold tracking-tight text-white">{subject.name}</h1>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 text-sm">
        <div className="flex items-center gap-4 text-ink-2">
          <span>{c01 && c02 ? "2 chương" : c01 ? "1 chương mở" : "Đang soạn"}</span>
          <span>·</span>
          <span>{totalQuestions} câu hỏi · 2 tình huống</span>
        </div>
        <span className="font-semibold text-good">Tỉ lệ đúng: --</span>
      </div>

      {/* Chapters list */}
      <main className="flex-1 p-4 flex flex-col gap-4">
        {chapters.map((ch) => (
          <Card key={ch.id} className="p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-line p-4">
              <div>
                <span className="text-xs font-bold text-navy-ink bg-navy-soft px-2 py-0.5 rounded">
                  {ch.no}
                </span>
                <h2 className="mt-1 text-base font-bold text-ink">{ch.title}</h2>
              </div>
              {!ch.isReady && (
                <span className="rounded-full bg-bg-2 px-2.5 py-1 text-xs font-semibold text-ink-3">
                  Đang soạn
                </span>
              )}
            </div>

            {ch.isReady && ch.data ? (
              <div className="divide-y divide-line">
                <Link
                  href={`/mon/${mon}/de-cuong/${ch.id}`}
                  className="press flex items-center justify-between p-4 hover:bg-bg-2 text-ink"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-navy-bar" />
                    <span className="text-sm font-semibold">Đề cương tóm tắt</span>
                  </div>
                  <ChevronRight size={18} className="text-ink-3" />
                </Link>

                <Link
                  href={`/mon/${mon}/tinh-huong/${ch.id}`}
                  className="press flex items-center justify-between p-4 hover:bg-bg-2 text-ink bg-navy-soft/20"
                >
                  <div className="flex items-center gap-3">
                    <Scale size={18} className="text-navy-bar" />
                    <div>
                      <span className="text-sm font-semibold flex items-center gap-1.5 text-navy-ink">
                        Bài tập tình huống
                        <span className="rounded bg-navy-soft px-1.5 py-0.2 text-[10px] font-bold text-navy-ink">
                          Mới
                        </span>
                      </span>
                      <span className="text-xs text-ink-3">
                        {ch.data.tinh_huong?.length || 2} bài tập thực tiễn (3 bước)
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-ink-3" />
                </Link>

                <Link
                  href={`/mon/${mon}/trac-nghiem/${ch.id}`}
                  className="press flex items-center justify-between p-4 hover:bg-bg-2 text-ink"
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare size={18} className="text-good" />
                    <div>
                      <span className="text-sm font-semibold block">Trắc nghiệm</span>
                      <span className="text-xs text-ink-3">{ch.data.trac_nghiem.length} câu hỏi</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-ink-3" />
                </Link>

                <Link
                  href={`/mon/${mon}/nhan-dinh/${ch.id}`}
                  className="press flex items-center justify-between p-4 hover:bg-bg-2 text-ink"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-gold" />
                    <div>
                      <span className="text-sm font-semibold block">Nhận định đúng / sai</span>
                      <span className="text-xs text-ink-3">{ch.data.nhan_dinh.length} câu hỏi</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-ink-3" />
                </Link>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-ink-3">
                Nội dung chương này đang được đội ngũ biên soạn và đối chiếu điều luật.
              </div>
            )}
          </Card>
        ))}

        {/* MỤC: LUYỆN ÁN THẬT MÔN NÀY */}
        {caseStudies.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Scale size={18} className="text-navy-bar" />
                <span>Luyện án thật môn {subject.name}</span>
              </h2>
              <Link
                href="/luyen-an"
                className="text-xs font-semibold text-navy-bar hover:underline"
              >
                Tất cả vụ án
              </Link>
            </div>
            <div className="space-y-3">
              {caseStudies.map((cs) => (
                <CaseStudyCard key={cs.id} caseStudy={cs} />
              ))}
            </div>
          </div>
        )}

        {/* MỤC E: CÂU HỎI TỪ CỘNG ĐỒNG */}
        <CommunityQuestionsList
          subject={mon as "dan-su" | "hanh-chinh" | "doanh-nghiep"}
          chapter="c01"
        />
      </main>

      <TabBar />
    </div>
  );
}
