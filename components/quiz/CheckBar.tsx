import React from "react";
import { Button } from "@/components/ui/Button";

interface CheckBarProps {
  disabled: boolean;
  onCheck: () => void;
}

export function CheckBar({ disabled, onCheck }: CheckBarProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-surface/95 p-4 backdrop-blur-md">
      <Button variant="primary" disabled={disabled} onClick={onCheck}>
        Kiểm tra
      </Button>
    </div>
  );
}