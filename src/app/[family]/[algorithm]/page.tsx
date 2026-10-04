// Next
import type { Metadata } from "next";
import { notFound } from "next/navigation";
// Models
import { ALGORITHM_LIST, algorithmPath, FAMILIES, findAlgorithm } from "@/core/models";
// Components
import AlgorithmView from "./_components/algorithm_view";
// Utils
import { breadcrumbJsonLd, jsonLdText, learningResourceJsonLd } from "@/utils/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALGORITHM_LIST.map((algorithm) => ({ family: algorithm.family, algorithm: algorithm.slug }));
}

const describe = (algorithm: NonNullable<ReturnType<typeof findAlgorithm>>) => `${algorithm.name} visualized step by step: ${algorithm.subtitle.en.replace(/ · /g, ", ")}. The real code in 7 languages with the current line lit, live counters, complexity, when to use it and its history.`;

export async function generateMetadata({ params }: { params: Promise<{ family: string; algorithm: string }> }): Promise<Metadata> {
  const { family, algorithm } = await params;
  const found = findAlgorithm(family, algorithm);
  if (!found) return {};
  const title = `${found.name} step by step`;
  const description = describe(found);
  const path = algorithmPath(found);
  return { title, description, alternates: { canonical: path }, openGraph: { title: `${title} · Algorithm Visualizer`, description, url: path } };
}

export default async function AlgorithmPage({ params }: { params: Promise<{ family: string; algorithm: string }> }) {
  const { family, algorithm } = await params;
  const found = findAlgorithm(family, algorithm);

  if (!found) notFound();

  const familyName = FAMILIES.find((candidate) => candidate.id === found.family)!.name.en;
  const path = algorithmPath(found);
  const jsonLd = [
    learningResourceJsonLd(`${found.name} step by step`, describe(found), path, [found.name, `${familyName} algorithms`, "algorithm visualization"]),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: familyName, path: `/${found.family}` },
      { name: found.name, path },
    ]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(jsonLd) }} />
      <AlgorithmView algorithmId={found.id} />
    </>
  );
}
