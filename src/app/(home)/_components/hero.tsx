"use client";

// Next
import Link from "next/link";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { TRANSLATIONS } from "@/core/models";
// Icons
import { PlayIcon } from "@/components/icons";

export default function Hero({ total }: { total: number }) {
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];
  const counters = [
    { key: "kFamilies", value: "06" },
    { key: "kAlgos", value: String(total) },
    { key: "kLangs", value: "07" },
  ] as const;

  return (
    <div className="flex flex-col justify-center gap-[2rem] py-[1.2rem]">
      <div className="font-mono text-[1.1rem] tracking-[0.06em] text-violet">{t.kicker}</div>
      <h1 className="text-[4.6rem] leading-[1.05] font-semibold tracking-[-0.025em] text-pretty">{t.h1}</h1>
      <p className="max-w-[440px] text-[1.5rem] leading-[1.6] text-pretty text-text-2">{t.lead}</p>
      <div className="flex items-center gap-[1rem]">
        <a href="#families" className="btn-primary h-[3.8rem] px-[1.6rem] text-[1.35rem]">
          {t.explore}
        </a>
        <Link href="/sorting/quick-sort" className="btn-outline h-[3.8rem] gap-[0.8rem] rounded-[0.8rem] bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] px-[1.6rem] text-[1.35rem]">
          <PlayIcon />
          {t.play}
        </Link>
      </div>
      <div className="mt-[0.8rem] flex gap-[2.4rem] border-t border-line pt-[1rem]">
        {counters.map((counter) => (
          <div key={counter.key} className="flex flex-col gap-[0.2rem]">
            <span className="label">{t[counter.key]}</span>
            <span className="font-mono text-[2rem] font-semibold">{counter.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
