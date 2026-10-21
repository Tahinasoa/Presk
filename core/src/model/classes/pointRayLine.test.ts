import { describe, expect, it } from "vitest";
import type { RefSegment } from "@/lang/expr/ast";
import { describeRef, readRef } from "@/model/refs";
import { LINE_DEF, RAY_DEF } from "@/model/classes/rayLineObject";
import { POINT_DEF } from "@/model/classes/pointObject";
import { normalizeSegmentOrigin } from "@/model/classes/segmentObject";
import { createTestEnv } from "@/model/ports";
import type { SceneObject } from "@/model/sceneObject";

const objectEnv = createTestEnv();
const ref = (name: string): RefSegment => ({ name });

function makeRay(): SceneObject {
  const ray = RAY_DEF.create("ray", objectEnv);
  ray.writeProp("origin", { x: 10, y: 20 });
  ray.writeProp("through", { x: 110, y: 20 });
  normalizeSegmentOrigin(ray);
  return ray;
}

function makeLine(): SceneObject {
  const line = LINE_DEF.create("line", objectEnv);
  line.writeProp("p1", { x: 0, y: 0 });
  line.writeProp("p2", { x: 10, y: 10 });
  normalizeSegmentOrigin(line);
  return line;
}

describe("PointObject", () => {
  it("reads pos and its x coordinate without finite bounds", () => {
    const point = POINT_DEF.create("point", objectEnv);
    point.writeProp("x", 5);
    point.writeProp("y", 6);

    expect(readRef(point, [ref("pos")])).toEqual({ x: 5, y: 6 });
    expect(readRef(point, [ref("pos"), ref("x")])).toBe(5);
    expect(describeRef(POINT_DEF, [ref("boundingBox"), ref("center")]))
      .toMatchObject({ ok: false, code: "E_EXPR_INFINITE_REF" });
    expect(point.worldBounds()).toBeNull();
    expect(point.readProp("pivot")).toBe("pos");
  });
});

describe("RayLineObject", () => {
  it("normalizes ray origin and through points", () => {
    const ray = makeRay();

    expect(readRef(ray, [ref("origin")])).toEqual({ x: 10, y: 20 });
    expect(readRef(ray, [ref("through")])).toEqual({ x: 110, y: 20 });
    expect(ray.readProp("pos")).toEqual({ x: 10, y: 20 });
    expect(describeRef(RAY_DEF, [ref("boundingBox"), ref("center")]))
      .toMatchObject({ ok: false, code: "E_EXPR_INFINITE_REF" });
    expect(ray.worldBounds()).toBeNull();
  });

  it("normalizes line p1 and p2 points", () => {
    const line = makeLine();

    expect(readRef(line, [ref("p2")])).toEqual({ x: 10, y: 10 });
    expect(line.readProp("pos")).toEqual({ x: 0, y: 0 });
  });

  it("uses pos pivots and unbounded families", () => {
    expect(POINT_DEF.props.pivot.values).toEqual(["pos"]);
    expect(RAY_DEF.props.pivot.values).toEqual(["pos"]);
    expect(RAY_DEF.create("ray", objectEnv).readProp("pivot")).toBe("pos");
    expect(RAY_DEF.props.origin.writes).toEqual(["p0"]);
    expect(RAY_DEF.props.through.writes).toEqual(["p1"]);
    expect(RAY_DEF.props.origin.order).toBe(0);
    expect(LINE_DEF.props.p1.writes).toEqual(["p0"]);
    expect(LINE_DEF.props.p2.writes).toEqual(["p1"]);
    expect(LINE_DEF.family).toBe("unbounded");
    expect(RAY_DEF.paths).toEqual({});
    expect(RAY_DEF.effects.reveal.variants).toEqual(["default"]);
  });
});
