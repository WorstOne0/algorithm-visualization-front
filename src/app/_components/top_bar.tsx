"use client";

// Next
import Link from "next/link";
import { usePathname } from "next/navigation";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { findAlgorithm, findFamily, findSignature, localize, TRANSLATIONS, type Lang } from "@/core/models";
// Icons
import { SearchIcon } from "@/components/icons";

const LANG_TAB = "px-[0.9rem] py-[0.7rem] font-mono text-[1.1rem]";

export default function TopBar() {
  const pathname = usePathname();
  const lang = useLanguageController((state) => state.lang);
  const setLang = useLanguageController((state) => state.setLang);

  const t = TRANSLATIONS[lang];
  const [familyId, algorithmSlug] = pathname.split("/").filter(Boolean);
  const family = familyId ? findFamily(familyId) : undefined;
  const algorithm = family && algorithmSlug ? findAlgorithm(family.id, algorithmSlug) : undefined;
  const signature = familyId === "signatures" && algorithmSlug ? findSignature(algorithmSlug) : undefined;

  const buildLangTab = (id: Lang) => (
    <button type="button" onClick={() => setLang(id)} className={`${LANG_TAB} ${lang === id ? "bg-surface-2 text-text" : "text-faint"}`}>
      {id.toUpperCase()}
    </button>
  );

  return (
    <header className="sticky top-0 z-[2] flex h-[5.2rem] items-center gap-[1.6rem] border-b border-line bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] px-[2.4rem] backdrop-blur-[8px]">
      <div className="flex items-center gap-[0.8rem] text-[1.3rem] text-muted">
        <Link href="/" className="flex items-center gap-[0.8rem] hover:text-text">
          <span className="h-[0.6rem] w-[0.6rem] rounded-[2px] bg-primary" />
          {t.home}
        </Link>
        {family && (
          <>
            <span className="text-faint">/</span>
            <Link href={`/${family.id}`} className={algorithm ? "hover:text-text" : "text-text"}>
              {localize(family.name, lang)}
            </Link>
          </>
        )}
        {algorithm && (
          <>
            <span className="text-faint">/</span>
            <span className="text-text">{algorithm.name}</span>
          </>
        )}
        {signature && (
          <>
            <span className="text-faint">/</span>
            <Link href="/#signatures" className="hover:text-text">
              {t.signatures}
            </Link>
            <span className="text-faint">/</span>
            <span className="text-text">{localize(signature.name, lang)}</span>
          </>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex h-[3.2rem] w-[30rem] items-center gap-[0.8rem] rounded-[0.7rem] border border-line-2 bg-side px-[1rem] text-[1.25rem] text-faint">
        <SearchIcon />
        <span className="flex-1">{t.search}</span>
        <span className="rounded-[4px] border border-line-2 px-[0.5rem] py-[0.1rem] font-mono text-[1rem]">CTRL K</span>
      </div>
      <div className="flex overflow-hidden rounded-[0.7rem] border border-line-2">
        {buildLangTab("pt")}
        {buildLangTab("en")}
      </div>
    </header>
  );
}
