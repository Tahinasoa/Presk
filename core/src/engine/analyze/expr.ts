import type { DiagnosticCollector, DiagnosticWhere } from "@/lang/diagnostics";
import type { Expr } from "@/lang/expr/ast";
import { describeRef } from "@/model/refs";
import type { AnalyzeScope, Analyzed } from "@/engine/analyze/scope";

export function analyzeExpr(
  expr: Expr,
  scope: AnalyzeScope,
  d: DiagnosticCollector,
  where: DiagnosticWhere,
): Analyzed | null {
  switch (expr.kind) {
    case "num":
      return { type: "scalar", reads: [] };
    case "neg": {
      const operand = analyzeExpr(expr.operand, scope, d, where);
      if (!operand) return null;
      if (operand.type !== "scalar") {
        d.error("E_EXPR_POINT_IN_ARITHMETIC", "Points cannot be used in arithmetic", where);
        return null;
      }
      return { type: "scalar", reads: operand.reads };
    }
    case "bin": {
      const left = analyzeExpr(expr.left, scope, d, where);
      const right = analyzeExpr(expr.right, scope, d, where);
      if (!left || !right) return null;
      if (left.type !== "scalar" || right.type !== "scalar") {
        d.error("E_EXPR_POINT_IN_ARITHMETIC", "Points cannot be used in arithmetic", where);
        return null;
      }
      return { type: "scalar", reads: uniqueReads(left.reads, right.reads) };
    }
    case "ref": {
      const objectType = scope.typeOf(expr.object);
      if (objectType === undefined) {
        const code = scope.isForward?.(expr.object) ? "E_FORWARD_REFERENCE" : "E_OBJECT_UNKNOWN";
        d.error(code, code === "E_FORWARD_REFERENCE" ? `Object '${expr.object}' is created later` : `Unknown object '${expr.object}'`, where);
        return null;
      }

      const def = scope.catalog.get(objectType);
      if (!def) {
        d.error("E_OBJECT_UNKNOWN", `Unknown object type '${objectType}'`, where);
        return null;
      }
      if (def.effects[expr.path[0]?.name]) {
        d.error("E_EFFECT_IN_EXPRESSION", `Effect '${expr.path[0].name}' cannot be read in an expression`, where);
        return null;
      }

      const description = describeRef(def, expr.path);
      if (!description.ok) {
        d.error(description.code, description.message, where);
        return null;
      }
      return { type: description.type, reads: [expr.object] };
    }
    case "pathFn": {
      const objectType = scope.typeOf(expr.object);
      if (objectType === undefined) {
        const code = scope.isForward?.(expr.object) ? "E_FORWARD_REFERENCE" : "E_OBJECT_UNKNOWN";
        d.error(code, code === "E_FORWARD_REFERENCE" ? `Object '${expr.object}' is created later` : `Unknown object '${expr.object}'`, where);
        return null;
      }

      const def = scope.catalog.get(objectType);
      if (!def) {
        d.error("E_OBJECT_UNKNOWN", `Unknown object type '${objectType}'`, where);
        return null;
      }

      const path = def.paths[expr.pathName];
      if (!path) {
        d.error("E_EXPR_PATH", `Unknown path '${expr.pathName}' on '${expr.object}'`, where);
        return null;
      }
      if (path.closed === "never" && (expr.t < 0 || expr.t > 1)) {
        d.error("E_EXPR_PATH", `Parameter t is outside the open path '${expr.pathName}'`, where);
        return null;
      }
      return { type: "scalar", reads: [expr.object] };
    }
  }
}

function uniqueReads(...lists: readonly string[][]): string[] {
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
