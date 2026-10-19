import React from "react";
import { ExternalLink } from "lucide-react";
import { CanCu } from "@/lib/content-schema";

interface CanCuListProps {
  items: CanCu[];
}

export function CanCuList({ items }: CanCuListProps) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((c, i) => (
        <a
          key={i}
          href={c.link}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex items-center gap-1.5 rounded-lg border border-line-2 bg-surface px-3 py-1.5 text-xs font-medium text-link hover:underline"
        >
          <span>
            {c.dieu} · {c.van_ban}
          </span>
          <ExternalLink size={13} className="opacity-70" />
        </a>
      ))}
    </div>
  );
}