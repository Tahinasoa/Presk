import { describe, expect, it } from "vitest";
import type { RefSegment } from "@/lang/expr/ast";
import { describeRef, readRef } from "@/model/refs";
import { ELLIPSE_DEF } from "@/model/classes/ellipseObject";
import { createTestEnv } from "@/model/ports";
import type { SceneObject } from "@/model/sceneObject";

const ref = (name: string): RefSegment => ({ name });

function makeEllipse(): SceneObject {
  const object = ELLIPSE_DEF.create("ellipse", createTestEnv());
  object.setState("x", 200);
  object.setState("y", 100);
  object.setState("width", 100);
  object.setState("height", 60);
  return object;
}

describe("EllipseObject", () => {
  it("reads its bounding box corners, center, and height", () => {
    const object = makeEllipse();
    expect(readRef(object, [ref("boundingBox"), ref("topLeft")])).toEqual({ x: 150, y: 70 });
    expect(readRef(object, [ref("boundingBox"), ref("center")])).toEqual({ x: 200, y: 100 });
    expect(readRef(object, [ref("boundingBox"), ref("height")])).toBe(60);
  });

  it("builds a closed ellipse path from the rightmost point clockwise", () => {
    const path = ELLIPSE_DEF.paths.main.build(makeEllipse());
    expect(path.closed).toBe(true);
    expect(path.pointAt(0).x).toBeCloseTo(50, 6);
    expect(path.pointAt(0).y).toBeCloseTo(0, 6);
    expect(Math.abs(path.pointAt(0.25).x)).toBeLessThan(0.05);
    expect(Math.abs(path.pointAt(0.25).y - 30)).toBeLessThan(0.05);
  });

  it("updates its bounding box when width changes", () => {
    const object = makeEllipse();
    object.writeProp("width", 200);
    expect(readRef(object, [ref("boundingBox"), ref("width")])).toBe(200);
  });

  it("does not expose rectangle-style anchors directly", () => {
    expect(describeRef(ELLIPSE_DEF, [ref("topLeft")])).toMatchObject({
      ok: false,
      code: "E_EXPR_SEGMENT_UNKNOWN",
    });
  });
});
