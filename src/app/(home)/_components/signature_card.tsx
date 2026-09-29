"use client";

// Next
import Link from "next/link";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { FAMILIES, localize, signaturePath, TRANSLATIONS, type Signature } from "@/core/models";
// Components
import { VizCanvas } from "@/components";
// Icons
import { ArrowRightIcon } from "@/components/icons";

export default function SignatureCard({ signature }: { signature: Signature }) {
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];
  const family = FAMILIES.find((candidate) => candidate.id === signature.family)!;

  return (
    <Link href={signaturePath(signature)} className="flex flex-col overflow-hidden rounded-[1.2rem] border border-line bg-surface transition-[border-color,transform] duration-150 hover:-translate-y-[2px] hover:border-violet">
      <div className="mx-[1.4rem] mt-[1.4rem] h-[88px] overflow-hidden rounded-[0.8rem] border border-line bg-well p-[0.8rem]">
        <VizCanvas spec={signature.card} />
      </div>
      <div className="flex flex-1 flex-col gap-[0.6rem] px-[1.4rem] pt-[1.1rem] pb-[1.3rem]">
        <span className="font-mono text-[1rem] tracking-[0.06em] text-violet">{`// ${signature.kicker}`}</span>
        <span className="text-[1.4rem] leading-[1.3] font-semibold text-pretty">{localize(signature.name, lang)}</span>
        <p className="text-[1.2rem] leading-[1.5] text-pretty text-muted">{localize(signature.desc, lang)}</p>
        <div className="flex-1" />
        <div className="flex items-center gap-[0.8rem] font-mono text-[1.05rem] text-faint">
          <span>{localize(family.name, lang)}</span>
          <div className="flex-1" />
          <span className="flex items-center gap-[0.4rem] text-text">
            {t.open} <ArrowRightIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}
