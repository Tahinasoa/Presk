import { describe, expect, it } from "vitest";
import type { RefSegment } from "@/lang/expr/ast";
import type { Pt } from "@/geom/vec";
import { describeRef, readRef } from "@/model/refs";
import { ARC_DEF } from "@/model/classes/arcObject";
import { createTestEnv } from "@/model/ports";
import type { SceneObject } from "@/model/sceneObject";

const objectEnv = createTestEnv();
const ref = (name: string): RefSegment => ({ name });

function makeArc(): SceneObject {
  const arc = ARC_DEF.create("arc", objectEnv);
  arc.writeProp("x", 100);
  arc.writeProp("y", 100);
  arc.writeProp("radius", 50);
  arc.writeProp("startAngle", 0);
  arc.writeProp("endAngle", 90);
  return arc;
}

describe("ArcObject", () => {
  it("reads start and end anchors in world coordinates", () => {
    const arc = makeArc();

    expect(readRef(arc, [ref("start")])).toEqual({ x: 150, y: 100 });
    const end = readRef(arc, [ref("end")]) as Pt;
    expect(end.x).toBeCloseTo(100, 6);
    expect(end.y).toBeCloseTo(150, 6);
  });

  it("bounds the quarter-circle arc", () => {
    const arc = makeArc();

    expect(readRef(arc, [ref("boundingBox"), ref("width")])).toBe(50);
    expect(readRef(arc, [ref("boundingBox"), ref("height")])).toBe(50);
  });

  it("builds an open path from startAngle through endAngle", () => {
    const path = ARC_DEF.paths.main.build(makeArc());

    expect(path.length).toBeCloseTo(78.54, 1);
    expect(path.closed).toBe(false);
    expect(path.pointAt(0)).toEqual({ x: 50, y: 0 });
    expect(ARC_DEF.paths.main.closed).toBe("never");
  });

  it("keeps start and end read-only", () => {
    const arc = makeArc();

    expect(() => arc.writeProp("start", { x: 0, y: 0 })).toThrow("read-only");
    expect(ARC_DEF.props.start).toMatchObject({ kind: "point", mode: "ro", writes: [] });
    expect(ARC_DEF.props.end).toMatchObject({ kind: "point", mode: "ro", writes: [] });
  });

  it("allows endAngle animation and describes start as a point", () => {
    expect(ARC_DEF.props.endAngle.animatable).toBe(true);
    expect(describeRef(ARC_DEF, [ref("start")])).toEqual({ ok: true, type: "point" });
  });

  it("uses the specified initial radius, angles, and stroke", () => {
    const arc = ARC_DEF.create("arc", objectEnv);

    expect(arc.readProp("radius")).toBe(50);
    expect(arc.readProp("startAngle")).toBe(0);
    expect(arc.readProp("endAngle")).toBe(90);
    expect(arc.readProp("stroke")).toBe(0x9c9c9c);
    expect(arc.readProp("strokeWidth")).toBe(2);
  });
});
