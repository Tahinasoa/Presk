import { describe, expect, it } from "vitest";
import {
  DIAGNOSTIC_CODES,
  DiagnosticCollector,
  PreskCompileError,
  PreskRuntimeError,
} from "./diagnostics";

describe("diagnostics", () => {
  it("defines a unique closed list of 69 error and warning codes", () => {
    expect(DIAGNOSTIC_CODES).toHaveLength(69);
    expect(new Set(DIAGNOSTIC_CODES).size).toBe(DIAGNOSTIC_CODES.length);
    expect(DIAGNOSTIC_CODES.every((code) => code.startsWith("E_") || code.startsWith("W_"))).toBe(true);
  });

  it("collects errors with their location", () => {
    const diagnostics = new DiagnosticCollector();

    diagnostics.error("E_DOC_VERSION", "m", { stepIndex: 2 });

    expect(diagnostics.items).toEqual([
      { severity: "error", code: "E_DOC_VERSION", message: "m", stepIndex: 2 },
    ]);
  });

  it("rejects a warning code passed to error", () => {
    const diagnostics = new DiagnosticCollector();

    expect(() => diagnostics.error("W_SPEED_PATH_MAY_CHANGE", "m")).toThrow(Error);
  });

  it("rejects an error code passed to warning", () => {
    const diagnostics = new DiagnosticCollector();

    expect(() => diagnostics.warning("E_DOC_VERSION", "m")).toThrow(Error);
  });

  it("exposes errors, warnings, and whether errors exist", () => {
    const diagnostics = new DiagnosticCollector();
    diagnostics.error("E_DOC_VERSION", "bad version");
    diagnostics.warning("W_SPEED_PATH_MAY_CHANGE", "path may change");

    expect(diagnostics.hasErrors).toBe(true);
    expect(diagnostics.errors).toHaveLength(1);
    expect(diagnostics.warnings).toHaveLength(1);
  });

  it("deduplicates compile error codes in its message but retains diagnostics", () => {
    const first = { severity: "error" as const, code: "E_DOC_VERSION" as const, message: "first" };
    const second = { severity: "error" as const, code: "E_DOC_VERSION" as const, message: "second" };
    const error = new PreskCompileError([first, second]);

    expect(error.message).toContain("E_DOC_VERSION");
    expect(error.message.indexOf("E_DOC_VERSION")).toBe(error.message.lastIndexOf("E_DOC_VERSION"));
    expect(error.diagnostics).toEqual([first, second]);
  });

  it("creates a named runtime error", () => {
    const error = new PreskRuntimeError("x");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("PreskRuntimeError");
  });
});
