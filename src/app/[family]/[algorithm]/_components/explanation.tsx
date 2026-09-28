"use client";

// Next
import Link from "next/link";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { localize, TRANSLATIONS, type Algorithm, type Family } from "@/core/models";
// Icons
import { ArrowLeftIcon, PlayIcon } from "@/components/icons";
// Utils
import { formatNumber } from "@/utils/format";
import { VIZ_CSS } from "@/utils/viz";

const SECTION = "card flex flex-col gap-[1.8rem] rounded-[1.4rem] px-[3rem] py-[2.8rem]";

export default function Explanation({ algorithm, family, onBackToPlayer }: { algorithm: Algorithm; family: Family; onBackToPlayer: () => void }) {
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];
  const chartMax = Math.log10(Math.max(...algorithm.chart.map((bar) => bar[1])));

  const buildHeading = (number: string, title: string, color?: string) => (
    <div className="flex items-baseline gap-[1.2rem]">
      <span className="font-mono text-[1.1rem] tracking-[0.1em] text-violet">{number}</span>
      <h3 className="text-[1.8rem] font-semibold" style={color ? { color } : undefined}>
        {title}
      </h3>
    </div>
  );

  const buildBullets = (items: string[], color: string) =>
    items.map((text) => (
      <div key={text} className="flex gap-[1.2rem] text-[1.4rem] leading-[1.6]">
        <span className="mt-[0.8rem] h-[0.8rem] w-[0.8rem] flex-none rounded-full" style={{ background: color }} />
        <span>{text}</span>
      </div>
    ));

  return (
    <div className="mt-[0.8rem] flex flex-col gap-[1.8rem] border-t border-line px-[2.8rem] pt-[2.4rem] pb-[8rem]">
      <div className="flex items-end gap-[1.6rem] pt-[1.6rem] pb-[0.4rem]">
        <div className="flex flex-col gap-[0.6rem]">
          <span className="font-mono text-[1.1rem] tracking-[0.1em] text-violet">{`// ${t.howItWorks}`}</span>
          <h2 className="text-[3rem] font-semibold tracking-[-0.02em]">
            {t.understand} {algorithm.name}
          </h2>
        </div>
        <div className="flex-1" />
        <span className="font-mono text-[1.3rem] text-muted">{localize(algorithm.tagline, lang)}</span>
      </div>

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-stretch gap-[1.8rem]">
        <section className={SECTION}>
          {buildHeading("01", t.idea)}
          {localize(algorithm.idea, lang).map((paragraph) => (
            <p key={paragraph} className="max-w-[68ch] text-[1.55rem] leading-[1.7] text-pretty">
              {paragraph}
            </p>
          ))}
        </section>
        <section className={SECTION}>
          {buildHeading("02", t.stagesTitle)}
          <div className="flex flex-col gap-[1rem]">
            {algorithm.stages.map(([key, title, text], index) => (
              <div key={index} className="grid grid-cols-[3.4rem_minmax(0,1fr)] items-start gap-[1.4rem] rounded-[1rem] border-l-[3px] bg-surface-2 px-[1.4rem] py-[1.2rem]" style={{ borderColor: VIZ_CSS[key] }}>
                <span className="font-mono text-[2.2rem] leading-none font-semibold" style={{ color: VIZ_CSS[key] }}>
                  {index + 1}
                </span>
                <div className="flex flex-col gap-[0.3rem]">
                  <span className="text-[1.4rem] font-semibold">{localize(title, lang)}</span>
                  <span className="text-[1.3rem] leading-[1.5] text-text-2">{localize(text, lang)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-3 items-stretch gap-[1.8rem]">
        <section className={SECTION}>
          {buildHeading("03", t.complexity)}
          <div className="flex flex-col">
            {algorithm.complexity.map(([label, value, key, note]) => (
              <div key={value + localize(label, lang)} className="grid grid-cols-[7.6rem_minmax(0,1fr)] items-start gap-[1.2rem] border-b border-line py-[1.1rem]">
                <span className="pt-[0.3rem] text-[1.3rem] text-muted">{localize(label, lang)}</span>
                <div className="flex flex-col gap-[0.3rem]">
                  <span className="font-mono text-[1.7rem] font-medium" style={{ color: VIZ_CSS[key] }}>
                    {value}
                  </span>
                  <span className="text-[1.25rem] leading-[1.45] text-text-2">{localize(note, lang)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className={SECTION}>
          {buildHeading("04", t.versus)}
          <span className="label">{localize(algorithm.chartTitle, lang)}</span>
          <div className="flex flex-1 flex-col justify-center gap-[1.2rem]">
            {algorithm.chart.map(([label, value, isSelf]) => (
              <div key={label} className="grid grid-cols-[7.8rem_minmax(0,1fr)_7.2rem] items-center gap-[1.2rem]">
                <span className={`text-[1.3rem] ${isSelf ? "font-semibold text-text" : "text-muted"}`}>{label}</span>
                <div className="h-[1rem] overflow-hidden rounded-[0.5rem] bg-surface-2">
                  <div className={`h-full rounded-[0.5rem] ${isSelf ? "bg-primary" : "bg-faint"}`} style={{ width: `${Math.max(4, (Math.log10(value) / chartMax) * 100).toFixed(0)}%` }} />
                </div>
                <span className="text-right font-mono text-[1.25rem]">{formatNumber(value, lang)}</span>
              </div>
            ))}
          </div>
          <span className="text-[1.15rem] text-faint">{localize(algorithm.chartNote, lang)}</span>
        </section>
        <section className={SECTION}>
          {buildHeading("05", t.pseudocode)}
          <div className="flex flex-1 flex-col overflow-auto rounded-[1rem] bg-well px-[1.8rem] py-[1.6rem] font-mono text-[1.25rem] leading-[1.8] text-[#b4bacb]">
            {algorithm.pseudo[lang].map((line) => (
              <pre key={line} className="m-0 font-[inherit] whitespace-pre">
                {line}
              </pre>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-3 items-stretch gap-[1.8rem]">
        <section className={SECTION}>
          {buildHeading("06", t.whenToUse, "var(--green)")}
          {buildBullets(localize(algorithm.when, lang), "var(--green)")}
        </section>
        <section className={SECTION}>
          {buildHeading("07", t.pitfalls, "var(--neg)")}
          {buildBullets(localize(algorithm.pitfalls, lang), "var(--neg)")}
        </section>
        <section className={SECTION}>
          {buildHeading("08", t.history)}
          <p className="text-[1.4rem] leading-[1.7] text-pretty text-text-2">{localize(algorithm.history, lang)}</p>
        </section>
      </div>

      <div className="flex items-center gap-[1.2rem] pt-[0.8rem]">
        <Link href={`/${family.id}`} className="btn-outline h-[3.8rem] gap-[0.8rem] rounded-[0.8rem] px-[1.6rem] text-[1.35rem]">
          <ArrowLeftIcon />
          {t.backTo} {localize(family.name, lang)}
        </Link>
        <button type="button" onClick={onBackToPlayer} className="btn-primary h-[3.8rem] px-[1.6rem] text-[1.35rem]">
          <PlayIcon />
          {t.playAgain}
        </button>
      </div>
    </div>
  );
}
