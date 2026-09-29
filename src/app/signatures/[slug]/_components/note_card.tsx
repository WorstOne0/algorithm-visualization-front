"use client";

// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { TRANSLATIONS } from "@/core/models";

// The sentence for the current step, with an optional mono tag at the right (a phase, a plan stage).
export default function NoteCard({ note, tag }: { note: string; tag?: string }) {
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];

  return (
    <div className="card flex flex-col gap-[0.6rem] px-[1.6rem] py-[1.2rem]">
      <div className="flex items-center gap-[1rem]">
        <span className="label">{t.currentStep}</span>
        <div className="flex-1" />
        {tag && <span className="font-mono text-[1.05rem] text-primary">{tag}</span>}
      </div>
      <p className="min-h-[40px] text-[1.3rem] leading-[1.55] text-pretty">{note}</p>
    </div>
  );
}
