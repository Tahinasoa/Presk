import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { createScope } from "@/engine/analyze/scope";
import { compileProperties } from "@/engine/compile/properties";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { TEXT_DEF } from "@/model/classes/textObject";
import { CURVE_DEF } from "@/model/classes/curveObject";
import { SCENE_DEF } from "@/model/classes/sceneRoot";
import type { ClassDef } from "@/model/values";
import type { PropertiesObject } from "@/lang/types";

const scope = createScope(createDefaultCatalog(), new Map([["a", "rectangle"]]));

function compile(raw: PropertiesObject, mode: "create" | "set" | "animate" | "bind", def: ClassDef = RECTANGLE_DEF) {
  const d = new DiagnosticCollector();
  const entries = compileProperties(raw, mode, def, { scope, d, stepIndex: 2 });
  return { entries, diagnostics: d.items };
}

function codes(result: ReturnType<typeof compile>): string[] {
  return result.diagnostics.filter(({ severity }) => severity === "error").map(({ code }) => code);
}

describe("compileProperties", () => {
  it("classifies properties and effects and applies stable order", () => {
    const result = compile({ x: 10, width: 50, reveal: true }, "create");
    expect(result.entries?.map((entry) => entry.name)).toEqual(["width", "x", "reveal"]);
    expect(result.entries?.map((entry) => entry.kind)).toEqual(["prop", "prop", "effect"]);
    expect(compile({ opacity: 0.5, x: 1 }, "create").entries?.map(({ name }) => name)).toEqual(["x", "opacity"]);
  });

  it("reports unknown, read-only and scene properties", () => {
    expect(codes(compile({ nope: 1 }, "set"))).toEqual(["E_PROPERTY_UNKNOWN"]);
    expect(codes(compile({ width: 5 }, "set", TEXT_DEF))).toEqual(["E_PROPERTY_READONLY"]);
    expect(codes(compile({ x: 1 }, "set", SCENE_DEF))).toEqual(["E_SCENE_PROPERTY"]);
    expect(codes(compile({ zzz: 1 }, "set", SCENE_DEF))).toEqual(["E_SCENE_PROPERTY"]);
  });

  it("compiles writable anchors and rejects equivalent writes", () => {
    expect(compile({ topRight: "a.center" }, "set").entries?.[0]?.name).toBe("topRight");
    expect(codes(compile({ pos: "a.topLeft", x: 3 }, "set"))).toEqual(["E_PROPERTY_DUPLICATE"]);
    expect(codes(compile({ topLeft: "a.center", y: 1 }, "set"))).toEqual(["E_PROPERTY_DUPLICATE"]);
  });

  it("enforces animate and bind rules", () => {
    expect(codes(compile({ pivot: "pos" }, "animate"))).toEqual(["E_PROPERTY_NOT_ANIMATABLE"]);
    expect(compile({ pivot: "topLeft" }, "set").entries?.[0]?.kind).toBe("prop");
    expect(codes(compile({ pivot: "pos" }, "bind"))).toEqual(["E_PROPERTY_NOT_BINDABLE"]);
    expect(codes(compile({ reveal: true }, "bind"))).toEqual(["E_EFFECT_BIND"]);
    expect(compile({ zoom: 2 }, "bind", SCENE_DEF).entries).toHaveLength(1);
  });

  it("validates effect values and preserves false for later resolution", () => {
    expect(codes(compile({ reveal: "zzz" }, "set"))).toEqual(["E_EFFECT_VALUE"]);
    expect(codes(compile({ reveal: 3 }, "set"))).toEqual(["E_EFFECT_VALUE"]);
    const result = compile({ reveal: false }, "set");
    expect(result.entries?.[0]).toMatchObject({ kind: "effect", variant: "", on: false });
  });

  it("requires required properties during create", () => {
    const requiredDef = { ...RECTANGLE_DEF, props: { ...RECTANGLE_DEF.props, points: { ...RECTANGLE_DEF.props.width, required: true } } } satisfies ClassDef;
    const result = compile({}, "create", requiredDef);
    expect(codes(result)).toEqual(["E_FIELD_REQUIRED"]);
    expect(result.diagnostics[0]).toMatchObject({ field: "properties.points", stepIndex: 2 });
  });

  it("supports writable indexed properties and rejects unknown indexed names", () => {
    const indexedDef: ClassDef = {
      ...RECTANGLE_DEF,
      indexed: {
        vertex: {
          count: () => 3,
          get: (_object, index) => ({ x: index, y: index }),
          set: () => undefined,
          writeKey: (index) => `points.${index}`,
        },
      },
    };
    const result = compile({ "vertex[1]": "a.center" }, "set", indexedDef);
    expect(result.entries).toHaveLength(1);
    expect(result.entries?.[0]).toMatchObject({ kind: "prop", spec: { writes: ["points.1"] } });
    expect(codes(compile({ "nope[1]": "a.center" }, "set", indexedDef))).toEqual(["E_PROPERTY_UNKNOWN"]);
    expect(codes(compile({ "vertex[x]": 1 }, "set", indexedDef))).toEqual(["E_PROPERTY_UNKNOWN"]);
  });

  it("rejects indexed properties without a setter", () => {
    const readonlyIndexed: ClassDef = {
      ...RECTANGLE_DEF,
      indexed: { vertex: { count: () => 3, get: () => ({ x: 0, y: 0 }), writeKey: (index) => `points.${index}` } },
    };
    expect(codes(compile({ "vertex[1]": "a.center" }, "set", readonlyIndexed))).toEqual(["E_PROPERTY_READONLY"]);
  });

  describe("curve bezier point count", () => {
    const pts = (count: number) => Array.from({ length: count }, (_, index) => ({ x: index, y: index }));
    const curve = (points: unknown, extra: PropertiesObject = {}): PropertiesObject => ({
      points,
      interpolation: "bezier",
      ...extra,
    } as PropertiesObject);

    it("accepts 3n+1 points for an open bezier and 3n for a closed one", () => {
      expect(codes(compile(curve(pts(4)), "create", CURVE_DEF))).toEqual([]);
      expect(codes(compile(curve(pts(7), { closed: false }), "create", CURVE_DEF))).toEqual([]);
      expect(codes(compile(curve(pts(6), { closed: true }), "create", CURVE_DEF))).toEqual([]);
    });

    it("rejects other point counts with E_VALUE_RANGE on properties.points", () => {
      const open = compile(curve(pts(5)), "create", CURVE_DEF);
      expect(codes(open)).toEqual(["E_VALUE_RANGE"]);
      expect(open.diagnostics.find(({ code }) => code === "E_VALUE_RANGE")?.field).toBe("properties.points");
      expect(codes(compile(curve(pts(5), { closed: true }), "create", CURVE_DEF))).toEqual(["E_VALUE_RANGE"]);
    });

    it("does not constrain the count of a spline", () => {
      expect(codes(compile({ points: pts(5) } as PropertiesObject, "create", CURVE_DEF))).toEqual([]);
      expect(codes(compile({ points: pts(5), interpolation: "spline" } as PropertiesObject, "create", CURVE_DEF))).toEqual([]);
    });
  });
});
