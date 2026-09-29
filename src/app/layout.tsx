// Next
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// Components
import Providers from "./providers";
import Sidebar from "./_components/sidebar";
import TopBar from "./_components/top_bar";
// Styles
import "@/styles/index.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const DESCRIPTION = "56 college algorithms played step by step: sorting, searching, pathfinding on the real streets of Cascavel, graphs, trees and game AI, with the real code in seven languages and the current line lit.";

// Server component on purpose: "use client" here would silently drop metadata.
export const metadata: Metadata = {
  metadataBase: new URL("https://algorithm-visualization.kuuhaku.dev"),
  title: { default: "Algorithm Visualizer", template: "%s · Algorithm Visualizer" },
  description: DESCRIPTION,
  applicationName: "Algorithm Visualizer",
  icons: { icon: "/logo/logo.png", apple: "/logo/logo.png" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Algorithm Visualizer",
    title: "Algorithm Visualizer · Watch algorithms work, one step at a time",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

// Applies the persisted theme before first paint; the key mirrors core/controllers/theme_controller.ts.
const THEME_SCRIPT = `try{if(JSON.parse(localStorage.getItem("av_theme")).state.theme==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-w-[1236px] font-sans">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
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
