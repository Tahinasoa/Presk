import { PreskRuntimeError } from "@/lang/diagnostics";
import type { Expr } from "@/lang/expr/ast";
import { readRef } from "@/model/refs";
import type { Pt } from "@/geom/vec";
import type { World } from "@/model/world";

export function compileExpr(expr: Expr): (world: World) => number | Pt {
  switch (expr.kind) {
    case "num":
      return () => expr.value;
    case "neg": {
      const operand = compileExpr(expr.operand);
      return (world) => {
        const value = operand(world);
        if (typeof value !== "number") throw new Error("Presk internal: negated expression is not scalar");
        return -value;
      };
    }
    case "bin": {
      const left = compileExpr(expr.left);
      const right = compileExpr(expr.right);
      return (world) => {
        const leftValue = left(world);
        const rightValue = right(world);
        if (typeof leftValue !== "number" || typeof rightValue !== "number") {
          throw new Error("Presk internal: arithmetic expression is not scalar");
        }
        switch (expr.op) {
          case "+": return leftValue + rightValue;
          case "-": return leftValue - rightValue;
          case "*": return leftValue * rightValue;
          case "/": {
            const result = leftValue / rightValue;
            if (!Number.isFinite(result)) throw new PreskRuntimeError("division by zero");
            return result;
          }
        }
      };
    }
    case "ref":
      return (world) => readRef(world.require(expr.object), expr.path);
    case "pathFn":
      throw new Error("Presk internal: pathFn not supported yet");
  }
}
