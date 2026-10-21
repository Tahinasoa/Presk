import type { AnimateAction, CompiledProp } from "@/engine/program";
import { interpolate } from "@/engine/sim/interpolate";
import type { Mechanism, SimContext } from "@/engine/sim/context";
import { writeSpecValue } from "@/engine/sim/write";
import { passProgress } from "@/engine/plan/passProgress";
import { easings } from "@/lang/easing/easing";
import type { StateValue } from "@/model/values";

interface CapturedValue {
  entry: CompiledProp;
  from: StateValue;
  to: StateValue;
}

export class AnimateMechanism implements Mechanism {
  readonly actionIndex: number;
  readonly targetId: string;
  readonly kind = "animate" as const;
  readonly end: number;
  readonly keys = new Set<string>();
  active = false;
  private readonly action: AnimateAction;
  private readonly captured: CapturedValue[] = [];

  constructor(action: AnimateAction) {
    this.action = action;
    this.actionIndex = action.index;
    this.targetId = action.target;
    this.end = action.end;
  }

  activate(ctx: SimContext, _now: number): void {
    const object = ctx.world.require(this.targetId);
    this.captured.length = 0;
    this.keys.clear();
    for (const entry of this.action.entries) {
      if (entry.kind !== "prop") continue;
      this.captured.push({ entry, from: entry.spec.get(object), to: entry.value(ctx.world) });
      for (const key of entry.spec.writes) this.keys.add(key);
    }
    ctx.ownership.claim(this.targetId, [...this.keys], this);
    this.active = true;
  }

  evaluate(ctx: SimContext, now: number): void {
    if (!this.active) return;
    const object = ctx.world.require(this.targetId);
    const p = this.progress(now - this.action.start);
    for (const { entry, from, to } of this.captured) {
      writeSpecValue(object, entry.spec, interpolate(entry.spec.kind, from, to, p), this.keys);
    }
  }

  finalize(ctx: SimContext): void {
    if (!this.active || this.action.repeat === "infinite") return;
    const object = ctx.world.require(this.targetId);
    const p = this.progress(Infinity);
    for (const { entry, from, to } of this.captured) {
      writeSpecValue(object, entry.spec, interpolate(entry.spec.kind, from, to, p), this.keys);
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
