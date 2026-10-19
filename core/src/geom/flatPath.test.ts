import { describe, expect, it } from "vitest";
import { FlatPath } from "@/geom/flatPath";
import type { Pt } from "@/geom/vec";

const squarePoints: Pt[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

function expectPoint(actual: Pt, expected: Pt): void {
  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
}

describe("FlatPath", () => {
  it("measures a closed path and samples by arc length", () => {
    const path = new FlatPath(squarePoints, true);
    expect(path.length).toBe(40);
    expectPoint(path.pointAt(0), { x: 0, y: 0 });
    expectPoint(path.pointAt(0.125), { x: 5, y: 0 });
    expectPoint(path.pointAt(0.25), { x: 10, y: 0 });
    expectPoint(path.pointAt(0.5), { x: 10, y: 10 });
  });

  it("wraps closed path parameters including negatives", () => {
    const path = new FlatPath(squarePoints, true);
    expectPoint(path.pointAt(1), { x: 0, y: 0 });
    expectPoint(path.pointAt(1.25), { x: 10, y: 0 });
    expectPoint(path.pointAt(-0.75), { x: 10, y: 0 });
  });

  it("uses the outgoing segment angle at closed vertices", () => {
    const path = new FlatPath(squarePoints, true);
    expect(path.angleAt(0)).toBeCloseTo(0, 6);
    expect(path.angleAt(0.25)).toBeCloseTo(90, 6);
    expect(path.angleAt(0.5)).toBeCloseTo(180, 6);
    expect(path.angleAt(0.75)).toBeCloseTo(-90, 6);
  });

  it("clamps open path parameters and uses outgoing angles at vertices", () => {
    const path = new FlatPath([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], false);
    expect(path.length).toBe(20);
    expectPoint(path.pointAt(1), { x: 10, y: 10 });
    expectPoint(path.pointAt(2), { x: 10, y: 10 });
    expectPoint(path.pointAt(-1), { x: 0, y: 0 });
    expect(path.angleAt(1)).toBeCloseTo(90, 6);
    expect(path.angleAt(0.5)).toBeCloseTo(90, 6);
  });

  it("returns the requested subpath and its intervening vertices", () => {
    const path = new FlatPath([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], false);
    expect(path.sub(0.25, 0.75)).toEqual([{ x: 5, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 5 }]);
  });

  it("copies input points and handles a zero length path", () => {
    const input = [{ x: 3, y: 4 }];
    const path = new FlatPath(input, false);
    input[0].x = 99;
    expect(path.points[0]).toEqual({ x: 3, y: 4 });
    expect(path.length).toBe(0);
    expectPoint(path.pointAt(0.5), { x: 3, y: 4 });
    expect(path.angleAt(0)).toBe(0);
  });
});
