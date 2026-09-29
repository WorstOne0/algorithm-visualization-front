// Next
import { notFound } from "next/navigation";
// Models
import { findSignature, SIGNATURES } from "@/core/models";
// Components
import SignatureView from "./_components/signature_view";

export const dynamicParams = false;

export function generateStaticParams() {
  return SIGNATURES.map((signature) => ({ slug: signature.slug }));
}

export default async function SignaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const signature = findSignature(slug);

  if (!signature) notFound();

  return <SignatureView signatureId={signature.id} />;
}
