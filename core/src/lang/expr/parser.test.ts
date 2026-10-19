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

  it("defers references to the next parser task", () => {
    expect(parseExpression("box.x")).toEqual({ ok: false, message: "references not supported yet" });
  });
});
