// Next
import type { MetadataRoute } from "next";
// Models
import { ALGORITHM_LIST, algorithmPath, FAMILY_IDS, SIGNATURES, signaturePath, SITE_URL } from "@/core/models";

// Static export: one sitemap.xml written at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    ...FAMILY_IDS.map((family) => ({ url: `${SITE_URL}/${family}`, lastModified, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...SIGNATURES.map((signature) => ({ url: `${SITE_URL}${signaturePath(signature)}`, lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...ALGORITHM_LIST.map((algorithm) => ({ url: `${SITE_URL}${algorithmPath(algorithm)}`, lastModified, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
