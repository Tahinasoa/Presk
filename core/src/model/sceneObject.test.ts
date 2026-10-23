import { describe, expect, it } from "vitest";
import { applyMat } from "@/geom/matrix";
import { createTestEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef, StateValue } from "@/model/values";
import type { Bounds } from "@/geom/bounds";

class TestObject extends SceneObject {
  localBounds(): Bounds | null {
    return { minX: 0, minY: 0, maxX: 100, maxY: 50 };
  }
}

class UnboundedTestObject extends TestObject {
  localBounds() {
    return null;
  }
}

const testDef: ClassDef = {
  type: "test",
  family: "rectangle",
  creatable: true,
  props: {},
  indexed: {},
  effects: {},
  paths: {},
  create: (id, env) => new TestObject(id, testDef, env, {}),
};

function createObject(initial: Record<string, StateValue> = {}): TestObject {
  return new TestObject("test", testDef, createTestEnv(), initial);
}

describe("SceneObject", () => {
  it("combines common state with initial values", () => {
    const object = createObject({ x: 10, y: 20 });
    expect(object.getState("x")).toBe(10);
    expect(object.getState("presence")).toBe(0);
    expect(object.getState("pivot")).toBe("center");
  });

  it("rejects unknown state keys", () => {
    const object = createObject();
    expect(() => object.getState("nope")).toThrow("Presk internal: unknown state key 'nope' on 'test'");
    expect(() => object.setState("nope", 1)).toThrow("Presk internal: unknown state key 'nope' on 'test'");
  });

  it("snapshots and restores state with deep copies", () => {
    const point = { x: 4, y: 5 };
    const object = createObject({ x: 10, point });
    const snapshot = object.snapshot();
    (snapshot.point as { x: number; y: number }).x = 99;
    expect((object.getState("point") as { x: number; y: number }).x).toBe(4);
    object.setState("x", 99);
    object.restore(snapshot);
    expect(object.getState("x")).toBe(10);
  });

  it("resolves default, pos and named pivots", () => {
    const object = createObject();
    expect(object.pivotLocal()).toEqual({ x: 50, y: 25 });
    object.setState("pivot", "pos");
    expect(object.pivotLocal()).toEqual({ x: 0, y: 0 });
    object.setState("pivot", "topLeft");
    expect(object.pivotLocal()).toEqual({ x: 0, y: 0 });
    object.setState("pivot", "bottomRight");
    expect(object.pivotLocal()).toEqual({ x: 100, y: 50 });
  });

  it("builds world transforms and transformed bounds", () => {
    const rotated = createObject({ x: 10, y: 20, rotation: 90 });
    const transformedOrigin = applyMat(rotated.worldMatrix(), { x: 0, y: 0 });
    expect(transformedOrigin.x).toBeCloseTo(85, 6);
    expect(transformedOrigin.y).toBeCloseTo(-5, 6);

    const scaled = createObject({ x: 10, y: 20, scale: 2, pivot: "topLeft" });
    expect(scaled.worldBounds()).toEqual({ minX: 10, minY: 20, maxX: 210, maxY: 120 });
  });

  it("composes parent transforms", () => {
    const parent = new TestObject("parent", testDef, createTestEnv(), { x: 100 });
    const child = createObject({ x: 10, y: 20 });
    child.parent = parent;
    const origin = applyMat(child.worldMatrix(), { x: 0, y: 0 });
    expect(origin).toEqual({ x: 110, y: 20 });
  });

  it("multiplies effective alpha through the parent chain", () => {
    const parent = new TestObject("parent", testDef, createTestEnv(), { opacity: 0.5, presence: 1 });
    const child = createObject({ opacity: 0.5, presence: 1 });
    child.parent = parent;
    expect(child.effectiveAlpha()).toBeCloseTo(0.25, 6);
    parent.setState("presence", 0);
    expect(child.effectiveAlpha()).toBe(0);
  });

  it("handles objects without local bounds", () => {
    const object = new UnboundedTestObject("unbounded", testDef, createTestEnv(), {});
    expect(object.worldBounds()).toBeNull();
    expect(object.pivotLocal()).toEqual({ x: 0, y: 0 });
  });

  it("exposes empty default children and routes property reads and writes", () => {
    const object = createObject({ x: 3 });
    expect(object.children()).toEqual([]);
    object.setChildren([createObject()]);
    expect(object.children()).toEqual([]);
    expect(() => object.readProp("missing")).toThrow("Presk internal:");
    expect(() => object.writeProp("missing", 1)).toThrow("Presk internal:");
  });

  it("gets and validates color state with getColor", () => {
    const object = createObject({
      fillNum: 0x9c9c9c,
      fillCanonical: "#9c9c9c",
      fillHexAlpha: "#ff000080",
      fillUpper: "#FF0000",
      fillNamed: "red",
      fillBool: true,
      fillObj: { x: 1, y: 2 },
      fillFloat: 1.5,
      fillNeg: -1,
    });
    expect(() => object.getColor("fillNum")).toThrow("Presk internal: not a colour 'fillNum' on 'test'");
    expect(object.getColor("fillCanonical")).toBe("#9c9c9c");
    expect(object.getColor("fillHexAlpha")).toBe("#ff000080");
    expect(() => object.getColor("fillUpper")).toThrow("Presk internal: not a colour 'fillUpper' on 'test'");
    expect(() => object.getColor("fillNamed")).toThrow("Presk internal: not a colour 'fillNamed' on 'test'");
    expect(() => object.getColor("fillBool")).toThrow("Presk internal: not a colour 'fillBool' on 'test'");
    expect(() => object.getColor("fillObj")).toThrow("Presk internal: not a colour 'fillObj' on 'test'");
    expect(() => object.getColor("fillFloat")).toThrow("Presk internal: not a colour 'fillFloat' on 'test'");
    expect(() => object.getColor("fillNeg")).toThrow("Presk internal: not a colour 'fillNeg' on 'test'");
    expect(() => object.getColor("missing")).toThrow("Presk internal:");
  });
});
