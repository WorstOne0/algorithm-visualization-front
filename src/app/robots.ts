// Next
import type { MetadataRoute } from "next";
// Models
import { SITE_URL } from "@/core/models";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
