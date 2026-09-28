"use client";

// Next
import Link from "next/link";
import { usePathname } from "next/navigation";
// Controllers
import { useLanguageController, useThemeController } from "@/core/controllers";
// Models
import { FAMILIES, localize } from "@/core/models";
// Icons
import { FamilyIcon, LogoMark, MoonIcon, SunIcon } from "@/components/icons";

const RAIL_ITEM = "flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-[0.8rem] hover:bg-surface-2 hover:text-text";

export default function Sidebar() {
  const pathname = usePathname();
  const lang = useLanguageController((state) => state.lang);
  const theme = useThemeController((state) => state.theme);
  const toggleTheme = useThemeController((state) => state.toggleTheme);

  const activeFamily = pathname.split("/")[1];

  return (
    <aside className="sticky top-0 z-[3] flex h-screen flex-col items-center gap-[0.6rem] border-r border-line bg-side py-[1.2rem]">
      <Link href="/" aria-label="Home">
        <LogoMark />
      </Link>
      <div className="label mt-[0.4rem] mb-[0.2rem]">ALG</div>
      {FAMILIES.map((family) => (
        <Link key={family.id} href={`/${family.id}`} title={localize(family.name, lang)} className={`${RAIL_ITEM} ${family.id === activeFamily ? "bg-surface-2 text-text" : "text-muted"}`}>
          <FamilyIcon id={family.id} />
        </Link>
      ))}
      <div className="flex-1" />
      <button type="button" aria-label="Theme" onClick={toggleTheme} className={`${RAIL_ITEM} text-muted`}>
        {theme === "dark" ? <MoonIcon /> : <SunIcon />}
      </button>
    </aside>
  );
}
