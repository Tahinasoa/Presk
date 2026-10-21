import { transformBounds } from "@/geom/bounds";
import type { Pt } from "@/geom/vec";
import { GroupObject } from "@/model/classes/groupObject";

export function computeLayout(group: GroupObject): Map<string, Pt> {
  const positions = new Map<string, Pt>();
  const layout = group.getString("layout");
  if (layout === "none") return positions;
  if (layout !== "vertical" && layout !== "horizontal") {
    throw new Error(`Presk internal: unknown group layout '${layout}'`);
  }

  const margin = group.getNumber("margin");
  const gap = group.getNumber("gap");
  let cursor = margin;
  for (const child of group.children()) {
    const localBounds = child.localBounds();
    if (localBounds === null) continue;
    const bounds = transformBounds(localBounds, child.localMatrix());

    if (layout === "vertical") {
      positions.set(child.id, {
        x: child.getNumber("x") + margin - bounds.minX,
        y: child.getNumber("y") + cursor - bounds.minY,
      });
      cursor += bounds.maxY - bounds.minY + gap;
    } else {
      positions.set(child.id, {
        x: child.getNumber("x") + cursor - bounds.minX,
        y: child.getNumber("y") + margin - bounds.minY,
      });
      cursor += bounds.maxX - bounds.minX + gap;
    }
  }
  return positions;
}
