import { describe, expect, it } from "vitest";
import {
  applyLinear,
  applyMat,
  composeMat,
  degToRad,
  IDENTITY,
  invertMat,
  matRotationDeg,
  matScale,
  radToDeg,
  translateMat,
  trsPivot,
} from "@/geom/matrix";

describe("matrix helpers", () => {
  it("rotates clockwise on screen", () => {
    expect(applyMat(trsPivot({ x: 0, y: 0 }, { x: 0, y: 0 }, 90, 1), { x: 1, y: 0 })).toEqual({
      x: expect.closeTo(0, 6),
      y: expect.closeTo(1, 6),
    });
  });

  it("translates points", () => {
    expect(applyMat(trsPivot({ x: 10, y: 20 }, { x: 0, y: 0 }, 0, 1), { x: 1, y: 1 })).toEqual({
      x: 11,
      y: 21,
    });
  });

  it("rotates a rectangle corner around its local pivot", () => {
    expect(applyMat(trsPivot({ x: 10, y: 20 }, { x: 50, y: 25 }, 90, 1), { x: 0, y: 0 })).toEqual({
      x: 85,
      y: -5,
    });
  });

  it("keeps the pivot fixed while scaling and scales the origin around it", () => {
    const matrix = trsPivot({ x: 0, y: 0 }, { x: 10, y: 10 }, 0, 2);
    expect(applyMat(matrix, { x: 10, y: 10 })).toEqual({ x: 10, y: 10 });
    expect(applyMat(matrix, { x: 0, y: 0 })).toEqual({ x: -10, y: -10 });
  });

  it("inverts a matrix", () => {
    const matrix = trsPivot({ x: 10, y: 20 }, { x: 5, y: 8 }, 30, 2);
    const point = { x: 4, y: -7 };
    const restored = applyMat(invertMat(matrix), applyMat(matrix, point));
    expect(restored.x).toBeCloseTo(point.x, 6);
    expect(restored.y).toBeCloseTo(point.y, 6);
  });

  it("rejects a singular matrix", () => {
    expect(() => invertMat({ a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 })).toThrow(
      "Presk internal: singular matrix",
    );
  });

  it("reports rotation and uniform scale", () => {
    const matrix = trsPivot({ x: 3, y: 4 }, { x: 2, y: 1 }, 30, 2);
    expect(matRotationDeg(matrix)).toBeCloseTo(30, 6);
    expect(matScale(matrix)).toBeCloseTo(2, 6);
  });

  it("applies the linear part without translation", () => {
    expect(applyLinear(translateMat(5, 5), { x: 1, y: 2 })).toEqual({ x: 1, y: 2 });
  });

  it("composes matrices with the rightmost transform applied first", () => {
    expect(applyMat(composeMat(translateMat(3, 4), IDENTITY), { x: 1, y: 2 })).toEqual({ x: 4, y: 6 });
  });

  it("converts degrees and radians", () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 10);
    expect(radToDeg(Math.PI)).toBeCloseTo(180, 10);
  });
});
