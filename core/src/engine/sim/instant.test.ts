import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import type { AnimateAction, BindAction, SetAction, StopAction, UnbindAction } from "@/engine/program";
import { buildWorld } from "@/engine/sim/buildWorld";
import { Ownership } from "@/engine/sim/context";
import type { SimContext } from "@/engine/sim/context";
import { activateSet, activateStop, activateUnbind } from "@/engine/sim/instant";
import { AnimateMechanism } from "@/engine/sim/mechanisms/animate";
import { BindMechanism } from "@/engine/sim/mechanisms/bind";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";

const objectEnv = createTestEnv();
const catalog = createDefaultCatalog();
const scene = { width: 800, height: 600 };

function prepare(steps: unknown[]): {
  context: SimContext;
  sets: SetAction[];
  stops: StopAction[];
  unbinds: UnbindAction[];
  animates: AnimateAction[];
  binds: BindAction[];
} {
  const program = compileProgram({ version: "1.0", scene, steps }, { catalog, objectEnv });
  const world = buildWorld(program, { catalog, objectEnv });
  return {
    context: { world, ownership: new Ownership(), mechanisms: [] },
    sets: program.actions.filter((action): action is SetAction => action.action === "set"),
    stops: program.actions.filter((action): action is StopAction => action.action === "stop"),
    unbinds: program.actions.filter((action): action is UnbindAction => action.action === "unbind"),
    animates: program.actions.filter((action): action is AnimateAction => action.action === "animate"),
    binds: program.actions.filter((action): action is BindAction => action.action === "bind"),
  };
}

describe("instant simulation actions", () => {
  it("sets a property and releases its previous owner", () => {
    const { context, sets, animates } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
      { action: "set", target: "a", properties: { x: 5 } },
    ]);
    const animation = new AnimateMechanism(animates[0]!);
    animation.activate(context, 0);

    activateSet(context, sets[0]!, catalog);

    expect(context.world.require("a").readProp("x")).toBe(5);
    expect(animation.active).toBe(false);
    expect(animation.keys.size).toBe(0);
  });

  it("sets both position coordinates while releasing only the overlapping key", () => {
    const { context, sets, animates } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0, y: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
      { action: "set", target: "a", properties: { pos: { x: 1, y: 2 } } },
    ]);
    const animation = new AnimateMechanism(animates[0]!);
    animation.activate(context, 0);

    activateSet(context, sets[0]!, catalog);

    expect(context.world.require("a").readProp("x")).toBe(1);
    expect(context.world.require("a").readProp("y")).toBe(2);
    expect(animation.active).toBe(false);
  });

  it("applies set effects to their on and off endpoint", () => {
    const { context, sets } = prepare([
      { action: "create", target: "a", type: "rectangle" },
      { action: "set", target: "a", properties: { reveal: true } },
      { action: "set", target: "a", properties: { reveal: false } },
    ]);
    const object = context.world.require("a");

    activateSet(context, sets[0]!, catalog);
    expect(object.getState("presence")).toBe(1);
    activateSet(context, sets[1]!, catalog);
    expect(object.getState("presence")).toBe(0);
  });

  it("stops selected animation keys without changing their current value", () => {
    const { context, animates, stops } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear", start: "0" },
      { action: "stop", target: "a", properties: ["x"], start: "1" },
    ]);
    const animation = new AnimateMechanism(animates[0]!);
    animation.activate(context, 0);
    animation.evaluate(context, 0.5);
    const value = context.world.require("a").readProp("x");

    activateStop(context, stops[0]!, catalog);

    expect(animation.active).toBe(false);
    expect(context.world.require("a").readProp("x")).toBe(value);
    expect(context.ownership.ownerOf("a", "x")).toBeUndefined();
  });

  it("stops all animate keys but preserves bind ownership", () => {
    const { context, animates, binds, stops } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0, y: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { y: 25 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear", start: "0" },
      { action: "bind", target: "a", properties: { y: "b.y" }, start: "0" },
      { action: "stop", target: "a", start: "1" },
    ]);
    const animation = new AnimateMechanism(animates[0]!);
    const binding = new BindMechanism(binds[0]!);
    animation.activate(context, 0);
    binding.activate(context, 0);

    activateStop(context, stops[0]!, catalog);

    expect(animation.active).toBe(false);
    expect(binding.active).toBe(true);
    expect(context.ownership.ownerOf("a", "y")).toBe(binding);
  });

  it("unbinds selected bind keys", () => {
    const { context, binds, unbinds } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { y: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { y: 25 } },
      { action: "bind", target: "a", properties: { y: "b.y" }, start: "0" },
      { action: "unbind", target: "a", properties: ["y"], start: "1" },
    ]);
    const binding = new BindMechanism(binds[0]!);
    binding.activate(context, 0);

    activateUnbind(context, unbinds[0]!, catalog);

    expect(binding.active).toBe(false);
    expect(context.ownership.ownerOf("a", "y")).toBeUndefined();
  });

  it("unbinds all bind keys on the target", () => {
    const { context, binds, unbinds } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0, y: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 10, y: 20 } },
      { action: "bind", target: "a", properties: { x: "b.x" }, start: "0" },
      { action: "bind", target: "a", properties: { y: "b.y" }, start: "0" },
      { action: "unbind", target: "a", start: "1" },
    ]);
    const xBinding = new BindMechanism(binds[0]!);
    const yBinding = new BindMechanism(binds[1]!);
    xBinding.activate(context, 0);
    yBinding.activate(context, 0);

    activateUnbind(context, unbinds[0]!, catalog);

    expect(xBinding.active).toBe(false);
    expect(yBinding.active).toBe(false);
    expect(context.ownership.ownersOf("a").size).toBe(0);
  });

  it("does not fail when stop or unbind has no active owner", () => {
    const { context } = prepare([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
    ]);
    const stop: StopAction = { action: "stop", index: 1, target: "a", start: 0, end: 0, duration: 0, keys: ["x"] };
    const unbind: UnbindAction = { action: "unbind", index: 2, target: "a", start: 0, end: 0, duration: 0, keys: null };

    expect(() => activateStop(context, stop, catalog)).not.toThrow();
    expect(() => activateUnbind(context, unbind, catalog)).not.toThrow();
  });
});
