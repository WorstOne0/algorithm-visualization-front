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

export const metadata: Metadata = {
  title: "Algorithm Visualizer",
  description: "Watch algorithms work, one step at a time.",
  icons: { icon: "/logo/logo.svg" },
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
