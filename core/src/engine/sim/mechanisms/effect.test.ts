import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import type { AnimateAction } from "@/engine/program";
import { buildWorld } from "@/engine/sim/buildWorld";
import type { Mechanism, SimContext } from "@/engine/sim/context";
import { Ownership } from "@/engine/sim/context";
import { EffectMechanism } from "@/engine/sim/mechanisms/effect";
import { RectangleObject, RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import type { Catalog } from "@/model/catalog";
import type { ClassDef } from "@/model/values";
import { revealWithDraw } from "@/model/effects";
import { createTestEnv } from "@/model/ports";

const objectEnv = createTestEnv();
const scene = { width: 800, height: 600 };

const DRAWABLE_DEF: ClassDef = {
  ...RECTANGLE_DEF,
  type: "drawable",
  effects: { reveal: revealWithDraw() },
  create: (id, env) => new RectangleObject(id, DRAWABLE_DEF, env, { drawProgress: 1 }),
};

function prepare(steps: unknown[], drawable = false): { context: SimContext; actions: AnimateAction[] } {
  const catalog: Catalog = createDefaultCatalog();
  if (drawable) catalog.register(DRAWABLE_DEF);
  const program = compileProgram({ version: "1.0", scene, steps }, { catalog, objectEnv });
  const world = buildWorld(program, { catalog, objectEnv });
  return {
    context: { world, ownership: new Ownership(), mechanisms: [] },
    actions: program.actions.filter((action): action is AnimateAction => action.action === "animate"),
  };
}

class ClaimMechanism implements Mechanism {
  readonly actionIndex = 100;
  readonly kind = "effect" as const;
  readonly end = Infinity;
  readonly keys = new Set<string>();
  active = true;
  readonly targetId: string;

  constructor(targetId: string) {
    this.targetId = targetId;
  }

  activate(_ctx: SimContext, _now: number): void {}
  evaluate(_ctx: SimContext, _now: number): void {}
  finalize(_ctx: SimContext): void {}
}

describe("EffectMechanism", () => {
  it("activates and animates an on effect, then finalizes it", () => {
    const { context, actions } = prepare([
      { action: "create", target: "a", type: "rectangle" },
      { action: "animate", target: "a", start: "1", duration: 1, ease: "linear", properties: { reveal: true } },
    ]);
    const mechanism = new EffectMechanism(actions[0]!);
    const object = context.world.require("a");

    mechanism.activate(context, 1);
    mechanism.evaluate(context, 1);
    expect(object.getState("presence")).toBe(0);
    mechanism.evaluate(context, 1.5);
    expect(object.getState("presence")).toBe(0.5);
    mechanism.finalize(context);
    expect(object.getState("presence")).toBe(1);
  });

  it("animates an off effect as the inverse and finalizes it to zero", () => {
    const { context, actions } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { reveal: true } },
      { action: "animate", target: "a", start: "1", duration: 1, ease: "linear", properties: { reveal: false } },
    ]);
    const mechanism = new EffectMechanism(actions[0]!);
    const object = context.world.require("a");

    mechanism.activate(context, 1);
    mechanism.evaluate(context, 1.5);
    expect(object.getState("presence")).toBe(0.5);
    mechanism.finalize(context);
    expect(object.getState("presence")).toBe(0);
  });

  it("animates the off direction of the draw variant without hiding the object mid-draw", () => {
    const { context, actions } = prepare([
      { action: "create", target: "a", type: "drawable", properties: { reveal: "draw" } },
      { action: "animate", target: "a", start: "1", duration: 1, ease: "linear", properties: { reveal: false } },
    ], true);
    const mechanism = new EffectMechanism(actions[0]!);
    const object = context.world.require("a");

    mechanism.activate(context, 1);
    mechanism.evaluate(context, 1.5);
    expect(object.getState("drawProgress")).toBe(0.5);
    expect(object.getState("presence")).toBe(1);
  });

  it("stops writing after another mechanism takes the effect key", () => {
    const { context, actions } = prepare([
      { action: "create", target: "a", type: "rectangle" },
      { action: "animate", target: "a", start: "1", duration: 1, ease: "linear", properties: { reveal: true } },
    ]);
    const mechanism = new EffectMechanism(actions[0]!);
    const object = context.world.require("a");

    mechanism.activate(context, 1);
    mechanism.evaluate(context, 1.5);
    const takeover = new ClaimMechanism("a");
    context.ownership.claim("a", ["@reveal"], takeover);
    mechanism.evaluate(context, 2);

    expect(object.getState("presence")).toBe(0.5);
    expect(mechanism.active).toBe(false);
  });
});
