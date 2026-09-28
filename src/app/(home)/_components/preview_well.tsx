"use client";

// Next
import Link from "next/link";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { FAMILIES, localize, TRANSLATIONS, type Family, type FamilyId } from "@/core/models";
// Components
import { VizCanvas } from "@/components";

type Props = { family: Family; onPick: (id: FamilyId) => void; rotateMs: number };

export default function PreviewWell({ family, onPick, rotateMs }: Props) {
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];

  return (
    <div className="card flex min-h-[400px] flex-col overflow-hidden shadow-[0_24px_60px_-30px_rgba(0,0,0,.6)]">
      <div className="flex items-center gap-[1.4rem] border-b border-line px-[1.6rem] py-[1.2rem] whitespace-nowrap">
        <span className="label">{t.preview}</span>
        <div className="flex items-center gap-[0.8rem] text-[1.3rem] font-semibold">
          <span className="h-[0.7rem] w-[0.7rem] rounded-full bg-violet shadow-[0_0_8px_var(--violet)]" />
          {localize(family.name, lang)}
        </div>
        <div className="font-mono text-[1.1rem] text-faint">{family.algo}</div>
        <div className="flex-1" />
        <div className="flex items-center gap-[0.6rem]" title={t.stageHint}>
          {FAMILIES.map((candidate) => (
            <button key={candidate.id} type="button" aria-label={localize(candidate.name, lang)} onClick={() => onPick(candidate.id)} className={`h-[0.8rem] rounded-full transition-[width,background-color] duration-300 ${candidate.id === family.id ? "w-[2.4rem] bg-violet" : "w-[0.8rem] bg-faint hover:bg-muted"}`} />
          ))}
        </div>
      </div>
      <div className="well relative flex-1 p-[1.6rem]">
        <VizCanvas spec={family.preview} className="h-full min-h-[280px] w-full" />
        <div key={family.id} className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-violet/60" style={{ animation: `preview-clock ${rotateMs}ms linear forwards` }} />
      </div>
      <div className="flex items-center gap-[1.4rem] border-t border-line px-[1.6rem] py-[1rem]">
        <p className="flex-1 text-[1.25rem] leading-[1.5] text-pretty text-text-2">{localize(family.long, lang)}</p>
        <Link href={`/${family.id}`} className="flex h-[3rem] items-center gap-[0.6rem] rounded-[0.6rem] bg-primary-tint px-[1.2rem] text-[1.25rem] font-medium whitespace-nowrap text-primary hover:bg-primary hover:text-on-primary">
          {t.open} {localize(family.name, lang)} →
        </Link>
      </div>
    </div>
  );
}
