"use client";

// Next
import { useState } from "react";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { FAMILIES, TRANSLATIONS, type FamilyId } from "@/core/models";
// Components
import { AmbientBand } from "@/components";
import FamilyCard from "./_components/family_card";
import Hero from "./_components/hero";
import PreviewWell from "./_components/preview_well";
import RunsDashboard from "./_components/runs_dashboard";
import Showpiece from "./_components/showpiece";

export default function HomePage() {
  const [hoveredFamily, setHoveredFamily] = useState<FamilyId>("sorting");
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];
  const family = FAMILIES.find((candidate) => candidate.id === hoveredFamily) ?? FAMILIES[0];
  const total = FAMILIES.reduce((sum, candidate) => sum + candidate.count, 0);

  return (
    <>
      <AmbientBand family={hoveredFamily} />
      <div className="relative z-[1] mx-auto flex w-full min-w-[1180px] max-w-[1920px] flex-col gap-[3.6rem] px-[2.8rem] pt-[3.2rem] pb-[5.6rem]">
        <section className="grid grid-cols-[minmax(320px,5fr)_minmax(0,7fr)] items-stretch gap-[2.8rem]">
          <Hero total={total} />
          <PreviewWell family={family} />
        </section>
        <Showpiece />
        <RunsDashboard />
        <section id="families" className="flex flex-col gap-[1.4rem]">
          <div className="flex items-baseline gap-[1.2rem]">
            <h2 className="text-[1.6rem] font-semibold">{t.families}</h2>
            <span className="font-mono text-[1.1rem] text-faint">
              {String(FAMILIES.length).padStart(2, "0")} / {total}
            </span>
            <div className="flex-1" />
            <span className="text-[1.25rem] text-muted">{t.familiesHint}</span>
          </div>
          <div className="grid grid-cols-3 gap-[1.4rem]">
            {FAMILIES.map((candidate) => (
              <FamilyCard key={candidate.id} family={candidate} isActive={candidate.id === hoveredFamily} onHover={() => setHoveredFamily(candidate.id)} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
