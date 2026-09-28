"use client";

// Next
import Link from "next/link";

export type RankedRow = { key: string; name: string; meta: string; value: number; valueText: string; href: string };

// A titled list of rows with an inline bar scaled to the largest value.
export default function RankedList({ title, rows, empty }: { title: string; rows: RankedRow[]; empty: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center gap-[1rem] border-b border-line px-[1.6rem] py-[1.1rem]">
        <span className="text-[1.35rem] font-semibold">{title}</span>
        <div className="flex-1" />
        <span className="font-mono text-[1.05rem] text-faint">{rows.length}</span>
      </div>
      {rows.length === 0 && <p className="px-[1.6rem] py-[2rem] text-[1.25rem] leading-[1.5] text-muted">{empty}</p>}
      {rows.map((row, index) => (
        <Link key={row.key} href={row.href} className="grid grid-cols-[2.4rem_minmax(0,1fr)_8rem] items-center gap-[1.2rem] border-b border-line px-[1.6rem] py-[0.9rem] last:border-b-0 hover:bg-surface-2">
          <span className="font-mono text-[1.1rem] text-faint">{String(index + 1).padStart(2, "0")}</span>
          <div className="flex min-w-0 flex-col gap-[0.5rem]">
            <div className="flex items-baseline gap-[0.8rem]">
              <span className="truncate text-[1.3rem] font-medium">{row.name}</span>
              <span className="truncate font-mono text-[1.05rem] text-faint">{row.meta}</span>
            </div>
            <div className="h-[0.6rem] overflow-hidden rounded-[0.3rem] bg-surface-2">
              <div className="h-full rounded-[0.3rem] bg-primary" style={{ width: `${Math.max(3, (row.value / max) * 100).toFixed(0)}%` }} />
            </div>
          </div>
          <span className="text-right font-mono text-[1.25rem]">{row.valueText}</span>
        </Link>
      ))}
    </div>
  );
}
