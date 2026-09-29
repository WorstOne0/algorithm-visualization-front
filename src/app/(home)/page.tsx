"use client";

// Next
import { useEffect, useState } from "react";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { FAMILIES, SIGNATURES, TRANSLATIONS } from "@/core/models";
// Components
import { AmbientBand } from "@/components";
import FamilyCard from "./_components/family_card";
import Hero from "./_components/hero";
import PreviewWell from "./_components/preview_well";
import Showpiece from "./_components/showpiece";
import SignatureCard from "./_components/signature_card";

// The preview well rotates through the families; picking one in its header restarts the clock.
const ROTATE_MS = 30000;

export default function HomePage() {
  const [index, setIndex] = useState(0);
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];
  const family = FAMILIES[index];
  const total = FAMILIES.reduce((sum, candidate) => sum + candidate.count, 0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % FAMILIES.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [index]);

  return (
    <>
      <AmbientBand family={family.id} />
      <div className="relative z-[1] mx-auto flex w-full min-w-[1180px] max-w-[1920px] flex-col gap-[3.6rem] px-[2.8rem] pt-[3.2rem] pb-[5.6rem]">
        <section className="grid grid-cols-[minmax(320px,5fr)_minmax(0,7fr)] items-stretch gap-[2.8rem]">
          <Hero total={total} />
          <PreviewWell family={family} onPick={(id) => setIndex(FAMILIES.findIndex((candidate) => candidate.id === id))} rotateMs={ROTATE_MS} />
        </section>
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
              <FamilyCard key={candidate.id} family={candidate} isActive={candidate.id === family.id} />
            ))}
          </div>
        </section>
        <section id="signatures" className="flex flex-col gap-[1.4rem]">
          <div className="flex items-end gap-[1.2rem]">
            <div className="flex flex-col gap-[0.4rem]">
              <span className="font-mono text-[1.1rem] tracking-[0.1em] text-violet">{`// ${t.showpieceKicker}`}</span>
              <h2 className="text-[1.6rem] font-semibold">{t.signatures}</h2>
            </div>
            <div className="flex-1" />
            <span className="text-[1.25rem] text-muted">{t.signaturesHint}</span>
          </div>
          <Showpiece />
          <div className="grid grid-cols-4 gap-[1.4rem]">
            {SIGNATURES.map((signature) => (
              <SignatureCard key={signature.id} signature={signature} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
