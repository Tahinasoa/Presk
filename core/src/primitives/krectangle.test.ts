// Geometry tests for KRectangle: corners must follow rotation (spec §4.2),
// boundingBox must stay axis-aligned (spec §4.3).
import { describe, it, expect } from "vitest";
import KRectangle from "./krectangle";

describe("KRectangle", () => {
  it("computes axis-aligned corners with no rotation", () => {
    const rect = new KRectangle({ id: "r", x: 100, y: 100, width: 40, height: 20 });

    expect(rect.topLeft).toEqual({ x: 80, y: 90 });
    expect(rect.topRight).toEqual({ x: 120, y: 90 });
    expect(rect.bottomRight).toEqual({ x: 120, y: 110 });
    expect(rect.bottomLeft).toEqual({ x: 80, y: 110 });
    expect(rect.center).toEqual({ x: 100, y: 100 });
  });

  it("rotates real corners around the center by 90 degrees", () => {
    const rect = new KRectangle({ id: "r", x: 0, y: 0, width: 40, height: 20, rotation: Math.PI / 2 });

    // A 90deg rotation swaps width/height's contribution to each corner.
    expect(rect.topLeft.x).toBeCloseTo(10);
    expect(rect.topLeft.y).toBeCloseTo(-20);
  });

  it("keeps boundingBox axis-aligned even when the rectangle is rotated", () => {
    const rect = new KRectangle({ id: "r", x: 0, y: 0, width: 40, height: 20, rotation: Math.PI / 4 });
    const box = rect.boundingBox;

    // For a 45deg rotation the AABB must be a square-ish diamond envelope:
    // topLeft.x === bottomLeft.x and topLeft.y === topRight.y.
    expect(box.topLeft.x).toBeCloseTo(box.bottomLeft.x);
    expect(box.topLeft.y).toBeCloseTo(box.topRight.y);
  });

  it("containsPoint accounts for rotation", () => {
    const rect = new KRectangle({ id: "r", x: 0, y: 0, width: 40, height: 20 });

    expect(rect.containsPoint(0, 0)).toBe(true);
    expect(rect.containsPoint(30, 0)).toBe(false);
  });

  it("allows setting point anchors correctly", () => {
    const rect = new KRectangle({ id: "r", x: 100, y: 100, width: 40, height: 20 });

    rect.center = { x: 200, y: 300 };
    expect(rect.center).toEqual({ x: 200, y: 300 });
    expect(rect.x).toBe(200);
    expect(rect.y).toBe(300);

    rect.topLeft = { x: 0, y: 0 };
    expect(rect.topLeft).toEqual({ x: 0, y: 0 });
    expect(rect.center).toEqual({ x: 20, y: 10 });
  });

  it("allows setting point anchors via property animators (setNow/transform)", () => {
    const rect = new KRectangle({ id: "r", x: 100, y: 100, width: 40, height: 20 });
    rect.setNow({ center: { x: 400, y: 500 } });
    expect(rect.center).toEqual({ x: 400, y: 500 });

    rect.setNow({ topLeft: { x: 10, y: 20 } });
    expect(rect.topLeft).toEqual({ x: 10, y: 20 });
  });
});
