import React from "react";
import { GitFork, Check } from "lucide-react";

interface SoDoNut {
  ten: string;
  con?: string[];
}

interface SoDoItem {
  tieu_de: string;
  nut: SoDoNut[];
}

interface SoDoTreeProps {
  items?: SoDoItem[];
}

export function SoDoTree({ items }: SoDoTreeProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-6">
      {items.map((diagram, dIdx) => (
        <div key={dIdx} className="space-y-3">
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <GitFork size={17} className="text-navy-bar flex-none" />
            <span>{diagram.tieu_de}</span>
          </h3>

          <div className="space-y-3">
            {diagram.nut.map((parent, pIdx) => (
              <div
                key={pIdx}
                className="rounded-2xl border border-line bg-surface p-3.5 shadow-xs space-y-2.5 transition-all hover:border-navy-bar/40"
              >
                {/* Parent block header */}
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-navy-bar text-white text-xs font-bold">
                    {pIdx + 1}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-navy-ink leading-snug">
                    {parent.ten}
                  </span>
                </div>

                {/* Child branch items */}
                {parent.con && parent.con.length > 0 && (
                  <div className="pl-4 border-l-2 border-navy-soft space-y-1.5 ml-3">
                    {parent.con.map((child, cIdx) => (
                      <div
                        key={cIdx}
                        className="rounded-xl border border-line/60 bg-bg-2/80 p-2 text-[11px] sm:text-xs text-ink leading-relaxed flex items-start gap-2 transition-colors hover:bg-navy-soft/30"
                      >
                        <Check size={13} className="text-navy-bar flex-none mt-0.5" />
                        <span className="flex-1">{child}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
