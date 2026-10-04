"use client";

// Next
import Link from "next/link";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { ALGORITHMS, ALGORITHMS_BY_FAMILY, algorithmPath, FAMILIES, localize, TRANSLATIONS, type FamilyId } from "@/core/models";
// Components
import { AmbientBand, VizCanvas } from "@/components";
import AlgorithmCard from "./algorithm_card";
// Icons
import { BackIcon, PlayIcon } from "@/components/icons";
// Utils
import { VIZ_CSS } from "@/utils/viz";

export default function CategoryView({ familyId }: { familyId: FamilyId }) {
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];
  const family = FAMILIES.find((candidate) => candidate.id === familyId)!;
  const rows = ALGORITHMS_BY_FAMILY[familyId];
  // The start button always opens a page: the family's flagship, else the first row that has one.
  const firstPage = rows.find((row) => row.page)?.page;
  const flagship = family.flagship ? ALGORITHMS[family.flagship] : firstPage ? ALGORITHMS[firstPage] : null;
  const flagshipName = flagship ? flagship.name : rows[0].name;

  const buildStartButton = () => {
    const className = "btn-primary h-[3.2rem] rounded-[0.7rem] px-[1.4rem] text-[1.25rem]";
    const label = (
      <>
        <PlayIcon size={9} />
        {t.startWith} {flagshipName}
      </>
    );
    if (!flagship) return <span className={className}>{label}</span>;
    return (
      <Link href={algorithmPath(flagship)} className={className}>
        {label}
      </Link>
    );
  };

  return (
    <>
      <AmbientBand family={familyId} />
      <div className="relative z-[1] mx-auto flex w-full min-w-[1180px] max-w-[1920px] flex-col gap-[2rem] px-[2.8rem] pt-[2rem] pb-[5.6rem]">
      <div className="card flex items-center gap-[1.2rem] rounded-[1rem] px-[1.6rem] py-[1.2rem]">
        <Link href="/" title={t.home} className="icon-btn flex-none rounded-[0.7rem]">
          <BackIcon />
        </Link>
        <span className="h-[0.8rem] w-[0.8rem] rounded-full bg-violet" />
        <h1 className="text-[1.7rem] font-semibold">{localize(family.name, lang)}</h1>
        <span className="text-[1.25rem] text-muted">
          · {family.count} {t.algorithms} · {localize(family.kind, lang)}
        </span>
        <div className="flex-1" />
        {buildStartButton()}
      </div>

      <section className="grid grid-cols-[minmax(320px,5fr)_minmax(0,7fr)] items-stretch gap-[1.6rem]">
        <div className="card flex flex-col gap-[1.6rem] px-[2.4rem] py-[2.2rem]">
          <div className="font-mono text-[1.1rem] tracking-[0.06em] text-violet">{`// ${family.id}`}</div>
          <p className="text-[1.45rem] leading-[1.65] text-pretty">{localize(family.intro1, lang)}</p>
          <p className="text-[1.35rem] leading-[1.65] text-pretty text-text-2">{localize(family.intro2, lang)}</p>
          <div className="flex-1" />
          <div className="flex flex-col gap-[0.6rem] border-t border-line pt-[1.4rem]">
            <span className="label">{t.startHere}</span>
            {rows.slice(0, 4).map((row, index) => {
              const content = (
                <>
                  <span className="w-[1.4rem] font-mono text-[1.1rem] text-faint">{index + 1}</span>
                  <span className="font-medium">{row.name}</span>
                  <div className="flex-1" />
                  <span className="font-mono text-[1.1rem] text-muted">{row.avg}</span>
                </>
              );
              const className = "flex items-center gap-[1rem] py-[0.4rem] text-[1.3rem]";
              if (!row.page) return <div key={row.name} className={className}>{content}</div>;
              return (
                <Link key={row.name} href={algorithmPath(ALGORITHMS[row.page])} className={`${className} hover:text-primary`}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="card flex min-h-[380px] flex-col overflow-hidden">
          <div className="flex items-center gap-[1.4rem] border-b border-line px-[1.6rem] py-[1.2rem] whitespace-nowrap">
            <div className="flex items-center gap-[0.8rem] text-[1.3rem] font-semibold">
              <span className="h-[0.7rem] w-[0.7rem] rounded-full bg-violet shadow-[0_0_8px_var(--violet)]" />
              {flagshipName}
            </div>
            <div className="font-mono text-[1.1rem] text-faint">{family.flagshipMeta}</div>
            <div className="flex-1" />
            <div className="flex gap-[1.2rem] font-mono text-[1.05rem] text-muted">
              {family.legend.map(([key, label]) => (
                <span key={key} className="flex items-center gap-[0.5rem]">
                  <i className="h-[0.8rem] w-[0.8rem] rounded-[2px]" style={{ background: VIZ_CSS[key] }} />
                  {localize(label, lang)}
                </span>
              ))}
            </div>
          </div>
          <div className="well flex-1 p-[1.6rem]">
            <VizCanvas spec={family.flagshipViz} className="h-full min-h-[300px] w-full" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-[1.4rem]">
        <div className="flex items-baseline gap-[1.2rem]">
          <h2 className="text-[1.6rem] font-semibold">{t.allAlgos}</h2>
          <span className="font-mono text-[1.1rem] text-faint">{family.count}</span>
          <div className="flex-1" />
          <span className="text-[1.25rem] text-muted">{t.cardsHint}</span>
        </div>
        <div className="grid grid-cols-3 gap-[1.4rem]">
          {rows.map((row) => (
            <AlgorithmCard key={row.name} family={family} row={row} />
          ))}
        </div>
      </section>
      </div>
    </>
  );
}
