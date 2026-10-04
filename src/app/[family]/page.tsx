// Next
import type { Metadata } from "next";
import { notFound } from "next/navigation";
// Models
import { ALGORITHMS_BY_FAMILY, FAMILY_IDS, findFamily, type FamilyId } from "@/core/models";
// Components
import CategoryView from "./_components/category_view";
// Utils
import { breadcrumbJsonLd, jsonLdText } from "@/utils/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return FAMILY_IDS.map((family) => ({ family }));
}

const describe = (id: FamilyId) => {
  const family = findFamily(id)!;
  const names = ALGORITHMS_BY_FAMILY[id].map((row) => row.name);
  return `${family.desc.en} ${family.count} algorithms visualized step by step: ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}.`;
};

export async function generateMetadata({ params }: { params: Promise<{ family: string }> }): Promise<Metadata> {
  const { family } = await params;
  const found = findFamily(family);
  if (!found) return {};
  const title = `${found.name.en} algorithms visualized`;
  const description = describe(found.id);
  return { title, description, alternates: { canonical: `/${found.id}` }, openGraph: { title: `${title} · Algorithm Visualizer`, description, url: `/${found.id}` } };
}

export default async function CategoryPage({ params }: { params: Promise<{ family: string }> }) {
  const { family } = await params;
  const found = findFamily(family);

  if (!found) notFound();

  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: found.name.en, path: `/${found.id}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(jsonLd) }} />
      <CategoryView familyId={found.id} />
    </>
  );
}
