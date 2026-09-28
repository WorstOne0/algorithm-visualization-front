export const LANGS = [
  { id: "ts", label: "TypeScript", ext: "ts" },
  { id: "py", label: "Python", ext: "py" },
  { id: "java", label: "Java", ext: "java" },
  { id: "cpp", label: "C++", ext: "cpp" },
  { id: "c", label: "C", ext: "c" },
  { id: "go", label: "Go", ext: "go" },
  { id: "rs", label: "Rust", ext: "rs" },
] as const;

export type CodeLang = (typeof LANGS)[number]["id"];
