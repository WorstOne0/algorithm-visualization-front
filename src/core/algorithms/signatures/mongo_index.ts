// Models
import type { Localized } from "@/core/models/translations";
// Utils
import { seeded } from "../random";
import type { Counter, StepBase } from "../recording";
import { MAX_KEYS, type LaidBNode } from "../trees/record_btree";
import type { NodeMark } from "../trees/tree_model";

export type MongoDoc = { id: number; name: string; age: number };
export type MongoQuery = { kind: "eq"; age: number } | { kind: "range"; from: number; to: number };
// The step draws with the B-tree renderer; `command` is the mongosh line being executed and `results` the documents fetched so far.
export type MongoStep = StepBase & { nodes: LaidBNode[]; depth: number; aside: string; phase: "build" | "query"; command: string; results: MongoDoc[] };
export type MongoRecording = { steps: MongoStep[]; meta: Localized; docs: MongoDoc[]; queryStart: number };

const NAMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabriela", "Hugo", "Isabela", "João", "Karina", "Lucas", "Mariana", "Nicolas", "Olívia", "Paulo", "Rafaela", "Samuel", "Tainá", "Vitor", "Yasmin", "Zeca", "Beatriz", "Caio", "Débora", "Eduardo", "Fernanda", "Gustavo", "Helena", "Igor", "Júlia", "Kauã", "Larissa", "Marcos", "Natália", "Otávio", "Priscila", "Renato", "Sofia", "Thiago"];

type Page = { id: number; keys: number[]; children: Page[] };

export const queryCommand = (query: MongoQuery) => (query.kind === "eq" ? `db.users.find({ age: ${query.age} })` : `db.users.find({ age: { $gte: ${query.from}, $lte: ${query.to} } })`);

// Ages are distinct so every key is one document and the tree stays readable; a real index would key on (age, RecordId).
export function recordMongoIndex(n: number, seed: number, query: MongoQuery | null): MongoRecording {
  const rand = seeded(seed);
  const ages: number[] = [];
  while (ages.length < n) {
    const age = 18 + Math.floor(rand() * 62);
    if (!ages.includes(age)) ages.push(age);
  }
  const pool = [...NAMES];
  const docs: MongoDoc[] = ages.map((age, index) => ({ id: index + 1, name: pool.splice(Math.floor(rand() * pool.length), 1)[0], age }));
  const docByAge = new Map(docs.map((doc) => [doc.age, doc]));

  const steps: MongoStep[] = [];
  const marks = new Map<number, NodeMark>();
  const hot = new Map<number, number>();
  let nextId = 0;
  const makePage = (): Page => ({ id: nextId++, keys: [], children: [] });
  let root = makePage();
  let phase: MongoStep["phase"] = "build";
  let command = "db.users.createIndex({ age: 1 })";
  let stage = "—";
  let keysExamined = 0;
  let pagesRead = 0;
  let results: MongoDoc[] = [];
  const pageCount = (page: Page): number => 1 + page.children.reduce((sum, child) => sum + pageCount(child), 0);
  const height = (page: Page): number => (page.children.length ? 1 + height(page.children[0]) : 1);
  const show = (page: Page) => `[${page.keys.join(" ")}]`;
  const counters = (): Record<string, Counter> => ({ docs: n, pages: pageCount(root), height: height(root), keysExamined, pagesRead, docsExamined: results.length, collscan: n, stage });

  const layout = () => {
    const nodes: LaidBNode[] = [];
    let slot = 0;
    let depth = 0;
    const walk = (page: Page, level: number, parent: number | null): number => {
      depth = Math.max(depth, level);
      const x = page.children.length ? page.children.map((child) => walk(child, level + 1, page.id)).reduce((sum, value) => sum + value, 0) / page.children.length : slot++;
      nodes.push({ id: page.id, keys: [...page.keys], x, depth: level, parent, mark: marks.get(page.id), hot: hot.get(page.id) });
      return x;
    };
    walk(root, 0, null);
    const width = Math.max(slot - 1, 1);
    nodes.forEach((node) => {
      node.x = slot === 1 ? 0.5 : node.x / width;
    });
    return { nodes, depth };
  };
  const push = (note: Localized, aside = "") => steps.push({ ...layout(), aside, phase, command, results: [...results], line: 0, note, counters: counters() });

  const splitChild = (parent: Page, index: number) => {
    const full = parent.children[index];
    const sibling = makePage();
    const middle = full.keys[1];
    sibling.keys = full.keys.slice(2);
    full.keys = full.keys.slice(0, 1);
    if (full.children.length) {
      sibling.children = full.children.slice(2);
      full.children = full.children.slice(0, 2);
    }
    parent.keys.splice(index, 0, middle);
    parent.children.splice(index + 1, 0, sibling);
    marks.set(full.id, "pivot");
    marks.set(sibling.id, "pivot");
    marks.set(parent.id, "fresh");
    hot.set(parent.id, index);
    return middle;
  };
  const insertNonFull = (page: Page, doc: MongoDoc) => {
    let index = page.keys.length - 1;
    while (index >= 0 && doc.age < page.keys[index]) index--;
    if (!page.children.length) {
      page.keys.splice(index + 1, 0, doc.age);
      marks.set(page.id, "cur");
      hot.set(page.id, index + 1);
      push({ en: `Index { name: "${doc.name}", age: ${doc.age} }: key ${doc.age} lands in leaf page ${show(page)}, pointing at document ${doc.id}.`, pt: `Indexa { name: "${doc.name}", age: ${doc.age} }: a chave ${doc.age} cai na página folha ${show(page)}, apontando para o documento ${doc.id}.` }, `_id: ${doc.id}`);
      return;
    }
    index++;
    if (page.children[index].keys.length === MAX_KEYS) {
      const before = show(page.children[index]);
      const middle = splitChild(page, index);
      push({ en: `Child page ${before} is full: split it, ${middle} moves up into ${show(page)}. A real index splits pages the same way when they overflow.`, pt: `A página filha ${before} está cheia: divide, ${middle} sobe para ${show(page)}. Um índice real divide páginas do mesmo jeito quando transbordam.` }, `_id: ${doc.id}`);
      if (doc.age > middle) index++;
    }
    insertNonFull(page.children[index], doc);
  };

  push({ en: `Collection users holds ${n} documents and no index: find({ age: x }) has to read all ${n} (COLLSCAN). Build the index on age: one B-tree key per document.`, pt: `A coleção users tem ${n} documentos e nenhum índice: find({ age: x }) precisa ler todos os ${n} (COLLSCAN). Monta o índice por idade: uma chave de B-tree por documento.` });
  docs.forEach((doc) => {
    marks.clear();
    hot.clear();
    if (root.keys.length === MAX_KEYS) {
      const oldRoot = root;
      root = makePage();
      root.children.push(oldRoot);
      splitChild(root, 0);
      push({ en: `Root ${show(oldRoot)} is full: a new root ${show(root)} is created above it and the index grows to height ${height(root)}.`, pt: `A raiz ${show(oldRoot)} está cheia: uma nova raiz ${show(root)} é criada acima e o índice cresce para altura ${height(root)}.` }, `_id: ${doc.id}`);
    }
    insertNonFull(root, doc);
  });
  marks.clear();
  hot.clear();
  push({ en: `Index age_1 ready: ${n} keys in ${pageCount(root)} pages, height ${height(root)}. Any lookup now reads at most ${height(root)} pages. Run a find to watch it.`, pt: `Índice age_1 pronto: ${n} chaves em ${pageCount(root)} páginas, altura ${height(root)}. Qualquer busca agora lê no máximo ${height(root)} páginas. Rode um find para ver.` });
  const queryStart = steps.length;
  const meta: Localized = { en: `${n} documents · order 4 · seed ${seed}`, pt: `${n} documentos · ordem 4 · seed ${seed}` };
  if (!query) return { steps, meta, docs, queryStart };

  phase = "query";
  stage = "IXSCAN";
  command = queryCommand(query);
  const settle = () => marks.forEach((mark, id) => mark === "cur" && marks.set(id, "path"));
  const target = query.kind === "eq" ? query.age : query.from;
  let page = root;
  // The descent: at each page, count the keys compared until the first one at or past the target.
  while (true) {
    settle();
    marks.set(page.id, "cur");
    pagesRead++;
    let index = 0;
    while (index < page.keys.length && page.keys[index] < target) index++;
    keysExamined += Math.min(index + 1, page.keys.length);
    const hit = index < page.keys.length && page.keys[index] === target;
    if (hit && query.kind === "eq") {
      const doc = docByAge.get(target)!;
      hot.set(page.id, index);
      marks.set(page.id, "done");
      results = [doc];
      push({ en: `Page ${show(page)}: key ${target} found in slot ${index + 1}. Its pointer fetches the document of ${doc.name}. ${pagesRead} pages read, ${keysExamined} keys examined, 1 document; a COLLSCAN would examine all ${n}.`, pt: `Página ${show(page)}: chave ${target} encontrada na posição ${index + 1}. O ponteiro busca o documento de ${doc.name}. ${pagesRead} páginas lidas, ${keysExamined} chaves examinadas, 1 documento; um COLLSCAN examinaria todos os ${n}.` }, `_id: ${doc.id}`);
      break;
    }
    if (!page.children.length || hit) {
      if (query.kind === "eq") {
        push({ en: `Leaf page ${show(page)} has no key ${target}: the query returns nothing after ${pagesRead} page reads. A COLLSCAN would read all ${n} documents to say the same.`, pt: `A página folha ${show(page)} não tem a chave ${target}: a consulta não retorna nada depois de ${pagesRead} leituras de página. Um COLLSCAN leria todos os ${n} documentos para dizer o mesmo.` });
        break;
      }
      push({ en: `Page ${show(page)}: the first key at or past ${query.from} is here. Now walk the keys in order until one passes ${query.to}.`, pt: `Página ${show(page)}: a primeira chave a partir de ${query.from} está aqui. Agora percorre as chaves em ordem até uma passar de ${query.to}.` });
      break;
    }
    hot.set(page.id, Math.min(index, page.keys.length - 1));
    const reason = index < page.keys.length ? `${target} < ${page.keys[index]}` : `${target} > ${page.keys[page.keys.length - 1]}`;
    push({ en: `Page ${show(page)}: ${reason}, descend into child ${index + 1} of ${page.children.length}.`, pt: `Página ${show(page)}: ${reason}, desce para o filho ${index + 1} de ${page.children.length}.` });
    page = page.children[index];
  }
  if (query.kind === "range") {
    // In-order walk from the first key in range; the pages already read on the way down are not counted again.
    const visited = new Set<number>([...marks.keys()]);
    const sequence: { page: Page; index: number }[] = [];
    const walk = (node: Page) => {
      node.keys.forEach((_, index) => {
        if (node.children.length) walk(node.children[index]);
        sequence.push({ page: node, index });
      });
      if (node.children.length) walk(node.children[node.keys.length]);
    };
    walk(root);
    const first = sequence.findIndex((entry) => entry.page.keys[entry.index] >= query.from);
    let stopped = false;
    for (let i = first < 0 ? sequence.length : first; i < sequence.length; i++) {
      const { page: current, index } = sequence[i];
      const key = current.keys[index];
      if (!visited.has(current.id)) {
        visited.add(current.id);
        pagesRead++;
      }
      keysExamined++;
      if (key > query.to) {
        settle();
        marks.set(current.id, "cur");
        hot.set(current.id, index);
        stopped = true;
        push({ en: `Key ${key} > ${query.to}: stop. ${results.length} documents matched in ${pagesRead} page reads; a COLLSCAN would test all ${n}.`, pt: `Chave ${key} > ${query.to}: para. ${results.length} documentos casaram em ${pagesRead} leituras de página; um COLLSCAN testaria todos os ${n}.` });
        break;
      }
      const doc = docByAge.get(key)!;
      results = [...results, doc];
      settle();
      marks.set(current.id, "done");
      hot.set(current.id, index);
      push({ en: `Key ${key} is in range: fetch the document of ${doc.name} (${results.length} so far).`, pt: `Chave ${key} está na faixa: busca o documento de ${doc.name} (${results.length} até aqui).` }, `_id: ${doc.id}`);
    }
    if (!stopped) push({ en: `End of the index: ${results.length} documents matched in ${pagesRead} page reads; a COLLSCAN would test all ${n}.`, pt: `Fim do índice: ${results.length} documentos casaram em ${pagesRead} leituras de página; um COLLSCAN testaria todos os ${n}.` });
  }
  return { steps, meta, docs, queryStart };
}
