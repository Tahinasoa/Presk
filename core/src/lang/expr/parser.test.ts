import { describe, expect, it } from "vitest";
import { parseExpression } from "./parser";

describe("parseExpression arithmetic", () => {
  it("parses a number", () => {
    expect(parseExpression("20")).toEqual({ ok: true, expr: { kind: "num", value: 20 } });
  });

  it("applies multiplication before addition", () => {
    expect(parseExpression("1 + 2 * 3")).toEqual({
      ok: true,
      expr: {
        kind: "bin",
        op: "+",
        left: { kind: "num", value: 1 },
        right: {
          kind: "bin",
          op: "*",
          left: { kind: "num", value: 2 },
          right: { kind: "num", value: 3 },
        },
      },
    });
  });

  it("associates division to the left", () => {
    expect(parseExpression("8 / 2 / 2")).toEqual({
      ok: true,
      expr: {
        kind: "bin",
        op: "/",
        left: {
          kind: "bin",
          op: "/",
          left: { kind: "num", value: 8 },
          right: { kind: "num", value: 2 },
        },
        right: { kind: "num", value: 2 },
      },
    });
  });

  it("associates subtraction to the left", () => {
    expect(parseExpression("1 - 2 - 3")).toEqual({
      ok: true,
      expr: {
        kind: "bin",
        op: "-",
        left: {
          kind: "bin",
          op: "-",
          left: { kind: "num", value: 1 },
          right: { kind: "num", value: 2 },
        },
        right: { kind: "num", value: 3 },
      },
    });
  });

  it("parses unary negation", () => {
    expect(parseExpression("-5")).toEqual({
      ok: true,
      expr: { kind: "neg", operand: { kind: "num", value: 5 } },
    });
  });

  it("parses unary negation after subtraction", () => {
    expect(parseExpression("2 - -3")).toEqual({
      ok: true,
      expr: {
        kind: "bin",
        op: "-",
        left: { kind: "num", value: 2 },
        right: { kind: "neg", operand: { kind: "num", value: 3 } },
      },
    });
  });

  it("parses repeated unary negation", () => {
    expect(parseExpression("--3")).toEqual({
      ok: true,
      expr: {
        kind: "neg",
        operand: { kind: "neg", operand: { kind: "num", value: 3 } },
      },
    });
  });

  it.each(["", "1 +", "* 2", "1 2", "(1)"]) ("rejects malformed arithmetic %j", (source) => {
    expect(parseExpression(source).ok).toBe(false);
  });

  it("parses a simple property reference", () => {
    expect(parseExpression("title.width")).toEqual({
      ok: true,
      expr: { kind: "ref", object: "title", path: [{ name: "width" }] },
    });
  });

  it("parses references in arithmetic", () => {
    expect(parseExpression("title.topRight.x + 20")).toEqual({
      ok: true,
      expr: {
        kind: "bin",
        op: "+",
        left: { kind: "ref", object: "title", path: [{ name: "topRight" }, { name: "x" }] },
        right: { kind: "num", value: 20 },
      },
    });
  });

  it("parses indexed reference segments", () => {
    expect(parseExpression("t.vertex[1].y")).toEqual({
      ok: true,
      expr: { kind: "ref", object: "t", path: [{ name: "vertex", index: 1 }, { name: "y" }] },
    });
  });

  it("parses scene references", () => {
    expect(parseExpression("scene.center")).toEqual({
      ok: true,
      expr: { kind: "ref", object: "scene", path: [{ name: "center" }] },
    });
  });

  it("parses long references in arithmetic", () => {
    expect(parseExpression("a.boundingBox.center.y - 100")).toEqual({
      ok: true,
      expr: {
        kind: "bin",
        op: "-",
        left: {
          kind: "ref",
          object: "a",
          path: [{ name: "boundingBox" }, { name: "center" }, { name: "y" }],
        },
        right: { kind: "num", value: 100 },
      },
    });
  });

  it("parses a path function in arithmetic", () => {
    expect(parseExpression("c.pathAngle(main, 0.5) + 90")).toEqual({
      ok: true,
      expr: {
        kind: "bin",
        op: "+",
        left: { kind: "pathFn", object: "c", fn: "pathAngle", pathName: "main", t: 0.5 },
        right: { kind: "num", value: 90 },
      },
    });
  });

  it("parses a path function with a negative parameter", () => {
    expect(parseExpression("o.pathX(main, -0.25)")).toEqual({
      ok: true,
      expr: { kind: "pathFn", object: "o", fn: "pathX", pathName: "main", t: -0.25 },
    });
  });

  it("rejects a bare object identifier", () => {
    expect(parseExpression("title").ok).toBe(false);
  });

  it.each(["a.", ".x", "a.b[", "a.b[x]", "a.b[1.5]", "a.b[-1]"])("rejects malformed reference %j", (source) => {
    expect(parseExpression(source).ok).toBe(false);
  });

  it.each(["a.pathX(main)", "a.pathX(main, b.x)", "a.b.pathX(main,0)"])("rejects malformed path function %j", (source) => {
    expect(parseExpression(source).ok).toBe(false);
  });

  it("treats a path function name without parentheses as a reference segment", () => {
    expect(parseExpression("a.pathX")).toEqual({
      ok: true,
      expr: { kind: "ref", object: "a", path: [{ name: "pathX" }] },
    });
  });
});
