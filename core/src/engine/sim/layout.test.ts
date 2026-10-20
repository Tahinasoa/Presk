import { describe, expect, it } from "vitest";
import { computeLayout } from "@/engine/sim/layout";
import { createTestEnv } from "@/model/ports";
import { GroupObject, GROUP_DEF } from "@/model/classes/groupObject";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { makeTestObject } from "@/model/testing";

const env = createTestEnv();

function rectangle(id: string, x: number, y: number, width: number, height: number) {
  const object = RECTANGLE_DEF.create(id, env);
  object.setState("x", x);
  object.setState("y", y);
  object.setState("width", width);
  object.setState("height", height);
  return object;
}

function groupWithChildren(): GroupObject {
  const group = new GroupObject("g", GROUP_DEF, env);
  group.addChild(rectangle("a", 0, 0, 100, 50));
  group.addChild(rectangle("b", 500, 300, 60, 40));
  group.addChild(rectangle("c", 7, 7, 20, 20));
  return group;
}

describe("computeLayout", () => {
  it("returns no positions for layout none", () => {
    const group = groupWithChildren();

    expect(computeLayout(group)).toEqual(new Map());
  });

  it("places children vertically with a gap", () => {
    const group = groupWithChildren();
    group.setState("layout", "vertical");
    group.setState("gap", 10);

    expect(computeLayout(group)).toEqual(new Map([
      ["a", { x: 0, y: 0 }],
      ["b", { x: 0, y: 60 }],
      ["c", { x: 0, y: 110 }],
    ]));
  });

  it("places children vertically with a margin", () => {
    const group = groupWithChildren();
    group.setState("layout", "vertical");
    group.setState("margin", 5);

    expect(computeLayout(group)).toEqual(new Map([
      ["a", { x: 5, y: 5 }],
      ["b", { x: 5, y: 55 }],
      ["c", { x: 5, y: 95 }],
    ]));
  });

  it("places children horizontally with a gap", () => {
    const group = groupWithChildren();
    group.setState("layout", "horizontal");
    group.setState("gap", 10);

    expect(computeLayout(group)).toEqual(new Map([
      ["a", { x: 0, y: 0 }],
      ["b", { x: 110, y: 0 }],
      ["c", { x: 180, y: 0 }],
    ]));
  });

  it("uses transformed bounds when laying out scaled children", () => {
    const group = new GroupObject("g", GROUP_DEF, env);
    const a = rectangle("a", 0, 0, 100, 50);
    a.setState("scale", 2);
    const b = rectangle("b", 500, 300, 60, 40);
    group.addChild(a);
    group.addChild(b);
    group.setState("layout", "vertical");

    expect(computeLayout(group)).toEqual(new Map([
      ["a", { x: 50, y: 25 }],
      ["b", { x: 0, y: 100 }],
    ]));
  });

  it("uses axis-aligned bounds of rotated children", () => {
    const group = new GroupObject("g", GROUP_DEF, env);
    const a = rectangle("a", 0, 0, 100, 50);
    a.setState("rotation", 90);
    group.addChild(a);
    group.setState("layout", "vertical");

    expect(computeLayout(group)).toEqual(new Map([["a", { x: -25, y: 25 }]]));
  });

  it("ignores children without bounds", () => {
    const group = new GroupObject("g", GROUP_DEF, env);
    const unbounded = makeTestObject("unbounded");
    const bounded = rectangle("a", 100, 100, 20, 20);
    group.addChild(unbounded);
    group.addChild(bounded);
    group.setState("layout", "vertical");

    expect(computeLayout(group)).toEqual(new Map([["a", { x: 0, y: 0 }]]));
  });
});
