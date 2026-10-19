import { describe, expect, it } from "vitest";
import { anchorOfBounds, ANCHOR_NAMES, boundsOfPoints, boundsHeight, boundsWidth, isAnchorName, transformBounds, unionBounds } from "@/geom/bounds";
import { trsPivot } from "@/geom/matrix";
import type { Bounds } from "@/geom/bounds";

describe("bounds helpers", () => {
  it("returns null for no points and encloses a point set", () => {
    expect(boundsOfPoints([])).toBeNull();
    expect(boundsOfPoints([{ x: 1, y: 5 }, { x: -2, y: 3 }, { x: 4, y: 0 }])).toEqual({
      minX: -2,
      minY: 0,
      maxX: 4,
      maxY: 5,
    });
  });

  it("unions nullable bounds", () => {
    const a: Bounds = { minX: 0, minY: 0, maxX: 1, maxY: 1 };
    const b: Bounds = { minX: 2, minY: 2, maxX: 3, maxY: 3 };
    expect(unionBounds(null, b)).toEqual(b);
    expect(unionBounds(a, null)).toEqual(a);
    expect(unionBounds(null, null)).toBeNull();
    expect(unionBounds(a, b)).toEqual({ minX: 0, minY: 0, maxX: 3, maxY: 3 });
  });

  it("transforms all four corners into an axis aligned bound", () => {
    const result = transformBounds(
      { minX: 0, minY: 0, maxX: 100, maxY: 50 },
      trsPivot({ x: 0, y: 0 }, { x: 50, y: 25 }, 90, 1),
    );
    expect(boundsWidth(result)).toBeCloseTo(50, 6);
    expect(boundsHeight(result)).toBeCloseTo(100, 6);
    expect((result.minX + result.maxX) / 2).toBeCloseTo(50, 6);
    expect((result.minY + result.maxY) / 2).toBeCloseTo(25, 6);
  });

  it("returns named anchors in contract order", () => {
    const bounds: Bounds = { minX: 0, minY: 0, maxX: 100, maxY: 50 };
    expect(ANCHOR_NAMES).toEqual([
      "topLeft", "topCenter", "topRight", "centerLeft", "center", "centerRight", "bottomLeft", "bottomCenter", "bottomRight",
    ]);
    expect(anchorOfBounds(bounds, "topLeft")).toEqual({ x: 0, y: 0 });
    expect(anchorOfBounds(bounds, "center")).toEqual({ x: 50, y: 25 });
    expect(anchorOfBounds(bounds, "bottomRight")).toEqual({ x: 100, y: 50 });
    expect(anchorOfBounds(bounds, "centerRight")).toEqual({ x: 100, y: 25 });
    expect(anchorOfBounds(bounds, "topCenter")).toEqual({ x: 50, y: 0 });
  });

  it("checks anchor names", () => {
    expect(isAnchorName("center")).toBe(true);
    expect(isAnchorName("left")).toBe(false);
  });
});
