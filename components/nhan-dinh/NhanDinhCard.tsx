import React from "react";

interface NhanDinhCardProps {
  statement: string;
}

export function NhanDinhCard({ statement }: NhanDinhCardProps) {
  return (
    <div className="rounded-2xl bg-bg-2 p-5 border border-line mb-6">
      <span className="text-xs font-bold uppercase tracking-wider text-navy-ink block mb-2">
        Nhận định
      </span>
      <p className="text-xl font-semibold leading-relaxed tracking-[-0.01em] text-ink">
        {statement}
      </p>
    </div>
  );
}