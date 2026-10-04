// Next
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// Models
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/core/models";
// Components
import Providers from "./providers";
import Sidebar from "./_components/sidebar";
import TopBar from "./_components/top_bar";
// Utils
import { jsonLdText, websiteJsonLd } from "@/utils/seo";
// Styles
import "@/styles/index.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Server component on purpose: "use client" here would silently drop metadata.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s · Algorithm Visualizer" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["algorithm visualization", "algorithm visualizer", "sorting algorithms visualized", "pathfinding visualization", "A* algorithm", "Dijkstra", "graph algorithms", "data structures", "step by step", "visualização de algoritmos"],
  authors: [{ name: SITE_AUTHOR.name, url: SITE_AUTHOR.url }],
  creator: SITE_AUTHOR.name,
  alternates: { canonical: "/" },
  icons: { icon: "/logo/logo.png", apple: "/logo/logo.png" },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "pt_BR",
    siteName: SITE_NAME,
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

// Applies the persisted theme before first paint; the key mirrors core/controllers/theme_controller.ts.
const THEME_SCRIPT = `try{if(JSON.parse(localStorage.getItem("av_theme")).state.theme==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-w-[1236px] font-sans">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(websiteJsonLd()) }} />
        <Providers>
          <div className="grid min-h-screen grid-cols-[5.6rem_minmax(0,1fr)]">
            <Sidebar />
            <main className="relative flex min-w-0 flex-col">
              <TopBar />
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
