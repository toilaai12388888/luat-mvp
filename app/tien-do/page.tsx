import React from "react";
import { TopBar } from "@/components/ui/TopBar";
import { TabBar } from "@/components/ui/TabBar";
import { TienDoView } from "@/components/tien-do/TienDoView";

export default function TienDoPage() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <TopBar showChips={false} />
      <main className="flex-1 px-4 pt-2 pb-6">
        <TienDoView />
      </main>
      <TabBar />
    </div>
  );
}