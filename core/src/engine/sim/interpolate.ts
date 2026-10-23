import { lerpColor, parseColor } from "@/geom/color";
import { lerp, lerpPt } from "@/geom/vec";
import type { PropKind, StateValue, ViewTarget } from "@/model/values";

export function interpolate(kind: PropKind, from: StateValue, to: StateValue, p: number): StateValue {
  switch (kind) {
    case "number":
      return lerp(from as number, to as number, p);
    case "point":
      return lerpPt(from as { x: number; y: number }, to as { x: number; y: number }, p);
    case "color":
      const a = parseColor(from);
      const b = parseColor(to);
      if (a === null || b === null) throw new Error("Presk internal: invalid colour in interpolate");
      return lerpColor(a, b, p);
    case "view": {
      const fromView = from as ViewTarget;
      const toView = to as ViewTarget;
      if (fromView.zoom <= 0 || toView.zoom <= 0) {
        throw new Error("Presk internal: view zoom must be greater than zero");
      }
      return {
        cx: lerp(fromView.cx, toView.cx, p),
        cy: lerp(fromView.cy, toView.cy, p),
        zoom: fromView.zoom * (toView.zoom / fromView.zoom) ** p,
      };
    }
    default:
      throw new Error(`Presk internal: cannot interpolate property kind '${kind}'`);
  }
}
