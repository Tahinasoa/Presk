import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { parseExpression } from "@/lang/expr/parser";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createScope } from "@/engine/analyze/scope";
import { analyzeExpr } from "@/engine/analyze/expr";
import type { Expr } from "@/lang/expr/ast";

const catalog = createDefaultCatalog();
const objectTypes = new Map([["a", "rectangle"], ["t", "text"]]);

function p(source: string): Expr {
  const result = parseExpression(source);
  if (!result.ok) throw new Error(result.message);
  return result.expr;
}

function analyze(source: string, forward?: ReadonlySet<string>) {
  const diagnostics = new DiagnosticCollector();
  const result = analyzeExpr(p(source), createScope(catalog, objectTypes, forward), diagnostics, { field: "properties.x" });
  return { result, diagnostics };
}

describe("analyzeExpr", () => {
  it.each([
    ["20", "scalar", []],
    ["a.width / 2", "scalar", ["a"]],
    ["a.topRight", "point", ["a"]],
    ["a.topRight.x + t.width", "scalar", ["a", "t"]],
    ["scene.center.y", "scalar", ["scene"]],
  ] as const)("analyzes %s", (source, type, reads) => {
    const { result, diagnostics } = analyze(source);
    expect(result).toEqual({ type, reads });
    expect(diagnostics.items).toEqual([]);
  });

  it.each(["a.topRight + 1", "-a.center", "a.center * 2"])("rejects point arithmetic in %s", (source) => {
    const { result, diagnostics } = analyze(source);
    expect(result).toBeNull();
    expect(diagnostics.errors.map(({ code }) => code)).toEqual(["E_EXPR_POINT_IN_ARITHMETIC"]);
  });

  it.each([
    ["a.boundingBox", "E_EXPR_BOUNDINGBOX_ALONE"],
    ["a.left", "E_EXPR_SEGMENT_UNKNOWN"],
    ["zzz.x", "E_OBJECT_UNKNOWN"],
    ["a.reveal", "E_EFFECT_IN_EXPRESSION"],
    ["a.pathX(main, 0)", "E_EXPR_PATH"],
  ] as const)("reports %s as %s", (source, code) => {
    const { result, diagnostics } = analyze(source);
    expect(result).toBeNull();
    expect(diagnostics.errors.map(({ code: actual }) => actual)).toEqual([code]);
    expect(diagnostics.errors[0]).toMatchObject({ field: "properties.x" });
  });

  it("distinguishes forward references from unknown objects", () => {
    const { result, diagnostics } = analyze("zzz.x", new Set(["zzz"]));
    expect(result).toBeNull();
    expect(diagnostics.errors.map(({ code }) => code)).toEqual(["E_FORWARD_REFERENCE"]);
  });

  it("returns object reads once in first occurrence order", () => {
    const { result } = analyze("a.width + t.width + a.height");
    expect(result?.reads).toEqual(["a", "t"]);
  });
});
