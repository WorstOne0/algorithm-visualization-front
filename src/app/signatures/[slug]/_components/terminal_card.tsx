"use client";

// Next
import { useEffect, useRef } from "react";

export type TerminalLine = { text: string; kind?: "cmd" | "ok" | "err" | "dim" };

const KIND_CLASS: Record<NonNullable<TerminalLine["kind"]>, string> = { cmd: "text-text", ok: "text-green", err: "text-neg", dim: "text-faint" };

// A mono transcript (mongosh, npm, bash) that keeps its last line in view as steps append to it.
export default function TerminalCard({ title, lines, minHeight = 160 }: { title: string; lines: TerminalLine[]; minHeight?: number }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center gap-[0.8rem] border-b border-line px-[1.4rem] py-[0.8rem]">
        <span className="h-[0.8rem] w-[0.8rem] rounded-full bg-faint" />
        <span className="font-mono text-[1.05rem] text-muted">{title}</span>
      </div>
      <div ref={bodyRef} className="well flex-1 overflow-auto px-[1.4rem] py-[1rem] font-mono text-[1.15rem] leading-[1.7]" style={{ minHeight, maxHeight: 300 }}>
        {lines.map((line, index) => (
          <pre key={index} className={`m-0 font-[inherit] whitespace-pre-wrap ${line.kind ? KIND_CLASS[line.kind] : "text-text-2"}`}>
            {line.kind === "cmd" ? `> ${line.text}` : line.text || " "}
          </pre>
        ))}
      </div>
    </div>
  );
}
