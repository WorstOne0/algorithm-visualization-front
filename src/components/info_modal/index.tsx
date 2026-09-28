"use client";

// Next
import { useEffect } from "react";
// Controllers
import { useLanguageController } from "@/core/controllers";
// Models
import { TRANSLATIONS } from "@/core/models";

// The "how this number is computed" sheet: a title, a few lines, closes on Esc, the backdrop or the button.
export default function InfoModal({ title, body, onClose }: { title: string; body: string[]; onClose: () => void }) {
  const lang = useLanguageController((state) => state.lang);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[20] flex items-center justify-center bg-[rgba(4,6,14,.55)] backdrop-blur-[2px]" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="card flex w-[48rem] max-w-[calc(100vw-4rem)] flex-col gap-[1.4rem] rounded-[1.2rem] px-[2.4rem] py-[2.2rem] shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-baseline gap-[1.2rem]">
          <span className="font-mono text-[1.1rem] tracking-[0.1em] text-violet">{`// ${t.howComputed}`}</span>
        </div>
        <h3 className="text-[1.8rem] font-semibold">{title}</h3>
        <div className="flex flex-col gap-[0.8rem]">
          {body.map((line, index) => (
            <p key={index} className={`text-[1.3rem] leading-[1.6] text-pretty ${index === 0 ? "rounded-[0.8rem] bg-well px-[1.4rem] py-[1rem] font-mono text-[1.2rem] text-[#b4bacb]" : "text-text-2"}`}>
              {line}
            </p>
          ))}
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="btn-outline h-[3.2rem] px-[1.4rem] text-[1.25rem]">
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
