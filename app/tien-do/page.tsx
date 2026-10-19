import React from "react";
import { TopBar } from "@/components/ui/TopBar";
import { TabBar } from "@/components/ui/TabBar";
import { Card } from "@/components/ui/Card";

export default function TienDoPage() {
  return (
    <div className="flex min-h-screen flex-col pb-16">
      <TopBar showChips={false} />
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink mb-4">Tiến độ ôn tập</h1>
        <Card className="mb-4">
          <h2 className="text-sm font-bold text-ink mb-2">Tổng kết học tập</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-bg-2 p-3">
              <span className="text-xs text-ink-2 block">Tổng XP</span>
              <span className="text-lg font-bold text-gold">0</span>
            </div>
            <div className="rounded-xl bg-bg-2 p-3">
              <span className="text-xs text-ink-2 block">Đã làm</span>
              <span className="text-lg font-bold text-ink">0</span>
            </div>
            <div className="rounded-xl bg-bg-2 p-3">
              <span className="text-xs text-ink-2 block">Tỉ lệ đúng</span>
              <span className="text-lg font-bold text-good">0%</span>
            </div>
          </div>
        </Card>
      </main>
      <TabBar />
    </div>
  );
}