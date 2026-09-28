"use client";

// Next
import Link from "next/link";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import type { PathAlgo } from "@/core/algorithms/pathfinding/grid_search";
import type { SortId } from "@/core/algorithms/sorting/sorts";
import { ALGORITHMS, algorithmPath, localize, TRANSLATIONS, type AlgorithmRow, type Family, type VizSpec } from "@/core/models";
// Components
import { VizCanvas } from "@/components";

// Sorting and pathfinding cards run the row's own algorithm; the other families reuse the family animation, smaller.
const cardSpec = (family: Family, row: AlgorithmRow): VizSpec => {
  if (family.id === "sorting") return { starter: "sort", n: 18, algo: row.viz as SortId, ms: 70, gap: 1.5 };
  if (row.viz === "map") return { starter: "map", perFrame: 6 };
  if (family.id === "pathfinding") return { starter: "path", cols: 26, rows: 9, ms: 60, algo: row.viz as PathAlgo };
  switch (family.card.starter) {
    case "search":
      return { starter: "search", n: 14 };
    case "graph":
      return { starter: "graph", n: 14, r: 3 };
    case "tree":
      return { starter: "tree", n: 14, r: 3 };
    case "minimax":
      return { starter: "minimax", r: 3 };
    default:
      return family.card;
  }
};

export default function AlgorithmCard({ family, row }: { family: Family; row: AlgorithmRow }) {
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];
  const algorithm = row.page ? ALGORITHMS[row.page] : null;

  const buildCell = (label: string, value: string) => (
    <div className="flex flex-col gap-[0.1rem] bg-surface-2 px-[0.8rem] py-[0.6rem]">
      <span className="font-mono text-[0.9rem] tracking-[0.08em] text-faint">{label}</span>
      <span className="font-mono text-[1.15rem]">{value}</span>
    </div>
  );

  const content = (
    <>
      <div className="flex items-center gap-[1rem] px-[1.6rem] pt-[1.3rem] pb-[0.8rem]">
        <span className="text-[1.5rem] font-semibold">{row.name}</span>
        <div className="flex-1" />
        <span className={`font-mono text-[1rem] tracking-[0.06em] ${algorithm ? "text-primary" : "text-faint"}`}>{algorithm ? t.playTag : t.soon}</span>
      </div>
      <p className="px-[1.6rem] pb-[1rem] text-[1.25rem] leading-[1.5] text-pretty text-muted">{localize(row.desc, lang)}</p>
      <div className="mx-[1.6rem] grid grid-cols-3 gap-[1px] overflow-hidden rounded-[0.6rem] border border-line bg-line">
        {buildCell(t.avg, row.avg)}
        {buildCell(t.worst, row.worst)}
        {buildCell(t.space, row.space)}
      </div>
      <div className="mx-[1.6rem] mt-[1.2rem] mb-[1.4rem] h-[96px] overflow-hidden rounded-[0.8rem] border border-line bg-well p-[0.8rem]">
        <VizCanvas spec={cardSpec(family, row)} />
      </div>
    </>
  );

  const className = "card flex flex-col overflow-hidden transition-[border-color,transform] duration-150";

  if (!algorithm) return <div className={`${className} opacity-72`}>{content}</div>;

  return (
    <Link href={algorithmPath(algorithm)} className={`${className} hover:-translate-y-[2px] hover:border-primary`}>
      {content}
    </Link>
  );
}
