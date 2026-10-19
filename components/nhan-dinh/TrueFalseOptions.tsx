import React from "react";
import { Check, X } from "lucide-react";
import { OptionState } from "@/components/quiz/optionState";

interface TrueFalseOptionsProps {
  dungState: OptionState;
  saiState: OptionState;
  disabled: boolean;
  onSelect: (val: "dung" | "sai") => void;
}

export function TrueFalseOptions({
  dungState,
  saiState,
  disabled,
  onSelect,
}: TrueFalseOptionsProps) {
  const getCls = (state: OptionState) => {
    let cls = "border-line-2 bg-surface text-ink";
    let keyCls = "bg-bg-2 text-ink-2";

    if (state === "sel") {
      cls = "border-navy-bar bg-navy-soft shadow-[inset_0_0_0_1px_var(--navy-bar)] text-ink";
      keyCls = "bg-navy-bar text-on-navy";
    } else if (state === "good") {
      cls = "border-good bg-good-soft shadow-[inset_0_0_0_1px_var(--good)] animate-pop text-ink";
      keyCls = "bg-good text-white";
    } else if (state === "bad") {
      cls = "border-bad bg-bad-soft shadow-[inset_0_0_0_1px_var(--bad)] animate-shake text-ink";
      keyCls = "bg-bad text-white";
    } else if (state === "dim") {
      cls = "border-line bg-surface opacity-45";
      keyCls = "bg-bg-2 text-ink-3";
    }

    return { cls, keyCls };
  };

  const dung = getCls(dungState);
  const sai = getCls(saiState);

  return (
    <div className="flex flex-col gap-3" role="radiogroup">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect("dung")}
        className={`press flex w-full items-center gap-3.5 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-all ${dung.cls} ${
          disabled ? "pointer-events-none" : "cursor-pointer"
        }`}
      >
        <span
          className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold transition-colors ${dung.keyCls}`}
        >
          <Check size={16} strokeWidth={3} />
        </span>
        <span className="flex-1 text-[16px] font-semibold">Đúng</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect("sai")}
        className={`press flex w-full items-center gap-3.5 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-all ${sai.cls} ${
          disabled ? "pointer-events-none" : "cursor-pointer"
        }`}
      >
        <span
          className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold transition-colors ${sai.keyCls}`}
        >
          <X size={16} strokeWidth={3} />
        </span>
        <span className="flex-1 text-[16px] font-semibold">Sai</span>
      </button>
    </div>
  );
}