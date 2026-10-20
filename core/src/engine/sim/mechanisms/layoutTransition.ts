import type { GroupAction } from "@/engine/program";
import { passProgress } from "@/engine/plan/passProgress";
import type { Mechanism, SimContext } from "@/engine/sim/context";
import { lerp } from "@/geom/vec";
import type { Pt } from "@/geom/vec";
import { easings } from "@/timer/easing/easing";

export class LayoutTransitionMechanism implements Mechanism {
  readonly actionIndex: number;
  readonly targetId: string;
  readonly kind = "animate" as const;
  readonly end: number;
  readonly keys = new Set<string>();
  active = false;
  private readonly action: GroupAction;
  private readonly from: ReadonlyMap<string, Pt>;
  private readonly to: ReadonlyMap<string, Pt>;

  constructor(action: GroupAction, from: ReadonlyMap<string, Pt>, to: ReadonlyMap<string, Pt>) {
    this.action = action;
    this.actionIndex = action.index;
    this.targetId = action.target;
    this.end = action.end;
    this.from = from;
    this.to = to;
  }

  activate(ctx: SimContext, _now: number): void {
    this.keys.clear();
    ctx.ownership.claim(this.targetId, ["@layout"], this);
    this.active = true;
  }

  evaluate(ctx: SimContext, now: number): void {
    if (!this.active) return;
    const ease = easings[this.action.ease as keyof typeof easings];
    const progress = passProgress(now - this.action.start, {
      duration: this.action.duration,
      repeat: 1,
      mode: "restart",
      ease,
    }).p;
    for (const [id, target] of this.to) {
      const from = this.from.get(id);
      if (!from) throw new Error(`Presk internal: missing initial layout position for '${id}'`);
      const child = ctx.world.require(id);
      child.setState("x", lerp(from.x, target.x, progress));
      child.setState("y", lerp(from.y, target.y, progress));
    }
  }

  finalize(ctx: SimContext): void {
    if (!this.active) return;
    for (const [id, position] of this.to) {
      const child = ctx.world.require(id);
      child.setState("x", position.x);
      child.setState("y", position.y);
    }
  }
}
