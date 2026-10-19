import { describe, expect, it } from "vitest";
import { createTestEnv } from "@/model/ports";
import { RectangleObject, RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { PreskRuntimeError } from "@/lang/diagnostics";
import type { RefSegment } from "@/lang/expr/ast";
import { describeRef, readRef } from "@/model/refs";
import type { ClassDef } from "@/model/values";

const ref = (name: string, index?: number): RefSegment => index === undefined ? { name } : { name, index };
const path = (...segments: RefSegment[]): RefSegment[] => segments;

function rectangle(initial: Record<string, number | string> = {}): RectangleObject {
  const object = RECTANGLE_DEF.create("rect", createTestEnv()) as RectangleObject;
  for (const [key, value] of Object.entries(initial)) object.setState(key, value);
  return object;
}

function expectError(pathValue: RefSegment[], code: string): void {
  const result = describeRef(RECTANGLE_DEF, pathValue);
  expect(result).toMatchObject({ ok: false, code });
}

describe("describeRef", () => {
  it("describes scalar and point properties and their coordinates", () => {
    expect(describeRef(RECTANGLE_DEF, path(ref("width")))).toEqual({ ok: true, type: "scalar" });
    expect(describeRef(RECTANGLE_DEF, path(ref("topRight")))).toEqual({ ok: true, type: "point" });
    expect(describeRef(RECTANGLE_DEF, path(ref("topRight"), ref("x")))).toEqual({ ok: true, type: "scalar" });
    expect(describeRef(RECTANGLE_DEF, path(ref("pos")))).toEqual({ ok: true, type: "point" });
    expect(describeRef(RECTANGLE_DEF, path(ref("pos"), ref("y")))).toEqual({ ok: true, type: "scalar" });
  });

  it("describes bounding box anchors and dimensions", () => {
    expect(describeRef(RECTANGLE_DEF, path(ref("boundingBox"), ref("center")))).toEqual({ ok: true, type: "point" });
    expect(describeRef(RECTANGLE_DEF, path(ref("boundingBox"), ref("center"), ref("y")))).toEqual({ ok: true, type: "scalar" });
    expect(describeRef(RECTANGLE_DEF, path(ref("boundingBox"), ref("width")))).toEqual({ ok: true, type: "scalar" });
    expectError(path(ref("boundingBox")), "E_EXPR_BOUNDINGBOX_ALONE");
  });

  it("rejects unsupported properties and path segments", () => {
    expectError(path(ref("left")), "E_EXPR_SEGMENT_UNKNOWN");
    expectError(path(ref("top")), "E_EXPR_SEGMENT_UNKNOWN");
    expectError(path(ref("fill")), "E_EXPR_SEGMENT_UNKNOWN");
    expectError(path(ref("pivot")), "E_EXPR_SEGMENT_UNKNOWN");
    expectError(path(ref("topRight"), ref("z")), "E_EXPR_SEGMENT_UNKNOWN");
    expectError(path(ref("width"), ref("x")), "E_EXPR_SEGMENT_UNKNOWN");
    expectError(path(ref("boundingBox"), ref("foo")), "E_EXPR_SEGMENT_UNKNOWN");
  });

  it("rejects bounding boxes for point and unbounded families", () => {
    const pointDef = { ...RECTANGLE_DEF, family: "point" } satisfies ClassDef;
    const unboundedDef = { ...RECTANGLE_DEF, family: "unbounded" } satisfies ClassDef;
    expect(describeRef(pointDef, path(ref("boundingBox"), ref("center")))).toMatchObject({
      ok: false,
      code: "E_EXPR_INFINITE_REF",
    });
    expect(describeRef(unboundedDef, path(ref("boundingBox"), ref("center")))).toMatchObject({
      ok: false,
      code: "E_EXPR_INFINITE_REF",
    });
  });

  it("checks extension references before ordinary properties", () => {
    const extendedDef: ClassDef = {
      ...RECTANGLE_DEF,
      refExtension: {
        describe: (segments) => segments[0]?.name === "special" ? { ok: true, type: "scalar" } : undefined,
        read: () => 42,
      },
    };
    expect(describeRef(extendedDef, path(ref("special")))).toEqual({ ok: true, type: "scalar" });
  });
});

describe("readRef", () => {
  it("reads property values, anchors and bounding box values", () => {
    const object = rectangle({ x: 10, y: 20, width: 100, height: 50 });
    expect(readRef(object, path(ref("width")))).toBe(100);
    expect(readRef(object, path(ref("topRight"), ref("x")))).toBe(110);
    expect(readRef(object, path(ref("bottomLeft")))).toEqual({ x: 10, y: 70 });
    expect(readRef(object, path(ref("boundingBox"), ref("center"), ref("y")))).toBe(45);
  });

  it("reads transformed world bounds", () => {
    const object = rectangle({ x: 10, y: 20, width: 100, height: 50, rotation: 90 });
    expect(readRef(object, path(ref("boundingBox"), ref("width")))).toBeCloseTo(50, 6);
    expect(readRef(object, path(ref("boundingBox"), ref("height")))).toBeCloseTo(100, 6);
  });

  it("reads special extension references", () => {
    const object = rectangle();
    const originalDef = object.def;
    const extendedDef: ClassDef = {
      ...originalDef,
      refExtension: {
        describe: (segments) => segments[0]?.name === "special" ? { ok: true, type: "scalar" } : undefined,
        read: () => 42,
      },
    };
    const extendedObject = new RectangleObject("extended", extendedDef, createTestEnv());
    expect(readRef(extendedObject, path(ref("special")))).toBe(42);
  });

  it("throws PreskRuntimeError for an out of range indexed anchor", () => {
    const indexedDef: ClassDef = {
      ...RECTANGLE_DEF,
      indexed: {
        vertex: {
          count: () => 3,
          get: (_object, index) => ({ x: index, y: index }),
          writeKey: (index) => `points.${index}`,
        },
      },
    };
    const object = new RectangleObject("indexed", indexedDef, createTestEnv());
    expect(() => readRef(object, path(ref("vertex", 5)))).toThrow(PreskRuntimeError);
    expect(() => readRef(object, path(ref("vertex", 5)))).toThrow("E_ANCHOR_INDEX");
  });
});
