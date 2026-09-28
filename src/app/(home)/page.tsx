"use client";

// Next
import { useState } from "react";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { FAMILIES, TRANSLATIONS, type FamilyId } from "@/core/models";
// Components
import { VizCanvas } from "@/components";
import FamilyCard from "./_components/family_card";
import Hero from "./_components/hero";
import PreviewWell from "./_components/preview_well";

export default function HomePage() {
  const [hoveredFamily, setHoveredFamily] = useState<FamilyId>("sorting");
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];
  const family = FAMILIES.find((candidate) => candidate.id === hoveredFamily) ?? FAMILIES[0];

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] overflow-hidden">
        <VizCanvas spec={{ starter: "city", cell: 30, speed: 90, alpha: 0.7 }} />
        <div className="city-fade absolute inset-0" />
      </div>
      <div className="relative z-[1] mx-auto flex w-full min-w-[1180px] max-w-[1440px] flex-col gap-[3.6rem] px-[2.8rem] pt-[3.2rem] pb-[5.6rem]">
        <section className="grid grid-cols-[minmax(320px,5fr)_minmax(0,7fr)] items-stretch gap-[2.8rem]">
          <Hero />
          <PreviewWell family={family} />
        </section>
        <section id="families" className="flex flex-col gap-[1.4rem]">
          <div className="flex items-baseline gap-[1.2rem]">
            <h2 className="text-[1.6rem] font-semibold">{t.families}</h2>
            <span className="font-mono text-[1.1rem] text-faint">06 / 52</span>
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
