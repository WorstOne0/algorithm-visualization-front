"use client";

// Next
import { useCallback, useEffect, useMemo, useState } from "react";
// Controllers
import { useLanguageController, useThemeController } from "@/core/controllers";
import { useSignaturePlayerController } from "../_controllers/signature_player_controller";
// Models
import { queryCommand, recordMongoIndex, type MongoQuery } from "@/core/algorithms/signatures/mongo_index";
import { localize, type Localized, type Signature, type VizKey } from "@/core/models";
// Components
import { KpiTiles } from "@/components";
import NoteCard from "./note_card";
import SignatureShell from "./signature_shell";
import StepPlayer from "./step_player";
import TerminalCard, { type TerminalLine } from "./terminal_card";
// Utils
import { counterText } from "@/utils/format";
import { drawStep, setVizTheme, type Ctx } from "@/utils/viz";

const LEGEND: [VizKey, Localized][] = [["act", { en: "page being read", pt: "página sendo lida" }], ["primary", { en: "pages read", pt: "páginas lidas" }], ["green", { en: "match", pt: "acerto" }], ["amber", { en: "split halves", pt: "metades divididas" }], ["violet", { en: "received a key", pt: "recebeu uma chave" }]];

const T = {
  en: { docs: "DOCUMENTS", docsSub: "in the users collection", pages: "INDEX PAGES", pagesSub: "B-tree nodes, height", read: "PAGES READ", readSub: "by the current query", keys: "KEYS EXAMINED", keysSub: "comparisons inside pages", examined: "DOCS EXAMINED", examinedSub: "fetched through the index", size: "Documents", shuffle: "New collection", find: "find equal", range: "find range", age: "age", from: "from", to: "to", queries: "QUERIES", inserted: "documents inserted", building: "building", collscan: "a COLLSCAN would examine" },
  pt: { docs: "DOCUMENTOS", docsSub: "na coleção users", pages: "PÁGINAS DO ÍNDICE", pagesSub: "nós da B-tree, altura", read: "PÁGINAS LIDAS", readSub: "pela consulta atual", keys: "CHAVES EXAMINADAS", keysSub: "comparações dentro das páginas", examined: "DOCS EXAMINADOS", examinedSub: "buscados pelo índice", size: "Documentos", shuffle: "Nova coleção", find: "find igual", range: "find faixa", age: "idade", from: "de", to: "até", queries: "CONSULTAS", inserted: "documentos inseridos", building: "montando", collscan: "um COLLSCAN examinaria" },
};

const INPUT = "h-[3rem] w-[6.4rem] rounded-[0.6rem] border border-line-2 bg-side px-[0.8rem] font-mono text-[1.2rem] text-text outline-none focus:border-primary";

export default function MongoIndexPage({ signature }: { signature: Signature }) {
  const lang = useLanguageController((state) => state.lang);
  const theme = useThemeController((state) => state.theme);
  const idx = useSignaturePlayerController((state) => state.idx);
  const restart = useSignaturePlayerController((state) => state.restart);
  const [n, setN] = useState(20);
  const [seed, setSeed] = useState(7);
  // Until the visitor types one, the age to look up is a real one from the middle of the collection.
  const [typedAge, setTypedAge] = useState<number | null>(null);
  const [from, setFrom] = useState(30);
  const [to, setTo] = useState(45);
  const [query, setQuery] = useState<MongoQuery | null>(null);

  const t = T[lang];
  const recording = useMemo(() => recordMongoIndex(n, seed, query), [n, seed, query]);
  const steps = recording.steps;
  const last = steps.length - 1;
  const step = steps[Math.min(idx, last)];
  const isQuery = step.phase === "query";
  const age = typedAge ?? recording.docs[Math.floor(recording.docs.length / 2)].age;

  useEffect(() => {
    restart(true, query ? recording.queryStart : 0);
  }, [recording, query, restart]);

  const draw = useCallback(
    (ctx: Ctx, w: number, h: number, progress: number) => {
      setVizTheme(theme);
      drawStep(ctx, w, h, "btree", step, progress);
    },
    [step, theme]
  );

  const resize = (value: number) => {
    setN(value);
    setQuery(null);
  };
  const shuffle = () => {
    setSeed((value) => value + 1);
    setQuery(null);
  };

  const kpis = [
    { label: t.docs, value: n, sub: t.docsSub, isOn: true },
    { label: t.pages, value: counterText(step.counters.pages, lang), unit: `h ${counterText(step.counters.height, lang)}`, sub: t.pagesSub },
    { label: t.read, value: isQuery ? counterText(step.counters.pagesRead, lang) : "—", sub: t.readSub },
    { label: t.keys, value: isQuery ? counterText(step.counters.keysExamined, lang) : "—", sub: t.keysSub },
    { label: t.examined, value: isQuery ? counterText(step.counters.docsExamined, lang) : "—", delta: isQuery ? `vs ${n} COLLSCAN` : undefined, sub: t.examinedSub },
  ];

  const lines: TerminalLine[] = [
    { text: "use shop", kind: "cmd" },
    { text: "switched to db shop", kind: "dim" },
    { text: `db.users.insertMany([ /* ${n} ${t.inserted} */ ])`, kind: "cmd" },
    { text: `{ acknowledged: true, insertedCount: ${n} }`, kind: "dim" },
    { text: "db.users.createIndex({ age: 1 })", kind: "cmd" },
    idx < recording.queryStart - 1 ? { text: `${t.building}… ${counterText(step.counters.pages, lang)} pages`, kind: "dim" } : { text: '"age_1"', kind: "ok" },
  ];
  if (query && isQuery) {
    lines.push({ text: `${queryCommand(query)}.explain("executionStats")`, kind: "cmd" });
    lines.push({ text: `stage: "IXSCAN"   indexName: "age_1"`, kind: "ok" });
    lines.push({ text: `totalKeysExamined: ${step.counters.keysExamined}   pagesRead: ${step.counters.pagesRead}` });
    lines.push({ text: `totalDocsExamined: ${step.counters.docsExamined}   nReturned: ${step.results.length}` });
    lines.push({ text: `${t.collscan} ${n}`, kind: "dim" });
    step.results.slice(0, 6).forEach((doc) => lines.push({ text: `{ _id: ${doc.id}, name: "${doc.name}", age: ${doc.age} }` }));
    if (step.results.length > 6) lines.push({ text: `… ${step.results.length - 6} more`, kind: "dim" });
  }

  return (
    <SignatureShell signature={signature}>
      <KpiTiles kpis={kpis} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[1.2rem]">
        <StepPlayer legend={LEGEND} meta={localize(recording.meta, lang)} last={last} stepMs={360} draw={draw} animateMs={260}>
          <span className="text-[1.2rem] text-muted">{t.size}</span>
          <input type="range" min={8} max={40} step={4} value={n} onChange={(event) => resize(Number(event.target.value))} className="w-[9rem]" />
          <span className="w-[2.2rem] font-mono text-[1.1rem]">{n}</span>
          <button type="button" onClick={shuffle} className="btn-outline h-[3rem] px-[1rem] text-[1.2rem]">
            {t.shuffle}
          </button>
        </StepPlayer>
        <div className="flex min-h-0 flex-col gap-[1.2rem]">
          <div className="card flex flex-col gap-[1rem] px-[1.6rem] py-[1.2rem]">
            <span className="label">{t.queries}</span>
            <div className="flex items-center gap-[0.8rem]">
              <span className="w-[3.6rem] font-mono text-[1.1rem] text-muted">{t.age}</span>
              <input type="number" min={1} max={99} value={age} onChange={(event) => setTypedAge(Number(event.target.value))} className={INPUT} />
              <button type="button" onClick={() => setQuery({ kind: "eq", age })} className="btn-primary h-[3rem] px-[1.2rem] font-mono text-[1.15rem]">
                {t.find}
              </button>
              <span className="ml-auto font-mono text-[1.05rem] text-faint">{`find({ age: ${age} })`}</span>
            </div>
            <div className="flex items-center gap-[0.8rem]">
              <span className="w-[3.6rem] font-mono text-[1.1rem] text-muted">{t.from}</span>
              <input type="number" min={1} max={99} value={from} onChange={(event) => setFrom(Number(event.target.value))} className={INPUT} />
              <span className="font-mono text-[1.1rem] text-muted">{t.to}</span>
              <input type="number" min={1} max={99} value={to} onChange={(event) => setTo(Number(event.target.value))} className={INPUT} />
              <button type="button" onClick={() => setQuery({ kind: "range", from: Math.min(from, to), to: Math.max(from, to) })} className="btn-primary h-[3rem] px-[1.2rem] font-mono text-[1.15rem]">
                {t.range}
              </button>
            </div>
          </div>
          <TerminalCard title="mongosh" lines={lines} />
          <NoteCard note={localize(step.note, lang)} tag={isQuery ? "IXSCAN" : step.aside || "createIndex"} />
        </div>
      </div>
    </SignatureShell>
  );
}
