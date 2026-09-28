// Models
import { loadRoadMap, pickRoute, type RoadMap } from "@/core/algorithms/pathfinding/road_map";
import { roadSearch, type RoadAlgo } from "@/core/algorithms/pathfinding/road_search";
// Utils
import { COLORS, fit, monoFont } from "./canvas";
import { drawCaption, drawExplored, drawPin, drawRoute, drawStreets, project } from "./draw_road";

type Stop = () => void;

// The live map on the home and the category page: route after route, the search glowing out, the path drawn back.
export function startRoadShowpiece(canvas: HTMLCanvasElement, algo: RoadAlgo = "astar", perFrame = 12): Stop {
  let alive = true;
  let raf = 0;
  let map: RoadMap | null = null;
  let run: ReturnType<typeof roadSearch> | null = null;
  let order: number[] = [];
  let parent: Int32Array<ArrayBufferLike> = new Int32Array(0);
  let open: number[] = [];
  let path: number[] = [];
  let start = 0;
  let goal = 0;
  let closed = 0;
  let pathShown = 0;
  let phase: "search" | "path" | "hold" | "fade" = "search";
  let phaseAt = 0;

  const begin = (t: number) => {
    if (!map) return;
    [start, goal] = pickRoute(map, 1200 + Math.random() * 1800, Math.random);
    run = roadSearch(map, algo, start, goal);
    order = [];
    parent = new Int32Array(0);
    open = [];
    path = [];
    closed = 0;
    pathShown = 0;
    phase = "search";
    phaseAt = t;
  };

  const advance = (t: number) => {
    if (!run) return;
    for (let k = 0; k < perFrame; k++) {
      const next = run.next();
      if (next.done) {
        phase = "hold";
        phaseAt = t;
        return;
      }
      const state = next.value;
      order = state.order;
      parent = state.parent;
      open = state.open;
      closed = state.order.length;
      if (state.done) {
        path = state.path;
        phase = "path";
        phaseAt = t;
        return;
      }
    }
  };

  const frame = (t: number) => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const { ctx, w, h } = fit(canvas);
    ctx.clearRect(0, 0, w, h);
    if (!map) {
      ctx.fillStyle = COLORS.text;
      ctx.font = monoFont(11);
      ctx.textAlign = "center";
      ctx.fillText("loading map…", w / 2, h / 2);
      return;
    }
    if (!run) begin(t);
    if (phase === "search") advance(t);
    else if (phase === "path") {
      pathShown = Math.min(path.length, 2 + Math.floor((t - phaseAt) / 18));
      if (pathShown >= path.length) {
        phase = "hold";
        phaseAt = t;
      }
    } else if (phase === "hold" && t - phaseAt > 2200) {
      phase = "fade";
      phaseAt = t;
    } else if (phase === "fade" && t - phaseAt > 700) begin(t);

    const fade = phase === "fade" ? Math.max(0, 1 - (t - phaseAt) / 700) : 1;
    const p = project(map, w, h);
    drawStreets(ctx, map, w, h);
    ctx.save();
    ctx.globalAlpha = fade;
    drawExplored(ctx, map, p, order, parent, closed, COLORS.primary, 0.5);
    if (phase === "search") {
      ctx.fillStyle = COLORS.primary;
      open.forEach((node) => {
        ctx.beginPath();
        ctx.arc(p.px(node), p.py(node), 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      if (order.length) drawPin(ctx, p.px(order[order.length - 1]), p.py(order[order.length - 1]), COLORS.act, 3.5);
    }
    drawRoute(ctx, p, path.slice(0, pathShown), COLORS.violet);
    drawPin(ctx, p.px(start), p.py(start), COLORS.green);
    drawPin(ctx, p.px(goal), p.py(goal), COLORS.green);
    ctx.restore();
    drawCaption(ctx, w, h, map, p.scale);
  };

  loadRoadMap().then((loaded) => {
    map = loaded;
  });
  raf = requestAnimationFrame(frame);
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
  };
}
