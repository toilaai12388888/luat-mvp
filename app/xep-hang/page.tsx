import React from "react";
import { Metadata } from "next";
import { LeaderboardView } from "@/components/xep-hang/LeaderboardView";

export const metadata: Metadata = {
  title: "Bảng xếp hạng tuần — Luật Lẹ",
  description: "Bảng xếp hạng sinh viên luật toàn quốc và theo từng trường đại học theo tuần.",
};

export default function LeaderboardPage() {
  return <LeaderboardView />;
}
