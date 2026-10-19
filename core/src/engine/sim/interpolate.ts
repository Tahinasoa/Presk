import { lerpColor } from "@/geom/color";
import { lerp, lerpPt } from "@/geom/vec";
import type { PropKind, StateValue } from "@/model/values";

export function interpolate(kind: PropKind, from: StateValue, to: StateValue, p: number): StateValue {
  switch (kind) {
    case "number":
      return lerp(from as number, to as number, p);
    case "point":
      return lerpPt(from as { x: number; y: number }, to as { x: number; y: number }, p);
    case "color":
      return lerpColor(from as number, to as number, p);
    default:
      throw new Error(`Presk internal: cannot interpolate property kind '${kind}'`);
  }
}
