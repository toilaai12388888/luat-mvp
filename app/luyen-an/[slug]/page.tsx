import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCaseStudies, getCaseStudyBySlug } from "@/lib/case-studies";
import { CaseStudyRunner } from "@/components/luyen-an/CaseStudyRunner";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const cases = getAllCaseStudies();
  return cases.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    return {
      title: "Không tìm thấy vụ án | Luật Lẹ",
    };
  }

  return {
    title: `${caseStudy.title} — Luyện án thật | Luật Lẹ`,
    description: `Hồ sơ vụ án: ${caseStudy.ho_so.yeu_cau_khoi_kien}. Căn cứ pháp lý, bài tập xác định vấn đề và tự đối chiếu phán quyết của Tòa án.`,
  };
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  return <CaseStudyRunner caseStudy={caseStudy} />;
}
