"use client";

// Next
import Link from "next/link";
import { useEffect } from "react";
// Controllers
import { useLanguageController, useRoadMapController } from "@/core/controllers";
// Models
import { getRoadMap } from "@/core/algorithms/pathfinding/road_map";
import { ALGORITHMS, algorithmPath, TRANSLATIONS } from "@/core/models";
// Components
import { VizCanvas } from "@/components";
// Icons
import { PlayIcon } from "@/components/icons";
// Utils
import { formatNumber } from "@/utils/format";

// The signature tile: A* running route after route on the real streets, with the map's numbers under it.
export default function Showpiece() {
  const lang = useLanguageController((state) => state.lang);
  const status = useRoadMapController((state) => state.status);
  const load = useRoadMapController((state) => state.load);

  const t = TRANSLATIONS[lang];
  const map = status === "ready" ? getRoadMap() : null;
  const page = ALGORITHMS.roadAstar;

  useEffect(() => {
    load();
  }, [load]);

  const buildStat = (label: string, value: string) => (
    <div className="flex flex-col gap-[0.2rem]">
      <span className="label">{label}</span>
      <span className="font-mono text-[1.6rem] font-semibold">{value}</span>
    </div>
  );

  return (
    <section className="card grid grid-cols-[minmax(300px,4fr)_minmax(0,8fr)] overflow-hidden">
      <div className="flex flex-col gap-[1.6rem] border-r border-line px-[2.4rem] py-[2.2rem]">
        <span className="font-mono text-[1.1rem] tracking-[0.06em] text-violet">{`// ${t.showpieceKicker}`}</span>
        <h2 className="text-[2.6rem] leading-[1.15] font-semibold tracking-[-0.02em] text-pretty">{t.showpieceTitle}</h2>
        <p className="text-[1.35rem] leading-[1.6] text-pretty text-text-2">{t.showpieceText}</p>
        <div className="grid grid-cols-2 gap-x-[1.6rem] gap-y-[1.2rem] border-t border-line pt-[1.4rem]">
          {buildStat(t.city, map ? map.city : "—")}
          {buildStat(t.intersections, map ? formatNumber(map.x.length, lang) : "—")}
          {buildStat(t.segments, map ? formatNumber(map.edges.length, lang) : "—")}
          {buildStat(t.source, "OpenStreetMap")}
        </div>
        <div className="flex-1" />
        <Link href={algorithmPath(page)} className="btn-primary h-[3.8rem] self-start px-[1.6rem] text-[1.35rem]">
          <PlayIcon color="#fff" />
          {t.openMap}
        </Link>
      </div>
      <div className="well relative min-h-[420px]">
        <VizCanvas spec={{ starter: "map", perFrame: 10 }} className="absolute inset-0 h-full w-full" />
      </div>
    </section>
  );
}
