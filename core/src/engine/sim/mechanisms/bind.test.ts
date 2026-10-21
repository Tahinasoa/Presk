import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import type { BindAction } from "@/engine/program";
import { AnimateMechanism } from "@/engine/sim/mechanisms/animate";
import { BindMechanism } from "@/engine/sim/mechanisms/bind";
import { buildWorld } from "@/engine/sim/buildWorld";
import { Ownership } from "@/engine/sim/context";
import type { Mechanism, SimContext } from "@/engine/sim/context";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";

const objectEnv = createTestEnv();
const catalog = createDefaultCatalog();
const scene = { width: 800, height: 600 };

function prepare(steps: unknown[]): { context: SimContext; binds: BindAction[]; animates: Extract<ReturnType<typeof compileProgram>["actions"][number], { action: "animate" }>[] } {
  const program = compileProgram({ version: "1.0", scene, steps }, { catalog, objectEnv });
  const world = buildWorld(program, { catalog, objectEnv });
  const context: SimContext = { world, ownership: new Ownership(), mechanisms: [] };
  return {
    context,
    binds: program.actions.filter((action): action is BindAction => action.action === "bind"),
    animates: program.actions.filter((action): action is Extract<typeof action, { action: "animate" }> => action.action === "animate"),
  };
}

class ClaimMechanism implements Mechanism {
  readonly actionIndex = 100;
  readonly targetId: string;
  readonly kind = "animate" as const;
  readonly end = Infinity;
  readonly keys = new Set<string>();
  active = true;

  constructor(targetId: string) { this.targetId = targetId; }
  activate(_ctx: SimContext, _now: number): void {}
  evaluate(_ctx: SimContext, _now: number): void {}
  finalize(_ctx: SimContext): void {}
}

describe("BindMechanism", () => {
  it("evaluates a bound expression", () => {
    const { context, binds } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 200 } },
      { action: "bind", target: "a", properties: { x: "b.x - 50" } },
    ]);
    const mechanism = new BindMechanism(binds[0]!);
    mechanism.activate(context, 0);
    mechanism.evaluate(context, 0);
    expect(context.world.require("a").readProp("x")).toBe(150);
  });

  it("reevaluates expressions on each tick", () => {
    const { context, binds } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 200 } },
      { action: "bind", target: "a", properties: { x: "b.x - 50" } },
    ]);
    const mechanism = new BindMechanism(binds[0]!);
    mechanism.activate(context, 0);
    mechanism.evaluate(context, 0);
    context.world.require("b").writeProp("x", 300);
    mechanism.evaluate(context, 1);
    expect(context.world.require("a").readProp("x")).toBe(250);
  });

  it("stops writing after another mechanism takes its key", () => {
    const { context, binds } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 200 } },
      { action: "bind", target: "a", properties: { x: "b.x - 50" } },
    ]);
    const binding = new BindMechanism(binds[0]!);
    binding.activate(context, 0);
    binding.evaluate(context, 0);
    const takeover = new ClaimMechanism("a");
    context.ownership.claim("a", ["x"], takeover);
    context.world.require("b").writeProp("x", 300);
    binding.evaluate(context, 1);
    expect(binding.active).toBe(false);
    expect(context.world.require("a").readProp("x")).toBe(150);
  });

  it("continues updating keys retained after a partial ownership transfer", () => {
    const { context, binds, animates } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0, y: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 200, y: 300 } },
      { action: "bind", target: "a", properties: { pos: "b.topLeft" } },
      { action: "animate", target: "a", properties: { x: 500 }, duration: 2, ease: "linear", start: "1" },
    ]);
    const binding = new BindMechanism(binds[0]!);
    binding.activate(context, 0);
    binding.evaluate(context, 0);
    const animation = new AnimateMechanism(animates[0]!);
    animation.activate(context, 1);
    context.world.require("b").writeProp("y", 400);
    binding.evaluate(context, 1);
    expect(context.world.require("a").readProp("x")).toBe(200);
    expect(context.world.require("a").readProp("y")).toBe(400);
    expect(binding.keys).toEqual(new Set(["y"]));
    expect(binding.active).toBe(true);
  });

  it("allows cyclic bindings to advance in evaluation order", () => {
    const { context, binds } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 0 } },
      { action: "bind", target: "a", properties: { x: "b.x + 1" } },
      { action: "bind", target: "b", properties: { x: "a.x + 1" } },
    ]);
    const first = new BindMechanism(binds[0]!);
    const second = new BindMechanism(binds[1]!);
    first.activate(context, 0);
    second.activate(context, 0);
    first.evaluate(context, 0);
    second.evaluate(context, 0);
    expect(context.world.require("a").readProp("x")).toBe(1);
    expect(context.world.require("b").readProp("x")).toBe(2);
    first.evaluate(context, 1);
    second.evaluate(context, 1);
    expect(context.world.require("a").readProp("x")).toBe(3);
    expect(context.world.require("b").readProp("x")).toBe(4);
  });

  it("does not finalize bindings", () => {
    const { context, binds } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 200 } },
      { action: "bind", target: "a", properties: { x: "b.x - 50" } },
    ]);
    const mechanism = new BindMechanism(binds[0]!);
    mechanism.activate(context, 0);
    mechanism.evaluate(context, 0);
    mechanism.finalize(context);
    expect(context.world.require("a").readProp("x")).toBe(150);
  });
});
