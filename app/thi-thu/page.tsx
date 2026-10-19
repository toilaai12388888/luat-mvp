import React from "react";
import { Metadata } from "next";
import { ThiThuView } from "@/components/thi-thu/ThiThuView";

export const metadata: Metadata = {
  title: "Thi thử có giờ — Luật Lẹ",
  description: "Thi thử trắc nghiệm và nhận định tính giờ theo chuẩn kỳ thi đại học luật.",
};

export default function ThiThuPage() {
  return <ThiThuView />;
}
