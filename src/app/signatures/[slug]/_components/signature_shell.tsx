"use client";

// Next
import Link from "next/link";
import { useState, type ReactNode } from "react";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { ALGORITHMS, algorithmPath, FAMILIES, localize, TRANSLATIONS, type Signature } from "@/core/models";
// Icons
import { ArrowRightIcon, BackIcon } from "@/components/icons";

// Header, the page's stage and panels, and the explanation card under them; every signature page renders inside it.
export default function SignatureShell({ signature, children }: { signature: Signature; children: ReactNode }) {
  const lang = useLanguageController((state) => state.lang);
  const [isCopied, setIsCopied] = useState(false);

  const t = TRANSLATIONS[lang];
  const algorithm = ALGORITHMS[signature.algorithm];
  const family = FAMILIES.find((candidate) => candidate.id === signature.family)!;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      window.prompt(t.share, window.location.href);
    }
  };

  return (
    <div className="relative z-[1] mx-auto flex w-full min-w-[1180px] max-w-[1920px] flex-col">
      <div className="flex min-h-[calc(100vh-5.2rem)] flex-col gap-[1.2rem] px-[2.8rem] pt-[1.6rem] pb-[2rem]">
        <div className="card flex items-center gap-[1.2rem] rounded-[1rem] px-[1.6rem] py-[1rem]">
          <Link href="/#signatures" title={t.home} className="icon-btn flex-none rounded-[0.7rem]">
            <BackIcon />
          </Link>
          <span className="h-[0.8rem] w-[0.8rem] rounded-full bg-violet" />
          <h1 className="text-[1.7rem] font-semibold">{localize(signature.name, lang)}</h1>
          <span className="text-[1.25rem] text-muted">· {localize(signature.subtitle, lang)}</span>
          <div className="flex-1" />
          <span className="font-mono text-[1.1rem] text-faint">/signatures/{signature.slug}</span>
          <Link href={algorithmPath(algorithm)} className="btn-outline h-[3rem] px-[1.2rem] text-[1.25rem]">
            {t.fromPage} {algorithm.name}
          </Link>
          <button type="button" onClick={share} className="btn-outline h-[3rem] px-[1.2rem] text-[1.25rem]">
            {isCopied ? t.copied : t.share}
          </button>
        </div>
        {children}
      </div>

      <div className="flex flex-col gap-[1.8rem] px-[2.8rem] pb-[5.6rem]">
        <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[1.8rem]">
          <section className="card flex flex-col gap-[1.8rem] rounded-[1.4rem] px-[3rem] py-[2.8rem]">
            <span className="font-mono text-[1.1rem] tracking-[0.1em] text-violet">{`// ${t.howItWorks}`}</span>
            <h2 className="text-[2.2rem] leading-[1.2] font-semibold tracking-[-0.01em]">{localize(signature.name, lang)}</h2>
            {localize(signature.idea, lang).map((paragraph) => (
              <p key={paragraph} className="text-[1.45rem] leading-[1.65] text-pretty text-text-2">
                {paragraph}
              </p>
            ))}
          </section>
          <section className="card flex flex-col gap-[1.8rem] rounded-[1.4rem] px-[3rem] py-[2.8rem]">
            <span className="font-mono text-[1.1rem] tracking-[0.1em] text-violet">{`// ${signature.kicker}`}</span>
            <h3 className="text-[1.8rem] font-semibold">{t.whatToNotice}</h3>
            <div className="flex flex-col gap-[1.2rem]">
              {localize(signature.notice, lang).map((text) => (
                <div key={text} className="flex gap-[1.2rem] text-[1.4rem] leading-[1.6]">
                  <span className="mt-[0.8rem] h-[0.8rem] w-[0.8rem] flex-none rounded-full bg-violet" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="flex-1" />
            <Link href={algorithmPath(algorithm)} className="btn-primary h-[3.8rem] self-start px-[1.6rem] text-[1.35rem]">
              {t.openAlgorithm}: {algorithm.name}
              <ArrowRightIcon />
            </Link>
            <span className="font-mono text-[1.05rem] text-faint">
              {localize(family.name, lang)} · {t.backTo} /{family.id}/{algorithm.slug}
            </span>
          </section>
        </div>
      </div>
    </div>
  );
}
