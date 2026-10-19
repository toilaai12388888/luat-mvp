import React from "react";
import { Check, X } from "lucide-react";
import { OptionState } from "@/components/quiz/optionState";

export interface TrueFalseOptionsProps {
  dungState?: OptionState;
  saiState?: OptionState;
  selected?: "dung" | "sai" | null;
  disabled: boolean;
  onSelect: (val: "dung" | "sai") => void;
}

export function TrueFalseOptions({
  dungState: propDung,
  saiState: propSai,
  selected,
  disabled,
  onSelect,
}: TrueFalseOptionsProps) {
  const dungState: OptionState = propDung !== undefined
    ? propDung
    : selected === "dung" ? "sel" : "idle";
  const saiState: OptionState = propSai !== undefined
    ? propSai
    : selected === "sai" ? "sel" : "idle";

  const getCls = (state: OptionState) => {
    let cls = "border-line-2 bg-surface text-ink";
    let keyCls = "bg-bg-2 text-ink-2";

    if (state === "sel") {
      cls = "border-navy-bar bg-navy-soft shadow-[inset_0_0_0_1px_var(--navy-bar)] text-ink";
      keyCls = "bg-navy-bar text-on-navy";
    } else if (state === "good") {
      cls = "border-good bg-good-soft shadow-[inset_0_0_0_1px_var(--good)] text-ink";
      keyCls = "bg-good text-white";
    } else if (state === "bad") {
      cls = "border-danger bg-danger-soft shadow-[inset_0_0_0_1px_var(--danger)] text-ink";
      keyCls = "bg-danger text-white";
    }

    return { cls, keyCls };
  };

  const dungStyles = getCls(dungState);
  const saiStyles = getCls(saiState);

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect("dung")}
        className={`press flex items-center justify-center gap-3 rounded-2xl border-2 p-5 text-base font-bold transition-all ${dungStyles.cls}`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black transition-colors ${dungStyles.keyCls}`}
        >
          {dungState === "good" ? (
            <Check size={16} strokeWidth={3} />
          ) : dungState === "bad" ? (
            <X size={16} strokeWidth={3} />
          ) : (
            "Đ"
          )}
        </span>
        ĐÚNG
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect("sai")}
        className={`press flex items-center justify-center gap-3 rounded-2xl border-2 p-5 text-base font-bold transition-all ${saiStyles.cls}`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black transition-colors ${saiStyles.keyCls}`}
        >
          {saiState === "good" ? (
            <Check size={16} strokeWidth={3} />
          ) : saiState === "bad" ? (
            <X size={16} strokeWidth={3} />
          ) : (
            "S"
          )}
        </span>
        SAI
      </button>
    </div>
  );
}
