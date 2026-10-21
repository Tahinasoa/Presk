import { describe, expect, it } from "vitest";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import type { RefSegment } from "@/lang/expr/ast";
import { describeRef, readRef } from "@/model/refs";
import { CIRCLE_DEF } from "@/model/classes/circleObject";
import { createTestEnv } from "@/model/ports";
import type { SceneObject } from "@/model/sceneObject";

const ref = (name: string): RefSegment => ({ name });
const objectEnv = createTestEnv();

function makeCircle(): SceneObject {
  const object = CIRCLE_DEF.create("circle", objectEnv);
  object.setState("x", 100);
  object.setState("y", 100);
  object.setState("radius", 50);
  return object;
}

describe("CircleObject", () => {
  it("reads its bounding box center, corners, and dimensions", () => {
    const object = makeCircle();
    expect(readRef(object, [ref("boundingBox"), ref("topLeft")])).toEqual({ x: 50, y: 50 });
    expect(readRef(object, [ref("boundingBox"), ref("center")])).toEqual({ x: 100, y: 100 });
    expect(readRef(object, [ref("boundingBox"), ref("width")])).toBe(100);
  });

  it("uses its center as pos and exposes radius as a reference", () => {
    const object = makeCircle();
    expect(object.readProp("pos")).toEqual({ x: 100, y: 100 });
    expect(readRef(object, [ref("radius")])).toBe(50);
  });

  it("does not expose rectangle-style anchors directly", () => {
    expect(describeRef(CIRCLE_DEF, [ref("topLeft")])).toMatchObject({
      ok: false,
      code: "E_EXPR_SEGMENT_UNKNOWN",
    });
  });

  it("scales its centered bounding box", () => {
    const object = makeCircle();
    object.setState("scale", 2);
    expect(readRef(object, [ref("boundingBox"), ref("width")])).toBe(200);
  });

  it("builds a closed circular path with clockwise travel", () => {
    const path = CIRCLE_DEF.paths.main.build(makeCircle());
    expect(path.closed).toBe(true);
    expect(path.length).toBeCloseTo(314.159, 1);
    expect(path.pointAt(0).x).toBeCloseTo(50, 6);
    expect(path.pointAt(0).y).toBeCloseTo(0, 6);
    expect(path.pointAt(0.25).x).toBeCloseTo(0, 0.05);
    expect(path.pointAt(0.25).y).toBeCloseTo(50, 0.05);
  });

  it("limits pivot values to center and pos", () => {
    expect(CIRCLE_DEF.props.pivot.values).toEqual(["center", "pos"]);
  });

  it("registers circle in the default catalog", () => {
    expect(createDefaultCatalog().types()).toContain("circle");
  });
});
