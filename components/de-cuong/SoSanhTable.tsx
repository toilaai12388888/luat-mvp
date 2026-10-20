import React from "react";
import { TableProperties } from "lucide-react";

interface SoSanhItem {
  tieu_de: string;
  cot: string[];
  hang: string[][];
}

interface SoSanhTableProps {
  items?: SoSanhItem[];
}

export function SoSanhTable({ items }: SoSanhTableProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-6">
      {items.map((table, tIdx) => (
        <div key={tIdx} className="space-y-2.5">
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <TableProperties size={17} className="text-navy-bar flex-none" />
            <span>{table.tieu_de}</span>
          </h3>

          <div className="relative overflow-x-auto rounded-2xl border border-line bg-surface shadow-xs scrollbar-thin">
            <table className="w-full min-w-[540px] text-left text-xs">
              <thead className="border-b border-line bg-navy-bar text-white font-bold">
                <tr>
                  {table.cot.map((col, cIdx) => (
                    <th key={cIdx} className="px-3.5 py-3 font-bold tracking-tight">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {table.hang.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`transition-colors ${
                      rIdx % 2 === 1 ? "bg-bg-2/50" : "bg-surface"
                    } hover:bg-navy-soft/20`}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-3.5 py-3 leading-relaxed ${
                          cIdx === 0 ? "font-semibold text-navy-ink" : "text-ink-2"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[10px] text-ink-3 italic text-right px-1">
            * Vuốt ngang để xem trọn vẹn các cột so sánh
          </div>
        </div>
      ))}
    </div>
  );
}
