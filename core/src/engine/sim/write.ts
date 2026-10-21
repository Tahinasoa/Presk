import type { PropSpec, StateValue } from "@/model/values";
import type { SceneObject } from "@/model/sceneObject";

export function writeSpecValue(
  object: SceneObject,
  spec: PropSpec,
  value: StateValue,
  ownedKeys: ReadonlySet<string>,
): void {
  const owned = spec.writes.filter((key) => ownedKeys.has(key));
  if (owned.length === 0) return;
  if (owned.length === spec.writes.length) {
    spec.set!(object, value);
    return;
  }

  const lost = spec.writes.filter((key) => !ownedKeys.has(key));
  const previous = new Map(lost.map((key) => [key, object.getState(key)]));
  spec.set!(object, value);
  for (const [key, oldValue] of previous) object.setState(key, oldValue);
}
