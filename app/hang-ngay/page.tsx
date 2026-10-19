import React from "react";
import { Metadata } from "next";
import { DailyChallengeView } from "@/components/hang-ngay/DailyChallengeView";

export const metadata: Metadata = {
  title: "Thử thách hằng ngày — Luật Lẹ",
  description: "Mỗi ngày 5 câu hỏi ôn thi Luật giống nhau cho toàn bộ sinh viên, thẻ kết quả Wordle và tính vào chuỗi ngày.",
};

export default function DailyPage() {
  return <DailyChallengeView />;
}
