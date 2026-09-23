import { describe, it, expect } from "vitest";
import KAbstractRectangle from "./kabstractRectangle";

class TestRectangle extends KAbstractRectangle {}

describe("KAbstractRectangle", () => {
  it("computes center and scalar anchors correctly with default anchor (0.5, 0.5)", () => {
    const rect = new TestRectangle({ id: "r1", x: 100, y: 200, width: 60, height: 40 });

    expect(rect.center).toEqual({ x: 100, y: 200 });
    expect(rect.left).toBe(70);   // 100 - 30
    expect(rect.right).toBe(130);  // 100 + 30
    expect(rect.top).toBe(180);    // 200 - 20
    expect(rect.bottom).toBe(220); // 200 + 20
  });

  it("computes point anchors correctly", () => {
    const rect = new TestRectangle({ id: "r1", x: 100, y: 200, width: 60, height: 40, anchorX: 0, anchorY: 0 });

    expect(rect.topLeft).toEqual({ x: 100, y: 200 });
    expect(rect.topCenter).toEqual({ x: 130, y: 200 });
    expect(rect.leftCenter).toEqual({ x: 100, y: 220 });
    expect(rect.rightCenter).toEqual({ x: 160, y: 220 });
    expect(rect.bottomCenter).toEqual({ x: 130, y: 240 });
  });
});
