"use client";

// Controllers
import { usePlayerController } from "../_controllers/player_controller";
// Models
import { LANGS, type Algorithm } from "@/core/models";

export default function CodePanel({ algorithm, currentLine }: { algorithm: Algorithm; currentLine: number }) {
  const codeLang = usePlayerController((state) => state.codeLang);
  const setCodeLang = usePlayerController((state) => state.setCodeLang);

  const lines = algorithm.code[codeLang];
  const ext = LANGS.find((lang) => lang.id === codeLang)?.ext ?? "ts";

  return (
    <div className="card flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-[0.2rem] border-b border-line px-[1rem] py-[0.8rem]">
        {LANGS.map((lang) => (
          <button key={lang.id} type="button" onClick={() => setCodeLang(lang.id)} className={`rounded-[0.5rem] px-[0.9rem] py-[0.5rem] text-[1.2rem] font-medium hover:text-text ${lang.id === codeLang ? "bg-primary-tint text-primary" : "text-muted"}`}>
            {lang.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="font-mono text-[1.05rem] text-faint">
          {algorithm.file}.{ext}
        </span>
      </div>
      <div className="flex-1 overflow-auto py-[1rem] font-mono text-[1.2rem] leading-[1.75]">
        {lines.map((text, index) => {
          const isCurrent = index + 1 === currentLine;
          return (
            <div key={index} className={`grid grid-cols-[3.8rem_minmax(0,1fr)] border-l-2 ${isCurrent ? "border-primary bg-primary-tint" : "border-transparent"}`}>
              <span className={`pr-[1.2rem] text-right select-none ${isCurrent ? "text-primary" : "text-faint"}`}>{index + 1}</span>
              <pre className={`m-0 pr-[1.6rem] font-[inherit] whitespace-pre ${isCurrent ? "text-text" : "text-text-2"}`}>{text || " "}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
