import React from "react";
import { Button } from "@/components/ui/Button";

export interface CheckBarProps {
  disabled?: boolean;
  onCheck?: () => void;
  status?: "idle" | "checked";
  hasSelection?: boolean;
  onContinue?: () => void;
}

export function CheckBar({ disabled, onCheck, status, hasSelection, onContinue }: CheckBarProps) {
  if (status === "checked") {
    return null;
  }
  const isDisabled = disabled !== undefined ? disabled : !hasSelection;
  const handleClick = onCheck || onContinue || (() => {});
  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-surface/95 p-4 backdrop-blur-md">
      <Button variant="primary" disabled={isDisabled} onClick={handleClick}>
        Kiểm tra
      </Button>
    </div>
  );
}
