import React from "react";

export function Chip({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-1.5 rounded-full bg-bg-2 px-2.5 text-sm font-semibold tabular-nums text-ink ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}