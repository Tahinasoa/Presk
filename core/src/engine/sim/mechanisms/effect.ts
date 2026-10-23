import type { AnimateAction, CompiledEffect } from "@/engine/program";
import { passProgress } from "@/engine/plan/passProgress";
import type { Mechanism, SimContext } from "@/engine/sim/context";
import { easings } from "@/lang/easing/easing";

export class EffectMechanism implements Mechanism {
  readonly actionIndex: number;
  readonly targetId: string;
  readonly kind = "effect" as const;
  readonly end: number;
  readonly keys = new Set<string>();
  active = false;
  private readonly action: AnimateAction;
  private readonly effects: CompiledEffect[];

  constructor(action: AnimateAction) {
    this.action = action;
    this.actionIndex = action.index;
    this.targetId = action.target;
    this.end = action.end;
    this.effects = action.entries.filter((entry): entry is CompiledEffect => entry.kind === "effect");
  }

  activate(ctx: SimContext, _now: number): void {
    this.keys.clear();
    for (const entry of this.effects) this.keys.add(`@${entry.name}`);
    ctx.ownership.claim(this.targetId, [...this.keys], this);
    this.active = true;
  }

  evaluate(ctx: SimContext, now: number): void {
    if (!this.active) return;
    const object = ctx.world.require(this.targetId);
    const p = this.progress(now - this.action.start);
    for (const entry of this.effects) {
      if (!this.keys.has(`@${entry.name}`)) continue;
      entry.def.apply(object, entry.variant, entry.on ? p : 1 - p);
    }
  }

  finalize(ctx: SimContext): void {
    if (!this.active || this.action.repeat === "infinite") return;
    const object = ctx.world.require(this.targetId);
    const p = this.progress(Infinity);
    for (const entry of this.effects) {
      if (!this.keys.has(`@${entry.name}`)) continue;
      entry.def.apply(object, entry.variant, entry.on ? p : 1 - p);
    }
  }

  private progress(elapsed: number): number {
    const ease = easings[this.action.ease as keyof typeof easings];
    return passProgress(elapsed, {
      duration: this.action.duration,
      repeat: this.action.repeat,
      mode: this.action.repeatMode,
      ease,
    }).p;
  }
}
