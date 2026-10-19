import { describe, expect, it } from "vitest";
import { compileExpr } from "@/engine/compile/exprEval";
import { parseExpression } from "@/lang/expr/parser";
import { PreskRuntimeError } from "@/lang/diagnostics";
import { createTestEnv } from "@/model/ports";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { createSceneRoot } from "@/model/classes/sceneRoot";
import { World } from "@/model/world";
import type { Expr } from "@/lang/expr/ast";

function p(source: string): Expr {
  const result = parseExpression(source);
  if (!result.ok) throw new Error(result.message);
  return result.expr;
}

function createWorld(): World {
  const env = createTestEnv();
  const world = new World(createSceneRoot(800, 600, env));
  const a = RECTANGLE_DEF.create("a", env);
  a.setState("x", 10);
  a.setState("y", 20);
  a.setState("width", 100);
  a.setState("height", 50);
  world.add(a);
  const b = RECTANGLE_DEF.create("b", env);
  b.setState("x", 4);
  b.setState("y", 0);
  world.add(b);
  return world;
}

describe("compileExpr", () => {
  const world = createWorld();

  it.each([
    ["20", 20],
    ["1 + 2 * 3", 7],
    ["8 / 2 / 2", 2],
    ["-a.width", -100],
    ["a.topRight.x + 20", 130],
    ["scene.width / 2", 400],
    ["a.boundingBox.center.y - 100", -55],
  ] as const)("evaluates %s", (source, expected) => {
    expect(compileExpr(p(source))(world)).toBe(expected);
  });

  it("returns point references", () => {
    expect(compileExpr(p("a.bottomLeft"))(world)).toEqual({ x: 10, y: 70 });
  });

  it("throws a runtime error when division is non-finite", () => {
    expect(() => compileExpr(p("a.width / b.y"))(world)).toThrow(PreskRuntimeError);
    expect(() => compileExpr(p("a.width / b.y"))(world)).toThrow("division by zero");
  });

  it("reads current world state each time the closure is called", () => {
    const evaluate = compileExpr(p("a.width"));
    expect(evaluate(world)).toBe(100);
    world.require("a").setState("width", 250);
    expect(evaluate(world)).toBe(250);
  });

  it("rejects path functions until path evaluation is implemented", () => {
    expect(() => compileExpr(p("a.pathX(main, 0)"))(world)).toThrow("Presk internal: pathFn not supported yet");
  });
});
