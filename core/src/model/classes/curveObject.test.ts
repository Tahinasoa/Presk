import { describe, expect, it } from "vitest";
import type { RefSegment } from "@/lang/expr/ast";
import type { Pt } from "@/geom/vec";
import { CURVE_DEF } from "@/model/classes/curveObject";
import { createTestEnv } from "@/model/ports";
import { readRef } from "@/model/refs";
import type { SceneObject } from "@/model/sceneObject";

const objectEnv = createTestEnv();
const ref = (name: string, index?: number): RefSegment => (
  index === undefined ? { name } : { name, index }
);
const points: Pt[] = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }];

function makeCurve(overrides: { closed?: boolean; interpolation?: string; points?: Pt[] } = {}): SceneObject {
  const curve = CURVE_DEF.create("c", objectEnv);
  curve.writeProp("points", overrides.points ?? points);
  if (overrides.closed !== undefined) curve.writeProp("closed", overrides.closed);
  if (overrides.interpolation !== undefined) curve.writeProp("interpolation", overrides.interpolation);
  return curve;
}

describe("CurveObject", () => {
  it("builds an open spline path through the control points", () => {
    const curve = makeCurve();
    const path = CURVE_DEF.paths.main.build(curve);

    expect(path.length).toBeGreaterThan(199.5);
    expect(path.length).toBeLessThan(200.5);
    expect(path.closed).toBe(false);
    expect(CURVE_DEF.paths.main.closed).toBe("state");
    expect(CURVE_DEF.paths.main.isClosed(curve)).toBe(false);
  });

  it("reads start and end anchors from the flattened path", () => {
    const curve = makeCurve();
    const start = readRef(curve, [ref("start")]) as Pt;
    const end = readRef(curve, [ref("end")]) as Pt;

    expect(start.x).toBeCloseTo(0, 6);
    expect(start.y).toBeCloseTo(0, 6);
    expect(end.x).toBeCloseTo(200, 6);
    expect(end.y).toBeCloseTo(0, 6);
  });

  it("derives bounds from the flattened points", () => {
    const curve = makeCurve();

    expect(readRef(curve, [ref("boundingBox"), ref("width")])).toBeCloseTo(200, 6);
  });

  it("exposes the original control points as vertices, not the flattened ones", () => {
    const curve = makeCurve();

    expect(readRef(curve, [ref("vertex", 1)])).toEqual({ x: 100, y: 0 });
  });

  it("rejects writes to the read-only start and end anchors", () => {
    const curve = makeCurve();

    expect(() => curve.writeProp("start", { x: 1, y: 1 })).toThrow();
    expect(() => curve.writeProp("end", { x: 1, y: 1 })).toThrow();
  });

  it("defaults to an open spline with a stroke width of two and no fill", () => {
    const curve = CURVE_DEF.create("c", objectEnv);

    expect(curve.readProp("closed")).toBe(false);
    expect(curve.readProp("interpolation")).toBe("spline");
    expect(curve.readProp("stroke")).toBe(0x9c9c9c);
    expect(curve.readProp("strokeWidth")).toBe(2);
    expect(CURVE_DEF.props.fill).toBeUndefined();
    expect(CURVE_DEF.props.points.minItems).toBe(2);
    expect(CURVE_DEF.props.interpolation.values).toEqual(["spline", "bezier"]);
  });

  it("builds a bezier path from chained cubic control points", () => {
    const curve = makeCurve({
      interpolation: "bezier",
      points: [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }],
    });
    const path = CURVE_DEF.paths.main.build(curve);

    expect(path.points).toHaveLength(49);
    const middle = path.points[24]!;
    expect(middle.x).toBeCloseTo(5, 6);
    expect(middle.y).toBeCloseTo(7.5, 6);
  });

  it("closes the flattened path when closed is true", () => {
    const curve = makeCurve({
      closed: true,
      points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
    });
    const path = CURVE_DEF.paths.main.build(curve);

    expect(path.closed).toBe(true);
    expect(path.points).toHaveLength(192);
    expect(CURVE_DEF.paths.main.isClosed(curve)).toBe(true);
  });

  it("supports the draw reveal effect", () => {
    expect(CURVE_DEF.effects.reveal?.variants).toContain("draw");
  });
});
