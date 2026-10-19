import { describe, expect, it } from "vitest";
import { createTestEnv } from "@/model/ports";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import type { SceneObject } from "@/model/sceneObject";
import type { StateValue } from "@/model/values";
import type { Pt } from "@/geom/vec";

function makeRectangle(id: string, state: Record<string, StateValue> = {}): SceneObject {
  const object = RECTANGLE_DEF.create(id, createTestEnv());
  for (const [key, value] of Object.entries(state)) object.setState(key, value);
  return object;
}

function expectPoint(actual: Pt, expected: Pt): void {
  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
}

describe("RectangleObject", () => {
  it("reads rectangle anchors in world coordinates", () => {
    const object = makeRectangle("rect", { x: 10, y: 20, width: 100, height: 50 });
    expectPoint(object.readProp("topLeft") as Pt, { x: 10, y: 20 });
    expectPoint(object.readProp("bottomRight") as Pt, { x: 110, y: 70 });
    expectPoint(object.readProp("center") as Pt, { x: 60, y: 45 });
    expectPoint(object.readProp("centerRight") as Pt, { x: 110, y: 45 });
    expect(object.readProp("pos")).toEqual({ x: 10, y: 20 });
  });

  it("rotates anchors with the object and assigns a world anchor", () => {
    const object = makeRectangle("rect", { x: 10, y: 20, width: 100, height: 50, rotation: 90 });
    expectPoint(object.readProp("topLeft") as Pt, { x: 85, y: -5 });
    expectPoint(object.readProp("center") as Pt, { x: 60, y: 45 });
    object.writeProp("topLeft", { x: 0, y: 0 });
    expect(object.getNumber("x")).toBeCloseTo(-75, 6);
    expect(object.getNumber("y")).toBeCloseTo(25, 6);
  });

  it("reads and assigns anchors through the parent transform", () => {
    const parent = makeRectangle("parent", { x: 100 });
    const child = makeRectangle("child", { x: 10, y: 20 });
    child.parent = parent;
    expectPoint(child.readProp("topLeft") as Pt, { x: 110, y: 20 });
    child.writeProp("topLeft", { x: 0, y: 0 });
    expect(child.getNumber("x")).toBeCloseTo(-100, 6);
    expect(child.getNumber("y")).toBeCloseTo(0, 6);
  });

  it("computes transformed bounds and a closed rectangle path", () => {
    const object = makeRectangle("rect", { x: 10, y: 20, width: 100, height: 50, scale: 2, pivot: "topLeft" });
    expect(object.worldBounds()).toEqual({ minX: 10, minY: 20, maxX: 210, maxY: 120 });
    const path = RECTANGLE_DEF.paths.main.build(object);
    expect(path.length).toBe(300);
    expect(path.pointAt(0.5)).toEqual({ x: 100, y: 50 });
  });

  it("publishes the rectangle class definition and reusable props", () => {
    expect(RECTANGLE_DEF.props.topLeft.writes).toEqual(["x", "y"]);
    expect(RECTANGLE_DEF.props.width.animatable).toBe(true);
    expect(RECTANGLE_DEF.props.pivot.values).toHaveLength(9);
    expect(Object.keys(RECTANGLE_DEF.effects)).toEqual(["reveal"]);
    expect(Object.keys(RECTANGLE_DEF.paths)).toEqual(["main"]);
  });
});
