// Next
import { notFound } from "next/navigation";
// Models
import { FAMILY_IDS, findFamily, type FamilyId } from "@/core/models";
// Components
import CategoryView from "./_components/category_view";

export const dynamicParams = false;

export function generateStaticParams() {
  return FAMILY_IDS.map((family) => ({ family }));
}

export default async function CategoryPage({ params }: { params: Promise<{ family: string }> }) {
  const { family } = await params;

  if (!findFamily(family)) notFound();

  return <CategoryView familyId={family as FamilyId} />;
}
