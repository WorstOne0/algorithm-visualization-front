// Next
import type { Metadata } from "next";
import { notFound } from "next/navigation";
// Models
import { ALGORITHMS, FAMILIES, findSignature, signaturePath, SIGNATURES } from "@/core/models";
// Components
import SignatureView from "./_components/signature_view";
// Utils
import { breadcrumbJsonLd, jsonLdText, learningResourceJsonLd } from "@/utils/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SIGNATURES.map((signature) => ({ slug: signature.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const signature = findSignature(slug);
  if (!signature) return {};
  const path = signaturePath(signature);
  const description = `${signature.desc.en} An interactive ${ALGORITHMS[signature.algorithm].name} visualization on real data.`;
  return { title: signature.name.en, description, alternates: { canonical: path }, openGraph: { title: `${signature.name.en} · Algorithm Visualizer`, description, url: path } };
}

export default async function SignaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const signature = findSignature(slug);

  if (!signature) notFound();

  const path = signaturePath(signature);
  const algorithm = ALGORITHMS[signature.algorithm];
  const familyName = FAMILIES.find((candidate) => candidate.id === signature.family)!.name.en;
  const jsonLd = [
    learningResourceJsonLd(signature.name.en, signature.desc.en, path, [algorithm.name, `${familyName} algorithms`, "algorithm visualization"]),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Signatures", path: "/#signatures" },
      { name: signature.name.en, path },
    ]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(jsonLd) }} />
      <SignatureView signatureId={signature.id} />
    </>
  );
}
