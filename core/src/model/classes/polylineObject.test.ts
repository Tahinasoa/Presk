import { describe, expect, it } from "vitest";
import type { Pt } from "@/geom/vec";
import { POLYLINE_DEF } from "@/model/classes/polylineObject";
import { createTestEnv } from "@/model/ports";
import type { SceneObject } from "@/model/sceneObject";

const objectEnv = createTestEnv();
const points: Pt[] = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];

function makePolyline(closed = false): SceneObject {
  const polyline = POLYLINE_DEF.create("p", objectEnv);
  polyline.writeProp("points", points);
  polyline.writeProp("closed", closed);
  return polyline;
}

describe("PolylineObject", () => {
  it("builds an open path through the points", () => {
    const polyline = makePolyline();
    const path = POLYLINE_DEF.paths.main.build(polyline);

    expect(path.length).toBe(200);
    expect(path.closed).toBe(false);
    expect(POLYLINE_DEF.paths.main.closed).toBe("state");
    expect(POLYLINE_DEF.paths.main.isClosed(polyline)).toBe(false);
  });

  it("closes the path when closed is true", () => {
    const polyline = makePolyline(true);
    const path = POLYLINE_DEF.paths.main.build(polyline);

    expect(path.length).toBeCloseTo(341.42, 2);
    expect(path.closed).toBe(true);
    expect(POLYLINE_DEF.paths.main.isClosed(polyline)).toBe(true);
  });

  it("computes bounding dimensions from the points", () => {
    const polyline = makePolyline();

    expect(polyline.localBounds()).toEqual({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
  });

  it("defaults to open with a stroke width of two and has no fill property", () => {
    const polyline = POLYLINE_DEF.create("p", objectEnv);

    expect(polyline.readProp("closed")).toBe(false);
    expect(polyline.readProp("stroke")).toBe("#9c9c9c");
    expect(polyline.readProp("strokeWidth")).toBe(2);
    expect(POLYLINE_DEF.props.fill).toBeUndefined();
    expect(POLYLINE_DEF.props.points.minItems).toBe(2);
  });
});
