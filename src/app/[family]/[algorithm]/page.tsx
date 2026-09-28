// Next
import { notFound } from "next/navigation";
// Models
import { ALGORITHM_LIST, findAlgorithm } from "@/core/models";
// Components
import AlgorithmView from "./_components/algorithm_view";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALGORITHM_LIST.map((algorithm) => ({ family: algorithm.family, algorithm: algorithm.slug }));
}

export default async function AlgorithmPage({ params }: { params: Promise<{ family: string; algorithm: string }> }) {
  const { family, algorithm } = await params;
  const found = findAlgorithm(family, algorithm);

  if (!found) notFound();

  return <AlgorithmView algorithmId={found.id} />;
}
