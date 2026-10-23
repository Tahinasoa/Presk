import { applyLinear, composeMat, IDENTITY, invertMat, matRotationDeg, matScale, trsPivot } from "@/geom/matrix";
import type { Pt } from "@/geom/vec";
import { GroupObject } from "@/model/classes/groupObject";
import type { SceneObject } from "@/model/sceneObject";

export function reparentPreserving(child: SceneObject, newParent: GroupObject | null): void {
  const world = child.worldMatrix();
  if (child.parent instanceof GroupObject) child.parent.removeChild(child);
  else child.parent = null;

  const parentMatrix = newParent ? newParent.worldMatrix() : IDENTITY;
  const local = composeMat(invertMat(parentMatrix), world);
  const rotation = matRotationDeg(local);
  const scale = matScale(local);
  const pivot = child.pivotLocal();
  const pivotAfterTransform = applyLinear(
    trsPivot({ x: 0, y: 0 }, { x: 0, y: 0 }, rotation, scale),
    pivot,
  );
  const position: Pt = {
    x: local.e - pivot.x + pivotAfterTransform.x,
    y: local.f - pivot.y + pivotAfterTransform.y,
  };

  child.setState("x", position.x);
  child.setState("y", position.y);
  child.setState("rotation", rotation);
  child.setState("scale", scale);
  if (newParent) newParent.addChild(child);
  else child.parent = null;
}

export function detachPreserving(child: SceneObject): void {
  reparentPreserving(child, null);
}
