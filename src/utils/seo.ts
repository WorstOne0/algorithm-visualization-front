// Models
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/core/models";

type Crumb = { name: string; path: string };

// schema.org objects as plain data; the pages print them in a JSON-LD script tag.
export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: ["en", "pt-BR"],
  author: { "@type": "Person", name: SITE_AUTHOR.name, url: SITE_AUTHOR.url },
});

export const breadcrumbJsonLd = (crumbs: Crumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: `${SITE_URL}${crumb.path}` })),
});

export const learningResourceJsonLd = (name: string, description: string, path: string, about: string[]) => ({
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name,
  description,
  url: `${SITE_URL}${path}`,
  learningResourceType: "interactive visualization",
  educationalLevel: "undergraduate",
  inLanguage: ["en", "pt-BR"],
  isAccessibleForFree: true,
  about: about.map((topic) => ({ "@type": "Thing", name: topic })),
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  author: { "@type": "Person", name: SITE_AUTHOR.name, url: SITE_AUTHOR.url },
});

// Serialised for a <script type="application/ld+json">; "<" is escaped so no text can close the tag.
export const jsonLdText = (data: object | object[]) => JSON.stringify(data).replace(/</g, "\\u003c");
