import { describe, it, expect } from "vitest";
import KAbstractRectangle from "./kabstractRectangle";

class TestRectangle extends KAbstractRectangle {}

describe("KAbstractRectangle", () => {
  it("gets and sets dimension and anchor properties (width, height, anchorX, anchorY)", () => {
    const rect = new TestRectangle({ id: "r1", x: 100, y: 200, width: 80, height: 50, anchorX: 0.25, anchorY: 0.75 });

    // Initial getters
    expect(rect.width).toBe(80);
    expect(rect.height).toBe(50);
    expect(rect.anchorX).toBe(0.25);
    expect(rect.anchorY).toBe(0.75);

    // Setters
    rect.width = 120;
    rect.height = 90;
    rect.anchorX = 0.5;
    rect.anchorY = 0.5;

    expect(rect.width).toBe(120);
    expect(rect.height).toBe(90);
    expect(rect.anchorX).toBe(0.5);
    expect(rect.anchorY).toBe(0.5);
  });

  it("computes all 9 point anchor getters correctly", () => {
    const rect = new TestRectangle({ id: "r1", x: 100, y: 200, width: 100, height: 60, anchorX: 0.5, anchorY: 0.5 });

    expect(rect.topLeft).toEqual({ x: 50, y: 170 });
    expect(rect.topCenter).toEqual({ x: 100, y: 170 });
    expect(rect.topRight).toEqual({ x: 150, y: 170 });

    expect(rect.leftCenter).toEqual({ x: 50, y: 200 });
    expect(rect.center).toEqual({ x: 100, y: 200 });
    expect(rect.rightCenter).toEqual({ x: 150, y: 200 });

    expect(rect.bottomLeft).toEqual({ x: 50, y: 230 });
    expect(rect.bottomCenter).toEqual({ x: 100, y: 230 });
    expect(rect.bottomRight).toEqual({ x: 150, y: 230 });
  });

  it("allows setting all 9 point anchors via their setters", () => {
    const rect = new TestRectangle({ id: "r1", x: 100, y: 200, width: 100, height: 60, anchorX: 0.5, anchorY: 0.5 });

    // Set topLeft
    rect.topLeft = { x: 0, y: 0 };
    expect(rect.topLeft).toEqual({ x: 0, y: 0 });
    expect(rect.center).toEqual({ x: 50, y: 30 });

    // Set topCenter
    rect.topCenter = { x: 50, y: 10 };
    expect(rect.topCenter).toEqual({ x: 50, y: 10 });

    // Set topRight
    rect.topRight = { x: 200, y: 10 };
    expect(rect.topRight).toEqual({ x: 200, y: 10 });

    // Set leftCenter
    rect.leftCenter = { x: 0, y: 100 };
    expect(rect.leftCenter).toEqual({ x: 0, y: 100 });

    // Set center
    rect.center = { x: 300, y: 400 };
    expect(rect.center).toEqual({ x: 300, y: 400 });

    // Set rightCenter
    rect.rightCenter = { x: 500, y: 400 };
    expect(rect.rightCenter).toEqual({ x: 500, y: 400 });

    // Set bottomLeft
    rect.bottomLeft = { x: 10, y: 200 };
    expect(rect.bottomLeft).toEqual({ x: 10, y: 200 });

    // Set bottomCenter
    rect.bottomCenter = { x: 60, y: 200 };
    expect(rect.bottomCenter).toEqual({ x: 60, y: 200 });

    // Set bottomRight
    rect.bottomRight = { x: 110, y: 200 };
    expect(rect.bottomRight).toEqual({ x: 110, y: 200 });
  });

  it("computes scalar anchors (top, bottom, left, right) and boundingBox getter", () => {
    const rect = new TestRectangle({ id: "r1", x: 100, y: 200, width: 60, height: 40, anchorX: 0.5, anchorY: 0.5 });

    expect(rect.left).toBe(70);
    expect(rect.right).toBe(130);
    expect(rect.top).toBe(180);
    expect(rect.bottom).toBe(220);

    const box = rect.boundingBox;
    expect(box.topLeft).toEqual({ x: 70, y: 180 });
    expect(box.topRight).toEqual({ x: 130, y: 180 });
    expect(box.bottomLeft).toEqual({ x: 70, y: 220 });
    expect(box.bottomRight).toEqual({ x: 130, y: 220 });
    expect(box.center).toEqual({ x: 100, y: 200 });
  });

  it("checks containsPoint correctly", () => {
    const rect = new TestRectangle({ id: "r1", x: 100, y: 200, width: 60, height: 40, anchorX: 0.5, anchorY: 0.5 });

    // Inside
    expect(rect.containsPoint(100, 200)).toBe(true);
    expect(rect.containsPoint(70, 180)).toBe(true);
    expect(rect.containsPoint(130, 220)).toBe(true);

    // Outside
    expect(rect.containsPoint(50, 200)).toBe(false);
    expect(rect.containsPoint(150, 200)).toBe(false);
    expect(rect.containsPoint(100, 150)).toBe(false);
    expect(rect.containsPoint(100, 250)).toBe(false);
  });

  it("supports property animators for dimension and anchor properties via setNow", () => {
    const rect = new TestRectangle({ id: "r1", x: 100, y: 200, width: 60, height: 40 });

    rect.setNow({ width: 120, height: 80, anchorX: 0, anchorY: 0 });
    expect(rect.width).toBe(120);
    expect(rect.height).toBe(80);
    expect(rect.anchorX).toBe(0);
    expect(rect.anchorY).toBe(0);
  });
});
