import type { BindAction } from "@/engine/program";
import type { Mechanism, SimContext } from "@/engine/sim/context";
import { writeSpecValue } from "@/engine/sim/write";

export class BindMechanism implements Mechanism {
  readonly actionIndex: number;
  readonly targetId: string;
  readonly kind = "bind" as const;
  readonly end = Infinity;
  readonly keys = new Set<string>();
  active = false;
  private readonly action: BindAction;

  constructor(action: BindAction) {
    this.action = action;
    this.actionIndex = action.index;
    this.targetId = action.target;
  }

  activate(ctx: SimContext, _now: number): void {
    this.keys.clear();
    for (const entry of this.action.entries) {
      for (const key of entry.spec.writes) this.keys.add(key);
    }
    ctx.ownership.claim(this.targetId, [...this.keys], this);
    this.active = true;
  }

  evaluate(ctx: SimContext, _now: number): void {
    if (!this.active) return;
    const object = ctx.world.require(this.targetId);
    for (const entry of this.action.entries) {
      writeSpecValue(object, entry.spec, entry.value(ctx.world), this.keys);
    }
  }

  finalize(_ctx: SimContext): void {}
}
