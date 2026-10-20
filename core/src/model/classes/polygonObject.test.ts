import { describe, expect, it } from "vitest";
import type { RefSegment } from "@/lang/expr/ast";
import { PreskRuntimeError } from "@/lang/diagnostics";
import type { Pt } from "@/geom/vec";
import { describeRef, readRef } from "@/model/refs";
import { POLYGON_DEF, TRIANGLE_DEF } from "@/model/classes/polygonObject";
import { createTestEnv } from "@/model/ports";
import type { SceneObject } from "@/model/sceneObject";

const objectEnv = createTestEnv();
const ref = (name: string, index?: number): RefSegment => ({ name, ...(index === undefined ? {} : { index }) });
const square: Pt[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

function makePolygon(points: readonly Pt[] = square): SceneObject {
  const polygon = POLYGON_DEF.create("poly", objectEnv);
  polygon.writeProp("points", points);
  polygon.writeProp("x", 10);
  polygon.writeProp("y", 20);
  return polygon;
}

describe("PolygonObject", () => {
  it("has empty geometry and default styles before points are set", () => {
    const polygon = POLYGON_DEF.create("poly", objectEnv);

    expect(polygon.localBounds()).toBeNull();
    expect(polygon.readProp("points")).toEqual([]);
    expect(polygon.readProp("fill")).toBe(0x9c9c9c);
    expect(polygon.readProp("stroke")).toBe(0xffffff);
    expect(polygon.readProp("strokeWidth")).toBe(0);
    expect(polygon.getNumber("drawProgress")).toBe(1);
  });

  it("copies point lists when reading and writing", () => {
    const polygon = POLYGON_DEF.create("poly", objectEnv);
    const input = square.map((point) => ({ ...point }));
    polygon.writeProp("points", input);
    input[0].x = 50;

    const returned = polygon.readProp("points") as Pt[];
    expect(returned[0]).toEqual({ x: 0, y: 0 });
    returned[1].x = 50;
    expect(polygon.readProp("points")).toEqual(square);
  });

  it("describes bounded dimensions and reads indexed vertices in world coordinates", () => {
    const polygon = makePolygon();

    expect(readRef(polygon, [ref("boundingBox"), ref("topLeft")])).toEqual({ x: 10, y: 20 });
    expect(readRef(polygon, [ref("boundingBox"), ref("width")])).toBe(100);
    expect(readRef(polygon, [ref("vertex", 2)])).toEqual({ x: 110, y: 120 });
    expect(readRef(polygon, [ref("vertex", 2), ref("x")])).toBe(110);
  });

  it("writes an indexed vertex from world coordinates", () => {
    const polygon = makePolygon();
    const setVertex = POLYGON_DEF.indexed.vertex.set;
    if (!setVertex) throw new Error("Expected vertex setter");
    setVertex(polygon, 2, { x: 200, y: 200 });

    expect((polygon.getState("points") as readonly Pt[])[2]).toEqual({ x: 190, y: 180 });
  });

  it("throws E_ANCHOR_INDEX when reading a vertex outside the polygon", () => {
    const polygon = makePolygon();

    expect(() => readRef(polygon, [ref("vertex", 9)])).toThrow(PreskRuntimeError);
    expect(() => readRef(polygon, [ref("vertex", 9)])).toThrow("E_ANCHOR_INDEX");
  });

  it("builds a closed path through its points", () => {
    const polygon = makePolygon();
    const path = POLYGON_DEF.paths.main;

    expect(path.build(polygon).length).toBe(400);
    expect(path.isClosed(polygon)).toBe(true);
  });

  it("defines required polygon points and bounded triangle vertex counts", () => {
    expect(POLYGON_DEF.props.points).toMatchObject({
      kind: "pointList",
      writes: ["points"],
      mode: "init",
      animatable: false,
      order: 0,
      required: true,
      minItems: 3,
    });
    expect(TRIANGLE_DEF.props.points.minItems).toBe(3);
    expect(TRIANGLE_DEF.props.points.maxItems).toBe(3);
    expect(POLYGON_DEF.indexed.vertex.writeKey(1)).toBe("points.1");
    expect(POLYGON_DEF.effects.reveal.variants).toEqual(["default", "draw"]);
    expect(describeRef(POLYGON_DEF, [ref("boundingBox"), ref("center")]))
      .toEqual({ ok: true, type: "point" });
  });
});
