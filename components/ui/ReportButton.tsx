"use client";

import React from "react";
import { REPORT_FORM_URL } from "@/lib/config";

interface ReportButtonProps {
  itemId?: string;
}

export function ReportButton({ itemId }: ReportButtonProps) {
  if (!REPORT_FORM_URL) return null;

  const url = itemId
    ? `${REPORT_FORM_URL}?entry.id=${encodeURIComponent(itemId)}`
    : REPORT_FORM_URL;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink-3 underline hover:text-ink-2"
    >
      Báo sai
    </a>
  );
}