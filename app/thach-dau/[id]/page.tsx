import React from "react";
import { Metadata } from "next";
import { ChallengeView } from "@/components/thach-dau/ChallengeView";

export const metadata: Metadata = {
  title: "Đấu trường Thách đấu — Luật Lẹ",
  description: "Nhận lời thách đấu 10 câu hỏi luật từ bạn bè và so tài kiến thức.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ChallengeView challengeId={id} />;
}
