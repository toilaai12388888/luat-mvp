import React from "react";
import Link from "next/link";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col">
      <TopBar showChips={false} />
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl font-black text-ink-3">404</span>
        <h1 className="mt-4 text-2xl font-bold text-ink">Không tìm thấy trang này</h1>
        <p className="mt-2 max-w-xs text-sm text-ink-2">
          Đường dẫn không tồn tại hoặc nội dung đã được cập nhật sang phần khác.
        </p>
        <div className="mt-8 w-full max-w-xs">
          <Link href="/">
            <Button variant="primary">Về Trang chủ</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}