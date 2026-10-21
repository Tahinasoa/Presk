import { describe, expect, it } from "vitest";
import { createTestEnv } from "@/model/ports";
import { GroupObject, GROUP_DEF } from "@/model/classes/groupObject";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { detachPreserving, reparentPreserving } from "@/engine/sim/reparent";

const env = createTestEnv();

function rectangle(id: string, x: number, y: number): ReturnType<typeof RECTANGLE_DEF.create> {
  const object = RECTANGLE_DEF.create(id, env);
  object.setState("x", x);
  object.setState("y", y);
  object.setState("presence", 1);
  return object;
}

function group(id: string, x = 0, y = 0): GroupObject {
  const object = new GroupObject(id, GROUP_DEF, env);
  object.setState("x", x);
  object.setState("y", y);
  return object;
}

function expectPointClose(
  actual: { x: number; y: number },
  expected: { x: number; y: number },
): void {
  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
}

describe("reparenting", () => {
  it("preserves world appearance when reparenting into an empty translated group", () => {
    const a = rectangle("a", 10, 20);
    const g = group("g", 100, 0);
    const topLeft = a.readProp("topLeft") as { x: number; y: number };

    reparentPreserving(a, g);

    expect(a.getNumber("x")).toBe(-90);
    expect(a.getNumber("y")).toBe(20);
    expectPointClose(a.readProp("topLeft") as { x: number; y: number }, topLeft);
  });

  it("preserves world appearance and rotation when reparenting under a translated group", () => {
    const a = rectangle("a", 10, 20);
    a.setState("rotation", 30);
    const g = group("g", 50, 50);
    const topLeft = a.readProp("topLeft") as { x: number; y: number };

    reparentPreserving(a, g);

    expect(a.getNumber("rotation")).toBeCloseTo(30, 6);
    expectPointClose(a.readProp("topLeft") as { x: number; y: number }, topLeft);
  });

  it("detaches while preserving world position and transform", () => {
    const a = rectangle("a", 10, 20);
    const g = group("g", 100, 0);
    reparentPreserving(a, g);
    const topLeft = a.readProp("topLeft") as { x: number; y: number };

    detachPreserving(a);

    expect(a.getNumber("x")).toBe(10);
    expect(a.getNumber("y")).toBe(20);
    expect(a.parent).toBeNull();
    expectPointClose(a.readProp("topLeft") as { x: number; y: number }, topLeft);
  });

  it("moves a child between groups without changing its world appearance", () => {
    const a = rectangle("a", 10, 20);
    const g = group("g", 100, 0);
    const h = group("h", -20, 60);
    reparentPreserving(a, g);
    const topLeft = a.readProp("topLeft") as { x: number; y: number };

    reparentPreserving(a, h);

    expect(g.children()).not.toContain(a);
    expect(h.children()).toContain(a);
    expect(a.parent).toBe(h);
    expectPointClose(a.readProp("topLeft") as { x: number; y: number }, topLeft);
  });

  it("preserves a child's appearance inside an already bounded scaled group", () => {
    const g = group("g");
    const c = rectangle("c", 50, 50);
    c.setState("width", 100);
    c.setState("height", 100);
    g.addChild(c);
    g.setState("scale", 2);
    const a = rectangle("a", 60, 60);
    const topLeft = a.readProp("topLeft") as { x: number; y: number };

    reparentPreserving(a, g);

    expect(a.getNumber("scale")).toBeCloseTo(0.5, 6);
    expectPointClose(a.readProp("topLeft") as { x: number; y: number }, topLeft);
  });

  it("is a no-op when detaching an object that has no parent", () => {
    const a = rectangle("a", 10, 20);
    const matrix = a.worldMatrix();

    reparentPreserving(a, null);

    expect(a.worldMatrix()).toEqual(matrix);
    expect(a.parent).toBeNull();
  });
});
