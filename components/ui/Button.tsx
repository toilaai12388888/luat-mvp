import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "good" | "bad" | "ghost";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  fullWidth = true,
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    "press flex items-center justify-center gap-2 rounded-xl font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none transition-all";
  const width = fullWidth ? "w-full" : "px-4";
  const sizeCls = size === "sm" ? "h-9 text-xs" : size === "lg" ? "h-14 text-lg" : "h-[52px] text-base";

  let variantCls = "";
  switch (variant) {
    case "primary":
      variantCls = "bg-btn text-btn-ink";
      break;
    case "secondary":
      variantCls = "bg-transparent text-ink border-[1.5px] border-line-2";
      break;
    case "good":
      variantCls = "bg-good text-white";
      break;
    case "bad":
      variantCls = "bg-bad text-white";
      break;
    case "ghost":
      variantCls = "bg-transparent text-ink-2 hover:text-ink";
      break;
  }

  return (
    <button
      className={`${base} ${width} ${sizeCls} ${variantCls} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
