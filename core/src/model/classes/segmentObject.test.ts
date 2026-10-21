import { describe, expect, it } from "vitest";
import type { RefSegment } from "@/lang/expr/ast";
import { describeRef, readRef } from "@/model/refs";
import { ARROW_DEF, normalizeSegmentOrigin, SEGMENT_DEF } from "@/model/classes/segmentObject";
import { createTestEnv } from "@/model/ports";
import type { SceneObject } from "@/model/sceneObject";

const objectEnv = createTestEnv();
const ref = (name: string): RefSegment => ({ name });

function makeSegment(
  start = { x: 10, y: 20 },
  end = { x: 110, y: 20 },
  rotation = 0,
): SceneObject {
  const segment = SEGMENT_DEF.create("seg", objectEnv);
  segment.writeProp("start", start);
  segment.writeProp("end", end);
  normalizeSegmentOrigin(segment);
  segment.writeProp("rotation", rotation);
  return segment;
}

describe("SegmentObject", () => {
  it("normalizes the start to pos and keeps the end relative to it", () => {
    const segment = makeSegment();

    expect(segment.readProp("x")).toBe(10);
    expect(segment.readProp("y")).toBe(20);
    expect(segment.readProp("pos")).toEqual({ x: 10, y: 20 });
    expect(readRef(segment, [ref("start")])).toEqual({ x: 10, y: 20 });
    expect(readRef(segment, [ref("end")])).toEqual({ x: 110, y: 20 });
  });

  it("reports its bounding-box dimensions", () => {
    const segment = makeSegment();

    expect(readRef(segment, [ref("boundingBox"), ref("width")])).toBe(100);
    expect(readRef(segment, [ref("boundingBox"), ref("height")])).toBe(0);
  });

  it("moves both endpoints when pos is written", () => {
    const segment = makeSegment();
    segment.writeProp("pos", { x: 0, y: 0 });

    expect(readRef(segment, [ref("start")])).toEqual({ x: 0, y: 0 });
    expect(readRef(segment, [ref("end")])).toEqual({ x: 100, y: 0 });
  });

  it("writes the end independently of the start", () => {
    const segment = makeSegment();
    segment.writeProp("end", { x: 50, y: 50 });

    expect(readRef(segment, [ref("start")])).toEqual({ x: 10, y: 20 });
    expect(readRef(segment, [ref("end")])).toEqual({ x: 50, y: 50 });
  });

  it("rotates around the center pivot", () => {
    const segment = makeSegment({ x: 0, y: 0 }, { x: 100, y: 0 }, 90);

    expect(readRef(segment, [ref("start"), ref("x")])).toBeCloseTo(50, 6);
    expect(readRef(segment, [ref("start"), ref("y")])).toBeCloseTo(-50, 6);
    expect(readRef(segment, [ref("end"), ref("x")])).toBeCloseTo(50, 6);
    expect(readRef(segment, [ref("end"), ref("y")])).toBeCloseTo(50, 6);
  });

  it("defines independent endpoint writes and an open main path", () => {
    const segment = makeSegment();
    const path = SEGMENT_DEF.paths.main;

    expect(segment.getNumber("drawProgress")).toBe(1);
    expect(segment.readProp("stroke")).toBe(0x9c9c9c);
    expect(segment.readProp("strokeWidth")).toBe(2);
    expect(SEGMENT_DEF.props.pivot.values).toEqual(["center", "pos"]);
    expect(SEGMENT_DEF.props.start).toMatchObject({
      kind: "point",
      mode: "rw",
      animatable: true,
      order: 0,
    });
    expect(SEGMENT_DEF.props.end).toMatchObject({
      kind: "point",
      mode: "rw",
      animatable: true,
      order: 0,
    });
    expect(SEGMENT_DEF.props.start.writes).toEqual(["p0"]);
    expect(SEGMENT_DEF.props.end.writes).toEqual(["p1"]);
    expect(SEGMENT_DEF.props.pos.writes).toEqual(["x", "y"]);
    expect(SEGMENT_DEF.effects.reveal.variants).toEqual(["default", "draw"]);
    expect(path.build(segment).length).toBe(100);
    expect(path.isClosed(segment)).toBe(false);
  });

  it("defines arrow heads with the end head as the default", () => {
    const arrow = ARROW_DEF.create("arrow", objectEnv);

    expect(ARROW_DEF.props.head.values).toEqual(["end", "start", "both", "none"]);
    expect(ARROW_DEF.props.head.mode).toBe("init");
    expect(ARROW_DEF.props.head.animatable).toBe(false);
    expect(arrow.readProp("head")).toBe("end");
    expect(arrow.getNumber("drawProgress")).toBe(1);
  });

  it("describes bounded center references as points and coordinates as scalars", () => {
    expect(describeRef(SEGMENT_DEF, [ref("boundingBox"), ref("center")]))
      .toEqual({ ok: true, type: "point" });
    expect(describeRef(SEGMENT_DEF, [ref("boundingBox"), ref("center"), ref("x")]))
      .toEqual({ ok: true, type: "scalar" });
  });
});
