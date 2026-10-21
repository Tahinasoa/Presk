import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import type { AnimateAction } from "@/engine/program";
import { AnimateMechanism } from "@/engine/sim/mechanisms/animate";
import { buildWorld } from "@/engine/sim/buildWorld";
import { Ownership } from "@/engine/sim/context";
import type { SimContext } from "@/engine/sim/context";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";

const objectEnv = createTestEnv();
const catalog = createDefaultCatalog();
const scene = { width: 800, height: 600 };

function prepare(steps: unknown[]): { context: SimContext; actions: AnimateAction[] } {
  const program = compileProgram({ version: "1.0", scene, steps }, { catalog, objectEnv });
  const world = buildWorld(program, { catalog, objectEnv });
  const context: SimContext = { world, ownership: new Ownership(), mechanisms: [] };
  return {
    context,
    actions: program.actions.filter((action): action is AnimateAction => action.action === "animate"),
  };
}

describe("AnimateMechanism", () => {
  it("activates and interpolates a property", () => {
    const { context, actions } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
    ]);
    const mechanism = new AnimateMechanism(actions[0]!);
    mechanism.activate(context, 0);
    mechanism.evaluate(context, 1);
    expect(context.world.require("a").readProp("x")).toBe(50);
  });

  it("writes the exact final value", () => {
    const { context, actions } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
    ]);
    const mechanism = new AnimateMechanism(actions[0]!);
    mechanism.activate(context, 0);
    mechanism.evaluate(context, 2);
    mechanism.finalize(context);
    expect(context.world.require("a").readProp("x")).toBe(100);
  });

  it("freezes expression targets at activation", () => {
    const { context, actions } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 100 } },
      { action: "animate", target: "a", properties: { x: "b.x" }, duration: 2, ease: "linear" },
    ]);
    const mechanism = new AnimateMechanism(actions[0]!);
    mechanism.activate(context, 0);
    context.world.require("b").writeProp("x", 200);
    mechanism.evaluate(context, 1);
    expect(context.world.require("a").readProp("x")).toBe(50);
  });

  it("captures source values at activation", () => {
    const { context, actions } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 10 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
    ]);
    const mechanism = new AnimateMechanism(actions[0]!);
    mechanism.activate(context, 0);
    mechanism.evaluate(context, 1);
    expect(context.world.require("a").readProp("x")).toBe(55);
  });

  it("stops writing after another mechanism takes its key", () => {
    const { context, actions } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
      { action: "animate", target: "a", properties: { x: 200 }, duration: 2, ease: "linear", start: "1" },
    ]);
    const first = new AnimateMechanism(actions[0]!);
    const second = new AnimateMechanism(actions[1]!);
    first.activate(context, 0);
    first.evaluate(context, 1);
    second.activate(context, 1);
    expect(first.keys.size).toBe(0);
    expect(first.active).toBe(false);
    first.evaluate(context, 1.5);
    expect(context.world.require("a").readProp("x")).toBe(50);
  });

  it("returns to the source value when an even yoyo repeat finishes", () => {
    const { context, actions } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 10 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear", repeat: 2, repeatMode: "yoyo" },
    ]);
    const mechanism = new AnimateMechanism(actions[0]!);
    mechanism.activate(context, 0);
    mechanism.finalize(context);
    expect(context.world.require("a").readProp("x")).toBe(10);
  });
});
