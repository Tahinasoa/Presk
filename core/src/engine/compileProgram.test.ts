import { describe, expect, it } from "vitest";
import { compileProgram, tryCompileProgram } from "@/engine/compileProgram";
import { PreskCompileError } from "@/lang/diagnostics";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";

const env = { catalog: createDefaultCatalog(), objectEnv: createTestEnv() };
const scene = { width: 800, height: 600 };

function document(steps: unknown[], version = "1.0") {
  return { version, scene, steps };
}

describe("compileProgram", () => {
  it("assembles a valid program", () => {
    const program = compileProgram(document([
      { action: "create", target: "a", type: "rectangle" },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 1 },
    ]), env);
    expect(program.init).toHaveLength(1);
    expect(program.actions).toHaveLength(1);
    expect(program.duration).toBe(1);
  });

  it("rejects a negative circle radius during compilation", () => {
    const result = tryCompileProgram(document([
      { action: "create", target: "circle", type: "circle", properties: { radius: -1 } },
    ]), env);
    expect(result.diagnostics.map(({ code }) => code)).toContain("E_VALUE_RANGE");
    expect(result.program).toBeUndefined();
  });

  it("returns validation diagnostics without a program", () => {
    const result = tryCompileProgram(document([], "0.1"), env);
    expect(result.diagnostics.map(({ code }) => code)).toContain("E_DOC_VERSION");
    expect(result.program).toBeUndefined();
  });

  it("throws one PreskCompileError with all error codes", () => {
    try {
      compileProgram(document([], "0.1"), env);
      throw new Error("expected compileProgram to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(PreskCompileError);
      expect((error as PreskCompileError).diagnostics.map(({ code }) => code)).toContain("E_DOC_VERSION");
    }
  });

  it("collects create and action errors in the same compilation phase", () => {
    const result = tryCompileProgram(document([
      { action: "create", target: "a", type: "unknown" },
      { action: "set", target: "missing", properties: { x: 1 } },
    ]), env);
    expect(result.diagnostics.map(({ code }) => code)).toEqual(expect.arrayContaining(["E_TYPE_UNKNOWN", "E_OBJECT_UNKNOWN"]));
    expect(result.program).toBeUndefined();
  });

  it("stops before compilation when document validation fails", () => {
    const result = tryCompileProgram(document([
      { action: "create", target: "a", type: "unknown" },
      { action: "set", target: "missing", properties: { x: 1 } },
    ], "0.1"), env);
    expect(result.diagnostics.map(({ code }) => code)).toContain("E_DOC_VERSION");
    expect(result.diagnostics.map(({ code }) => code)).not.toContain("E_TYPE_UNKNOWN");
    expect(result.diagnostics.map(({ code }) => code)).not.toContain("E_OBJECT_UNKNOWN");
  });

  it("runs activity analysis and reports stop without an active animation", () => {
    const result = tryCompileProgram(document([
      { action: "create", target: "a", type: "rectangle" },
      { action: "stop", target: "a", properties: ["x"] },
    ]), env);
    expect(result.diagnostics.map(({ code }) => code)).toContain("E_STOP_NOTHING");
    expect(result.program).toBeUndefined();
  });

  it("includes an empty warnings list for a valid document", () => {
    const program = compileProgram(document([
      { action: "create", target: "a", type: "rectangle" },
    ]), env);
    expect(program.warnings).toEqual([]);
  });
});
