import type { GroupAction, UngroupAction } from "@/engine/program";
import type { Catalog } from "@/model/catalog";
import { GroupObject } from "@/model/classes/groupObject";
import type { SceneObject } from "@/model/sceneObject";
import { computeLayout } from "@/engine/sim/layout";
import type { SimContext } from "@/engine/sim/context";
import { detachPreserving, reparentPreserving } from "@/engine/sim/reparent";
import { LayoutTransitionMechanism } from "@/engine/sim/mechanisms/layoutTransition";
import type { Pt } from "@/geom/vec";

export function activateGroup(
  ctx: SimContext,
  action: GroupAction,
  catalog: Catalog,
): LayoutTransitionMechanism | null {
  const object = ctx.world.require(action.target);
  if (!(object instanceof GroupObject) || catalog.get(object.def.type)?.type !== "group") {
    throw new Error(`Presk internal: '${action.target}' is not a group`);
  }
  const group = object;

  for (const entry of action.props) {
    if (entry.kind === "prop") {
      ctx.ownership.claim(action.target, entry.spec.writes, null);
      entry.spec.set!(group, entry.value(ctx.world));
    } else {
      ctx.ownership.claim(action.target, [`@${entry.name}`], null);
      entry.def.apply(group, entry.variant, entry.on ? 1 : 0);
    }
  }

  for (const childId of action.children) {
    reparentPreserving(ctx.world.require(childId), group);
  }

  const from = new Map<string, Pt>();
  for (const child of group.children()) {
    if (child.localBounds() !== null) {
      from.set(child.id, { x: child.getNumber("x"), y: child.getNumber("y") });
    }
  }
  const to = computeLayout(group);

  if (action.duration === 0 || group.getString("layout") === "none") {
    ctx.ownership.claim(action.target, ["@layout"], null);
    writePositions(ctx, to);
    return null;
  }
  return new LayoutTransitionMechanism(action, from, to);
}

export function activateUngroup(ctx: SimContext, action: UngroupAction): void {
  const object = ctx.world.require(action.target);
  if (!(object instanceof GroupObject)) {
    throw new Error(`Presk internal: '${action.target}' is not a group`);
  }
  const children = action.children ?? object.children().map(({ id }) => id);
  for (const childId of children) {
    detachPreserving(ctx.world.require(childId));
  }
}

function writePositions(ctx: SimContext, positions: ReadonlyMap<string, Pt>): void {
  for (const [id, position] of positions) {
    const object: SceneObject = ctx.world.require(id);
    object.setState("x", position.x);
    object.setState("y", position.y);
  }
}
