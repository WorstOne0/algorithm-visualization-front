import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

// Static export: the image is rendered once at build time.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Algorithm Visualizer · Watch algorithms work, one step at a time";

// The link card LinkedIn and friends show; rendered once at build time into the static export.
export default async function OpengraphImage() {
  // Read from disk rather than fetching a URL: this runs at build time, when the site is not yet serving.
  const logo = await fs.readFile(path.join(process.cwd(), "public/logo/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          background: "radial-gradient(circle at 82% 50%, #1d3a8a 0%, #0f1424 45%, #0b0e17 100%)",
          color: "#e7eaf3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
          <span style={{ fontSize: 28, color: "#a78bfa" }}>{"// algorithm-visualization.kuuhaku.dev"}</span>
          <span style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>Algorithm Visualizer</span>
          <span style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.3, marginTop: 36 }}>Watch algorithms work, one step at a time</span>
          <span style={{ fontSize: 26, color: "#8c93a8", marginTop: 22, lineHeight: 1.4 }}>56 algorithms · real code in 7 languages · A* on the real streets of Cascavel</span>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={340} height={340} alt="" />
      </div>
    ),
    size
  );
}
