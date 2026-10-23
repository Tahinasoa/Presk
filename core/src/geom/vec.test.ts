import { describe, expect, it } from "vitest";
import { addPt, clamp, distPt, lerp, lerpPt, nearlyEqual, pt, scalePt, subPt } from "./vec";

describe("vector utilities", () => {
  it("constructs points", () => {
    expect(pt(1, 2)).toEqual({ x: 1, y: 2 });
  });

  it("adds and subtracts points", () => {
    expect(addPt({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
    expect(subPt({ x: 5, y: 5 }, { x: 1, y: 2 })).toEqual({ x: 4, y: 3 });
  });

  it("scales a point", () => {
    expect(scalePt({ x: 1, y: 2 }, 3)).toEqual({ x: 3, y: 6 });
  });

  it("interpolates numbers and points", () => {
    expect(lerp(10, 20, 0.25)).toBeCloseTo(12.5, 6);
    expect(lerpPt({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({ x: 5, y: 10 });
  });

  it("measures point distance", () => {
    expect(distPt({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5, 6);
  });

  it("clamps values", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });

  it("compares numbers with a tolerance", () => {
    expect(nearlyEqual(1, 1 + 1e-12)).toBe(true);
    expect(nearlyEqual(1, 1.001)).toBe(false);
    expect(nearlyEqual(1, 1.001, 0.01)).toBe(true);
  });
});
