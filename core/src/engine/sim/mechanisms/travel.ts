import type { TravelAction } from "@/engine/program";
import { passProgress } from "@/engine/plan/passProgress";
import type { Mechanism, SimContext } from "@/engine/sim/context";
import { writeSpecValue } from "@/engine/sim/write";
import { applyMat, invertMat, matRotationDeg } from "@/geom/matrix";
import { easings } from "@/timer/easing/easing";

export class TravelMechanism implements Mechanism {
  readonly actionIndex: number;
  readonly targetId: string;
  readonly kind = "travel" as const;
  readonly end: number;
  readonly keys = new Set<string>();
  active = false;
  private readonly action: TravelAction;

  constructor(action: TravelAction) {
    this.action = action;
    this.actionIndex = action.index;
    this.targetId = action.target;
    this.end = action.end;
  }

  activate(ctx: SimContext, _now: number): void {
    this.keys.clear();
    this.keys.add("x");
    this.keys.add("y");
    if (this.action.orient !== null) this.keys.add("rotation");
    ctx.ownership.claim(this.targetId, [...this.keys], this);
    this.active = true;
  }

  evaluate(ctx: SimContext, now: number): void {
    if (!this.active) return;
    this.writeAt(ctx, this.progress(now - this.action.start));
  }

  finalize(ctx: SimContext): void {
    if (!this.active || this.action.repeat === "infinite") return;
    this.writeAt(ctx, this.progress(Infinity));
  }

  private writeAt(ctx: SimContext, progress: number): void {
    const pathObject = ctx.world.require(this.action.along.object);
    const pathSpec = pathObject.def.paths[this.action.along.path];
    if (!pathSpec) {
      throw new Error(`Presk internal: unknown path '${this.action.along.path}' on '${this.action.along.object}'`);
    }
    const flat = pathSpec.build(pathObject);
    const worldMatrix = pathObject.worldMatrix();
    const t = this.action.fromT + (this.action.toT - this.action.fromT) * progress;
    const worldPoint = applyMat(worldMatrix, flat.pointAt(t));
    const target = ctx.world.require(this.targetId);

    if (this.action.orient !== null && this.keys.has("rotation")) {
      const angle = flat.angleAt(t) + matRotationDeg(worldMatrix) + this.action.orient.offset;
      const rotation = angle - matRotationDeg(target.parentMatrix());
      const rotationSpec = target.def.props.rotation;
      if (!rotationSpec?.set) throw new Error(`Presk internal: '${target.def.type}' has no writable rotation`);
      writeSpecValue(target, rotationSpec, rotation, this.keys);
    }

    if (this.action.anchor === "pos") {
      const posSpec = target.def.props.pos;
      if (!posSpec?.set) throw new Error(`Presk internal: '${target.def.type}' has no writable pos`);
      const parentPoint = applyMat(invertMat(target.parentMatrix()), worldPoint);
      writeSpecValue(target, posSpec, parentPoint, this.keys);
      return;
    }

    const anchorSpec = target.def.props[this.action.anchor];
    if (!anchorSpec?.set) {
      throw new Error(`Presk internal: '${target.def.type}' has no writable anchor '${this.action.anchor}'`);
    }
    writeSpecValue(target, anchorSpec, worldPoint, this.keys);
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
