"use client";

import { useEffect } from "react";
import { trackDailyVisit } from "@/lib/usage";

export function UsageTracker() {
  useEffect(() => {
    trackDailyVisit();
  }, []);
  return null;
}
