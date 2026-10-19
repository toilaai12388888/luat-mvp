import React from "react";
import { ReportButton } from "./ReportButton";

interface AiNoteProps {
  itemId?: string;
}

export function AiNote({ itemId }: AiNoteProps) {
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-ink-3">
      <span>Giải thích do AI soạn, đã đối chiếu điều luật.</span>
      <ReportButton itemId={itemId} />
    </div>
  );
}