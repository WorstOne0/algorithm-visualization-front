// Next
import { create } from "zustand";
// Models
import { loadRoadMap } from "@/core/algorithms/pathfinding/road_map";

type RoadMapController = {
  status: "idle" | "loading" | "ready" | "error";
  load: () => void;
};

// The street map is fetched once per session; recorders read it through getRoadMap() once status is "ready".
export const useRoadMapController = create<RoadMapController>()((set, get) => ({
  status: "idle",
  load: () => {
    if (get().status !== "idle") return;
    set({ status: "loading" });
    loadRoadMap()
      .then(() => set({ status: "ready" }))
      .catch(() => set({ status: "error" }));
  },
}));
