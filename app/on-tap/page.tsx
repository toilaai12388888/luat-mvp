import React from "react";
import { Metadata } from "next";
import { OnTapView } from "@/components/on-tap/OnTapView";

export const metadata: Metadata = {
  title: "Ôn tập câu sai & Đánh dấu — Luật Lẹ",
  description: "Ôn tập lại các câu hỏi đã làm sai và các câu hỏi bạn đã đánh dấu.",
};

export default function OnTapPage() {
  return <OnTapView />;
}
