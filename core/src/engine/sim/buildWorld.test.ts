import { describe, expect, it } from "vitest";
import { buildWorld } from "@/engine/sim/buildWorld";
import { compileProgram } from "@/engine/compileProgram";
import { Catalog } from "@/model/catalog";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";
import { RectangleObject, RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import type { ClassDef } from "@/model/values";

const scene = { width: 800, height: 600 };
const objectEnv = createTestEnv();

function compiled(steps: unknown[], catalog: Catalog = createDefaultCatalog()) {
  return compileProgram({ version: "1.0", scene, steps }, { catalog, objectEnv });
}

describe("buildWorld", () => {
  it("creates objects and applies initial properties", () => {
    const world = buildWorld(compiled([
      { action: "create", target: "a", type: "rectangle", properties: { x: 10, y: 20, width: 50 } },
    ]), { catalog: createDefaultCatalog(), objectEnv });
    expect(world.require("a").readProp("x")).toBe(10);
    expect(world.require("a").readProp("width")).toBe(50);
    expect(world.require("a").getNumber("presence")).toBe(0);
  });

  it("applies reveal at create", () => {
    const world = buildWorld(compiled([
      { action: "create", target: "a", type: "rectangle", properties: { reveal: true } },
    ]), { catalog: createDefaultCatalog(), objectEnv });
    expect(world.require("a").getNumber("presence")).toBe(1);
  });

  it("evaluates references to earlier created objects", () => {
    const world = buildWorld(compiled([
      { action: "create", target: "t", type: "text", properties: { text: "Hello", fontSize: 10, x: 100, y: 100 } },
      { action: "create", target: "r", type: "rectangle", properties: { topLeft: "t.bottomLeft" } },
    ]), { catalog: createDefaultCatalog(), objectEnv });
    expect(world.require("r").readProp("x")).toBe(100);
    expect(world.require("r").readProp("y")).toBe(112);
  });

  it("starts created objects invisible unless reveal is specified", () => {
    const world = buildWorld(compiled([
      { action: "create", target: "a", type: "rectangle" },
    ]), { catalog: createDefaultCatalog(), objectEnv });
    expect(world.require("a").effectiveAlpha()).toBe(0);
  });

  it("applies order zero props, the geometry hook, then later props", () => {
    const calls: string[] = [];
    const catalog = createDefaultCatalog();
    const widthSet = RECTANGLE_DEF.props.width?.set;
    const xSet = RECTANGLE_DEF.props.x?.set;
    if (!widthSet || !xSet) throw new Error("test setup: expected writable rectangle props");
    let orderedDef: ClassDef;
    orderedDef = {
      ...RECTANGLE_DEF,
      type: "orderedRectangle",
      props: {
        ...RECTANGLE_DEF.props,
        width: { ...RECTANGLE_DEF.props.width!, order: 0, set: (object, value) => { calls.push("prop0"); widthSet(object, value); } },
        x: { ...RECTANGLE_DEF.props.x!, order: 2, set: (object, value) => { calls.push("propLater"); xSet(object, value); } },
      },
      afterGeometry: () => calls.push("hook"),
      create: (id, env) => new RectangleObject(id, orderedDef, env),
    };
    catalog.register(orderedDef);

    buildWorld(compiled([
      { action: "create", target: "a", type: "orderedRectangle", properties: { width: 50, x: 10 } },
    ], catalog), { catalog, objectEnv });
    expect(calls).toEqual(["prop0", "hook", "propLater"]);
  });

  it("restores the captured initial state on reset", () => {
    const world = buildWorld(compiled([
      { action: "create", target: "a", type: "rectangle", properties: { x: 10 } },
    ]), { catalog: createDefaultCatalog(), objectEnv });
    world.require("a").writeProp("x", 90);
    world.reset();
    expect(world.require("a").readProp("x")).toBe(10);
  });

  it("creates the scene root from the program dimensions", () => {
    const world = buildWorld(compiled([], createDefaultCatalog()), { catalog: createDefaultCatalog(), objectEnv });
    expect(world.get("scene")?.readProp("width")).toBe(800);
    expect(world.get("scene")?.readProp("height")).toBe(600);
  });
});
