import type { Program, PlannedAction } from "@/engine/program";
import { AnimateMechanism } from "@/engine/sim/mechanisms/animate";
import { BindMechanism } from "@/engine/sim/mechanisms/bind";
import { EffectMechanism } from "@/engine/sim/mechanisms/effect";
import { TravelMechanism } from "@/engine/sim/mechanisms/travel";
import { activateSet, activateStop, activateUnbind } from "@/engine/sim/instant";
import { buildWorld } from "@/engine/sim/buildWorld";
import { Ownership } from "@/engine/sim/context";
import type { Mechanism, SimContext } from "@/engine/sim/context";
import { tickTimes } from "@/engine/sim/ticks";
import type { Catalog } from "@/model/catalog";
import type { ObjectEnv } from "@/model/ports";
import type { World } from "@/model/world";

const EPSILON = 1e-9;

export interface SimEnv {
  catalog: Catalog;
  objectEnv: ObjectEnv;
  fps?: number;
}

export class Simulation {
  readonly world: World;
  readonly duration: number;
  private readonly program: Program;
  private readonly catalog: Catalog;
  private readonly fps: number;
  private readonly ownership = new Ownership();
  private readonly mechanisms: Mechanism[] = [];
  private readonly started: boolean[];
  private readonly mechByAction = new Map<number, Mechanism[]>();
  private readonly context: SimContext;
  private currentTime = -1;

  constructor(program: Program, env: SimEnv) {
    this.program = program;
    this.catalog = env.catalog;
    this.fps = env.fps ?? 60;
    this.world = buildWorld(program, env);
    this.duration = program.duration;
    this.started = Array.from({ length: program.actions.length }, () => false);
    this.context = { world: this.world, ownership: this.ownership, mechanisms: this.mechanisms };
  }

  get time(): number {
    return this.currentTime;
  }

  reset(): void {
    this.world.reset();
    this.mechanisms.length = 0;
    this.mechByAction.clear();
    this.started.fill(false);
    this.ownership.clear();
    this.currentTime = -1;
  }

  seek(t: number): void {
    const target = Math.max(0, Math.min(t, this.duration));
    if (target < this.currentTime - EPSILON) this.reset();

    const ticks = tickTimes(this.program, this.fps, this.currentTime, target);
    if ((ticks.at(-1) ?? this.currentTime) < target - EPSILON) ticks.push(target);
    for (const tick of ticks) this.runTick(tick);
    this.currentTime = ticks.at(-1) ?? this.currentTime;
  }

  private runTick(now: number): void {
    for (const mechanism of this.mechanisms) {
      if (mechanism.active && mechanism.end <= now + EPSILON) {
        mechanism.finalize(this.context);
        mechanism.active = false;
        this.ownership.release(mechanism);
      }
    }

    for (const action of this.program.actions) {
      if (!this.started[action.index] && action.start <= now + EPSILON) {
        this.activate(action, now);
        this.started[action.index] = true;
      }
      for (const mechanism of this.mechByAction.get(action.index) ?? []) {
        if (mechanism.active) mechanism.evaluate(this.context, now);
      }
    }

    if (now >= this.duration - EPSILON) {
      for (const mechanism of this.mechanisms) {
        if (mechanism.active) mechanism.active = false;
      }
    }
  }

  private activate(action: PlannedAction, now: number): void {
    switch (action.action) {
      case "set":
        activateSet(this.context, action, this.catalog);
        return;
      case "stop":
        activateStop(this.context, action, this.catalog);
        return;
      case "unbind":
        activateUnbind(this.context, action, this.catalog);
        return;
      case "animate": {
        const hasProps = action.entries.some((entry) => entry.kind === "prop");
        const hasEffects = action.entries.some((entry) => entry.kind === "effect");
        if (hasProps) this.addMechanism(new AnimateMechanism(action), now);
        if (hasEffects) this.addMechanism(new EffectMechanism(action), now);
        return;
      }
      case "bind":
        this.addMechanism(new BindMechanism(action), now);
        return;
      case "travel":
        this.addMechanism(new TravelMechanism(action), now);
        return;
      case "group":
      case "ungroup":
        throw new Error(`Presk internal: action '${action.action}' not implemented`);
    }
  }

  private addMechanism(mechanism: Mechanism, now: number): void {
    mechanism.activate(this.context, now);
    this.mechanisms.push(mechanism);
    const actionMechanisms = this.mechByAction.get(mechanism.actionIndex) ?? [];
    actionMechanisms.push(mechanism);
    this.mechByAction.set(mechanism.actionIndex, actionMechanisms);
  }
}
