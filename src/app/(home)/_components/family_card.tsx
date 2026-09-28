"use client";

// Next
import Link from "next/link";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { localize, TRANSLATIONS, type Family } from "@/core/models";
// Components
import { VizCanvas } from "@/components";
// Icons
import { ArrowRightIcon } from "@/components/icons";

export default function FamilyCard({ family, isActive, onHover }: { family: Family; isActive: boolean; onHover: () => void }) {
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];

  return (
    <Link href={`/${family.id}`} onMouseEnter={onHover} className={`flex flex-col overflow-hidden rounded-[1.2rem] border bg-surface transition-[border-color,transform] duration-150 hover:-translate-y-[2px] ${isActive ? "border-violet" : "border-line"}`}>
      <div className="flex items-center gap-[1rem] px-[1.6rem] pt-[1.3rem] pb-[1rem]">
        <span className={`h-[0.8rem] w-[0.8rem] rounded-full ${isActive ? "bg-violet" : "bg-faint"}`} />
        <span className="text-[1.5rem] font-semibold">{localize(family.name, lang)}</span>
        <div className="flex-1" />
        <span className="font-mono text-[1.1rem] text-faint">
          {family.count} {t.algorithms}
        </span>
      </div>
      <div className="mx-[1.6rem] h-[116px] overflow-hidden rounded-[0.8rem] border border-line bg-well p-[0.9rem]">
        <VizCanvas spec={family.card} />
      </div>
      <div className="flex flex-col gap-[0.8rem] px-[1.6rem] pt-[1.1rem] pb-[1.3rem]">
        <p className="text-[1.25rem] leading-[1.5] text-pretty text-muted">{localize(family.desc, lang)}</p>
        <div className="flex items-center gap-[0.8rem] font-mono text-[1.05rem] text-faint">
          <span>{family.range}</span>
          <div className="flex-1" />
          <span className="flex items-center gap-[0.4rem] text-text">
            {t.open} <ArrowRightIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}
