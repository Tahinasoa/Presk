import { analyzeExpr } from "@/engine/analyze/expr";
import { compileExpr } from "@/engine/compile/exprEval";
import { fitRegionToScene, viewRegion } from "@/model/classes/sceneRoot";
import { parseExpression } from "@/lang/expr/parser";
import { PreskRuntimeError } from "@/lang/diagnostics";
import type { JsonValue } from "@/lang/types";
import type { CustomCompiler, CompileValueContext } from "@/engine/compile/value";
import type { Evaluator } from "@/engine/program";
import type { StateValue } from "@/model/values";
import type { World } from "@/model/world";

interface ScalarExpression {
  evaluate: Evaluator;
  reads: string[];
  constant?: number;
}

type RegionKey = "x" | "y" | "width" | "height";

const regionKeys: readonly RegionKey[] = ["x", "y", "width", "height"];

export function registerSceneViewCompilers(registry: Record<string, CustomCompiler>): void {
  registry["scene.zoom"] = compileZoom;
  registry["scene.view"] = compileView;
  registry["scene.focusOn"] = compileFocusOn;
}

const compileZoom: CustomCompiler = (_spec, raw, ctx) => {
  const zoom = compileScalar(raw, ctx);
  if (!zoom) return null;
  if (zoom.constant !== undefined && zoom.constant <= 0) {
    ctx.d.error("E_VIEW_RANGE", "Scene zoom must be greater than zero", ctx.where);
    return null;
  }

  return {
    reads: zoom.reads,
    value: (world) => {
      const current = world.root;
      const value = evaluateScalar(zoom, world);
      if (!Number.isFinite(value) || value <= 0) {
        throw new PreskRuntimeError("E_VIEW_RANGE");
      }
      return {
        cx: current.getNumber("viewCx"),
        cy: current.getNumber("viewCy"),
        zoom: value,
      };
    },
  };
};

const compileView: CustomCompiler = (_spec, raw, ctx) => {
  if (!isRecord(raw)) {
    ctx.d.error("E_VALUE_TYPE", "Expected a scene view region object", ctx.where);
    return null;
  }

  const fields: Partial<Record<RegionKey, ScalarExpression>> = {};
  let failed = false;
  for (const [key, value] of Object.entries(raw)) {
    if (!regionKeys.includes(key as RegionKey)) {
      ctx.d.error("E_VALUE_TYPE", `Unknown scene view field '${key}'`, ctx.where);
      failed = true;
      continue;
    }
    const field = key as RegionKey;
    const scalar = compileScalar(value, ctx);
    if (!scalar) {
      failed = true;
      continue;
    }
    if ((field === "width" || field === "height")
      && scalar.constant !== undefined && scalar.constant <= 0) {
      ctx.d.error("E_VIEW_RANGE", `Scene view ${field} must be greater than zero`, ctx.where);
      failed = true;
      continue;
    }
    fields[field] = scalar;
  }
  if (failed) return null;

  const reads = uniqueReads(...Object.values(fields).map(({ reads: fieldReads }) => fieldReads));
  return {
    reads,
    value: (world) => {
      const root = world.root;
      const current = viewRegion(root);
      const region = {
        x: fields.x ? evaluateScalar(fields.x, world) : current.x,
        y: fields.y ? evaluateScalar(fields.y, world) : current.y,
        width: fields.width ? evaluateScalar(fields.width, world) : current.width,
        height: fields.height ? evaluateScalar(fields.height, world) : current.height,
      };
      const sceneWidth = root.getNumber("width");
      const sceneHeight = root.getNumber("height");
      if (fields.width && !fields.height) {
        region.height = region.width * sceneHeight / sceneWidth;
        if (!fields.x && !fields.y) {
          region.x = current.x + (current.width - region.width) / 2;
          region.y = current.y + (current.height - region.height) / 2;
        }
      } else if (fields.height && !fields.width) {
        region.width = region.height * sceneWidth / sceneHeight;
        if (!fields.x && !fields.y) {
          region.x = current.x + (current.width - region.width) / 2;
          region.y = current.y + (current.height - region.height) / 2;
        }
      }
      return fitRegionToScene(region, sceneWidth, sceneHeight);
    },
  };
};

const compileFocusOn: CustomCompiler = (_spec, raw, ctx) => {
  const ids = focusIds(raw, ctx);
  if (!ids) return null;

  let failed = false;
  for (const id of ids) {
    if (id === "scene") continue;
    const type = ctx.scope.typeOf(id);
    if (type === undefined) {
      ctx.d.error("E_OBJECT_UNKNOWN", `Unknown focus target '${id}'`, ctx.where);
      failed = true;
      continue;
    }
    const def = ctx.scope.catalog.get(type);
    if (def?.family === "unbounded" || def?.family === "point") {
      ctx.d.error("E_VIEW_FOCUS_UNBOUNDED", `Focus target '${id}' has no bounds`, ctx.where);
      failed = true;
    }
  }
  if (failed) return null;

  const margin = ctx.focusMargin ?? 0;
  return {
    reads: ids,
    value: (world) => {
      let minX = Number.POSITIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      for (const id of ids) {
        const bounds = world.require(id).worldBounds();
        if (bounds === null) {
          throw new PreskRuntimeError("E_VIEW_FOCUS_UNBOUNDED");
        }
        minX = Math.min(minX, bounds.minX);
        minY = Math.min(minY, bounds.minY);
        maxX = Math.max(maxX, bounds.maxX);
        maxY = Math.max(maxY, bounds.maxY);
      }
      const region = {
        x: minX - margin,
        y: minY - margin,
        width: maxX - minX + margin * 2,
        height: maxY - minY + margin * 2,
      };
      return fitRegionToScene(region, world.root.getNumber("width"), world.root.getNumber("height"));
    },
  };
};

function focusIds(raw: JsonValue, ctx: CompileValueContext): string[] | null {
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw) && raw.length > 0 && raw.every((id) => typeof id === "string")) {
    return raw as string[];
  }
  ctx.d.error("E_VALUE_TYPE", "Expected a focus target id or a non-empty list of ids", ctx.where);
  return null;
}

function compileScalar(raw: JsonValue, ctx: CompileValueContext): ScalarExpression | null {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) {
      ctx.d.error("E_VALUE_TYPE", "Expected a finite number or scalar expression", ctx.where);
      return null;
    }
    return { evaluate: () => raw, reads: [], constant: raw };
  }
  if (typeof raw !== "string") {
    ctx.d.error("E_VALUE_TYPE", "Expected a finite number or scalar expression", ctx.where);
    return null;
  }

  const parsed = parseExpression(raw);
  if (!parsed.ok) {
    ctx.d.error("E_EXPR_SYNTAX", parsed.message, ctx.where);
    return null;
  }
  const analyzed = analyzeExpr(parsed.expr, ctx.scope, ctx.d, ctx.where);
  if (!analyzed) return null;
  if (analyzed.type !== "scalar") {
    ctx.d.error("E_EXPR_TYPE_MISMATCH", "Expected scalar expression", ctx.where);
    return null;
  }
  return { evaluate: compileExpr(parsed.expr), reads: analyzed.reads };
}

function evaluateScalar(expression: ScalarExpression, world: World): number {
  const value: StateValue = expression.evaluate(world);
  if (typeof value !== "number") {
    throw new Error("Presk internal: scalar expression did not return a number");
  }
  return value;
}

function isRecord(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
