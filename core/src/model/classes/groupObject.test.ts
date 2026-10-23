import { describe, expect, it } from "vitest";
import { PreskRuntimeError } from "@/lang/diagnostics";
import { createTestEnv } from "@/model/ports";
import { GroupObject, GROUP_DEF } from "@/model/classes/groupObject";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { makeTestObject } from "@/model/testing";
import { World } from "@/model/world";

const env = createTestEnv();

function group(id = "g"): GroupObject {
  return new GroupObject(id, GROUP_DEF, env);
}

function rectangle(id: string, properties: { x?: number; y?: number; width?: number; height?: number } = {}) {
  const object = RECTANGLE_DEF.create(id, env);
  if (properties.x !== undefined) object.setState("x", properties.x);
  if (properties.y !== undefined) object.setState("y", properties.y);
  if (properties.width !== undefined) object.setState("width", properties.width);
  if (properties.height !== undefined) object.setState("height", properties.height);
  return object;
}

describe("GroupObject", () => {
  it("has no local bounds when it has no children", () => {
    expect(group().localBounds()).toBeNull();
  });

  it("throws a runtime error when an empty group anchor is read", () => {
    expect(() => group().readProp("topLeft")).toThrow(PreskRuntimeError);
  });

  it("tracks children and their parent links", () => {
    const g = group();
    const a = rectangle("a");
    const b = rectangle("b");

    g.addChild(a);
    g.addChild(b);

    expect(a.parent).toBe(g);
    expect(g.children().map((child) => child.id)).toEqual(["a", "b"]);
  });

  it("derives world bounds from its children", () => {
    const g = group();
    g.addChild(rectangle("a", { width: 100, height: 50 }));
    g.addChild(rectangle("b", { x: 200, y: 100, width: 50, height: 50 }));

    expect(g.worldBounds()).toEqual({ minX: 0, minY: 0, maxX: 250, maxY: 150 });
  });

  it("expands world bounds by its margin", () => {
    const g = group();
    g.addChild(rectangle("a", { width: 100, height: 50 }));
    g.addChild(rectangle("b", { x: 200, y: 100, width: 50, height: 50 }));
    g.writeProp("margin", 10);

    expect(g.worldBounds()).toEqual({ minX: -10, minY: -10, maxX: 260, maxY: 160 });
  });

  it("translates the group's children when its x changes", () => {
    const g = group();
    const a = rectangle("a", { width: 100, height: 50 });
    g.addChild(a);
    g.setState("x", 100);

    expect(a.readProp("topLeft")).toEqual({ x: 100, y: 0 });
  });

  it("applies its transform recursively and multiplies effective alpha", () => {
    const g = group();
    const a = rectangle("a");
    a.setState("presence", 0.8);
    a.setState("opacity", 0.5);
    g.setState("presence", 0.6);
    g.setState("opacity", 0.7);
    g.addChild(a);
    const initialMatrix = a.worldMatrix();

    g.setState("scale", 2);

    expect(a.worldMatrix()).not.toEqual(initialMatrix);
    expect(a.effectiveAlpha()).toBeCloseTo(0.5 * 0.8 * 0.7 * 0.6);
  });

  it("detaches a child when it is removed", () => {
    const g = group();
    const a = rectangle("a");
    g.addChild(a);

    g.removeChild(a);

    expect(a.parent).toBeNull();
    expect(g.children()).toEqual([]);
  });

  it("removes a child from its former group when reparented", () => {
    const g = group();
    const h = group("h");
    const a = rectangle("a");
    g.addChild(a);

    h.addChild(a);

    expect(g.children()).not.toContain(a);
    expect(h.children()).toEqual([a]);
    expect(a.parent).toBe(h);
  });

  it("defines the supported layout values", () => {
    expect(GROUP_DEF.props.layout.values).toEqual(["vertical", "horizontal", "none"]);
  });

  it("starts with presence one", () => {
    expect(group().getNumber("presence")).toBe(1);
  });

  it("restores initial child hierarchy when the world resets", () => {
    const world = new World(makeTestObject("scene"));
    const g = group();
    const h = group("h");
    const a = rectangle("a");
    g.addChild(a);
    world.add(g);
    world.add(h);
    world.add(a);
    world.captureInitial();

    g.removeChild(a);
    h.addChild(a);
    world.reset();

    expect(g.children()).toEqual([a]);
    expect(h.children()).toEqual([]);
    expect(a.parent).toBe(g);
  });
});
