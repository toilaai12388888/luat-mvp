import React from "react";

export function Card({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}