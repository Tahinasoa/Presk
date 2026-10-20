import { parseColor } from "@/geom/color";
import type { DiagnosticCollector, DiagnosticWhere } from "@/lang/diagnostics";
import type { JsonValue } from "@/lang/types";
import { parseExpression } from "@/lang/expr/parser";
import { analyzeExpr } from "@/engine/analyze/expr";
import type { AnalyzeScope } from "@/engine/analyze/scope";
import { compileExpr } from "@/engine/compile/exprEval";
import { registerSceneViewCompilers } from "@/engine/compile/sceneView";
import type { Evaluator } from "@/engine/program";
import type { PropSpec, StateValue } from "@/model/values";
import type { World } from "@/model/world";

export interface CompileValueContext {
  scope: AnalyzeScope;
  d: DiagnosticCollector;
  where: DiagnosticWhere;
  focusMargin?: number;
}

export type CustomCompiler = (
  spec: PropSpec,
  raw: JsonValue,
  ctx: CompileValueContext,
) => { value: Evaluator; reads: string[] } | null;

export const CUSTOM_COMPILERS: Record<string, CustomCompiler> = {};
registerSceneViewCompilers(CUSTOM_COMPILERS);

export function compileValue(
  spec: PropSpec,
  raw: JsonValue,
  ctx: CompileValueContext,
): { value: Evaluator; reads: string[] } | null {
  if (spec.customKind !== undefined) {
    const compiler = CUSTOM_COMPILERS[spec.customKind];
    if (compiler) return compiler(spec, raw, ctx);
    ctx.d.error("E_VALUE_TYPE", "custom compiler not registered", ctx.where);
    return null;
  }

  switch (spec.kind) {
    case "number":
      if (typeof raw === "number" && Number.isFinite(raw)) {
        if (isOutOfRange(raw, spec)) {
          ctx.d.error("E_VALUE_RANGE", "Number is outside the allowed range", ctx.where);
          return null;
        }
        return { value: constant(raw), reads: [] };
      }
      if (typeof raw === "string") return compileExpression(raw, "scalar", ctx);
      ctx.d.error("E_VALUE_TYPE", "Expected a finite number or numeric expression", ctx.where);
      return null;
    case "point":
      if (typeof raw === "string") return compileExpression(raw, "point", ctx);
      if (isRecord(raw) && exactKeys(raw, ["x", "y"])) {
        const x = compilePointComponent(raw.x, ctx);
        const y = compilePointComponent(raw.y, ctx);
        if (!x || !y) return null;
        return {
          value: (world) => {
            const xValue = x.value(world);
            const yValue = y.value(world);
            if (typeof xValue !== "number" || typeof yValue !== "number") {
              throw new Error("Presk internal: point component expression is not scalar");
            }
            return { x: xValue, y: yValue };
          },
          reads: uniqueReads(x.reads, y.reads),
        };
      }
      ctx.d.error("E_VALUE_TYPE", "Expected a point expression or an object with exactly x and y", ctx.where);
      return null;
    case "color": {
      const color = parseColor(raw);
      if (color === null) {
        ctx.d.error("E_COLOR_INVALID", "Invalid color", ctx.where);
        return null;
      }
      return { value: constant(color), reads: [] };
    }
    case "string":
      if (typeof raw === "string") return { value: constant(raw), reads: [] };
      ctx.d.error("E_VALUE_TYPE", "Expected a string", ctx.where);
      return null;
    case "boolean":
      if (typeof raw === "boolean") return { value: constant(raw), reads: [] };
      ctx.d.error("E_VALUE_TYPE", "Expected a boolean", ctx.where);
      return null;
    case "enum":
      if (typeof raw !== "string") {
        ctx.d.error("E_VALUE_TYPE", "Expected an enum string", ctx.where);
        return null;
      }
      if (!spec.values?.includes(raw)) {
        ctx.d.error("E_VALUE_RANGE", `Value '${raw}' is not allowed`, ctx.where);
        return null;
      }
      return { value: constant(raw), reads: [] };
    case "pointList": {
      if (!Array.isArray(raw) || !raw.every(isPointLiteral)) {
        ctx.d.error("E_VALUE_TYPE", "Expected a list of finite numeric points", ctx.where);
        return null;
      }
      if ((spec.minItems !== undefined && raw.length < spec.minItems)
        || (spec.maxItems !== undefined && raw.length > spec.maxItems)) {
        ctx.d.error("E_VALUE_RANGE", "Point list length is outside the allowed range", ctx.where);
        return null;
      }
      const copy = raw.map(({ x, y }) => ({ x, y }));
      return { value: constant(copy), reads: [] };
    }
    case "objectRef":
    case "objectRefList":
    case "region":
    case "view":
      ctx.d.error("E_VALUE_TYPE", "not supported yet", ctx.where);
      return null;
  }
}

function compileExpression(
  source: string,
  expected: "scalar" | "point",
  ctx: CompileValueContext,
): { value: Evaluator; reads: string[] } | null {
  const parsed = parseExpression(source);
  if (!parsed.ok) {
    ctx.d.error("E_EXPR_SYNTAX", parsed.message, ctx.where);
    return null;
  }
  const analyzed = analyzeExpr(parsed.expr, ctx.scope, ctx.d, ctx.where);
  if (!analyzed) return null;
  if (analyzed.type !== expected) {
    ctx.d.error("E_EXPR_TYPE_MISMATCH", `Expected ${expected} expression`, ctx.where);
    return null;
  }
  return { value: compileExpr(parsed.expr), reads: analyzed.reads };
}

function compilePointComponent(raw: JsonValue, ctx: CompileValueContext): { value: Evaluator; reads: string[] } | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return { value: constant(raw), reads: [] };
  if (typeof raw === "string") return compileExpression(raw, "scalar", ctx);
  ctx.d.error("E_VALUE_TYPE", "Point components must be finite numbers or scalar expressions", ctx.where);
  return null;
}

function isOutOfRange(value: number, spec: PropSpec): boolean {
  return (spec.min !== undefined && (spec.minExclusive ? value <= spec.min : value < spec.min))
    || (spec.max !== undefined && value > spec.max);
}

function isRecord(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, JsonValue>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index]);
}

function isPointLiteral(value: JsonValue): value is { x: number; y: number } {
  return isRecord(value)
    && exactKeys(value, ["x", "y"])
    && typeof value.x === "number" && Number.isFinite(value.x)
    && typeof value.y === "number" && Number.isFinite(value.y);
}

function constant(value: StateValue): Evaluator {
  return (_world: World) => value;
}

function uniqueReads(...lists: string[][]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    for (const id of list) {
      if (!seen.has(id)) {
        seen.add(id);
        result.push(id);
      }
    }
  }
  return result;
}
