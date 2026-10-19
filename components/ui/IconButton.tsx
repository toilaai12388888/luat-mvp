import React from "react";

export function IconButton({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`press flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-transparent text-ink-2 cursor-pointer active:bg-bg-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}