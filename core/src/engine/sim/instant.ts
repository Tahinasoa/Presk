import { keysOfNames } from "@/engine/analyze/activity";
import type { SetAction, StopAction, UnbindAction } from "@/engine/program";
import type { Mechanism, SimContext } from "@/engine/sim/context";
import type { Catalog } from "@/model/catalog";

const STOPPABLE_KINDS: readonly Mechanism["kind"][] = ["animate", "travel", "effect"];
const UNBINDABLE_KINDS: readonly Mechanism["kind"][] = ["bind"];

export function activateSet(ctx: SimContext, action: SetAction, _catalog: Catalog): void {
  const object = ctx.world.require(action.target);
  for (const entry of action.entries) {
    if (entry.kind === "prop") {
      ctx.ownership.claim(action.target, entry.spec.writes, null);
      entry.spec.set!(object, entry.value(ctx.world));
    } else {
      ctx.ownership.claim(action.target, [`@${entry.name}`], null);
      entry.def.apply(object, entry.variant, entry.on ? 1 : 0);
    }
  }
}

export function activateStop(ctx: SimContext, action: StopAction, catalog: Catalog): void {
  releaseKeys(ctx, action.target, action.keys, catalog, STOPPABLE_KINDS);
}

export function activateUnbind(ctx: SimContext, action: UnbindAction, catalog: Catalog): void {
  releaseKeys(ctx, action.target, action.keys, catalog, UNBINDABLE_KINDS);
}

function releaseKeys(
  ctx: SimContext,
  targetId: string,
  names: readonly string[] | null,
  catalog: Catalog,
  kinds: readonly Mechanism["kind"][],
): void {
  const object = ctx.world.require(targetId);
  const def = catalog.get(object.def.type);
  if (!def) throw new Error(`Presk internal: missing catalog definition '${object.def.type}'`);

  const keys = names === null
    ? [...ctx.ownership.ownersOf(targetId)]
      .filter(([, owner]) => kinds.includes(owner.kind))
      .map(([key]) => key)
    : keysOfNames(def, names);

  for (const key of keys) {
    const owner = ctx.ownership.ownerOf(targetId, key);
    if (owner && kinds.includes(owner.kind)) {
      ctx.ownership.claim(targetId, [key], null);
    }
  }
}
