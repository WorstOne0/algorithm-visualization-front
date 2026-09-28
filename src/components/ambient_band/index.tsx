"use client";

// Models
import type { FamilyId } from "@/core/models";
// Components
import VizCanvas from "../viz_canvas";

// The 640px band behind a page's top: the family's ambient scene, faded into the page on the left and at the bottom.
export default function AmbientBand({ family }: { family: FamilyId }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] overflow-hidden">
      <VizCanvas spec={{ starter: "ambient", family, alpha: 0.7 }} />
      <div className="ambient-fade absolute inset-0" />
    </div>
  );
}
