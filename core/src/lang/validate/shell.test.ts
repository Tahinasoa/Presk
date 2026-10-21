import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { validateShell } from "./shell";

function validate(raw: unknown) {
  const diagnostics = new DiagnosticCollector();
  const result = validateShell(raw, diagnostics);
  return { result, codes: diagnostics.items.map((diagnostic) => diagnostic.code) };
}

function documentWith(overrides: Record<string, unknown> = {}) {
  return {
    version: "1.0",
    scene: { width: 1920, height: 1080 },
    steps: [],
    ...overrides,
  };
}

describe("validateShell", () => {
  it("accepts a minimal valid document and returns its scene and steps", () => {
    const scene = { width: 1920, height: 1080 };
    const steps: unknown[] = [];
    const { result, codes } = validate({ version: "1.0", scene, steps });

    expect(codes).toEqual([]);
    expect(result).toEqual({ scene, steps });
    expect(result?.steps).toBe(steps);
  });

  it("accepts a valid background color", () => {
    const { result, codes } = validate(documentWith({
      scene: { width: 1, height: 1, background: "#101014" },
    }));

    expect(codes).toEqual([]);
    expect(result?.scene).toEqual({ width: 1, height: 1, background: "#101014" });
  });

  it.each([null, [], "x", 3])("rejects a non-object document %j", (raw) => {
    expect(validate(raw).codes).toEqual(["E_DOC_NOT_OBJECT"]);
  });

  it.each([undefined, "0.1", 1])("rejects an absent or unsupported version %j", (version) => {
    expect(validate(documentWith({ version })).codes).toEqual(["E_DOC_VERSION"]);
  });

  it.each([
    {},
    { width: 0, height: 1 },
    { width: 1, height: "a" },
    { width: 1, height: 1, background: 3 },
  ])("rejects an invalid scene %j", (scene) => {
    expect(validate(documentWith({ scene })).codes).toEqual(["E_SCENE_INVALID"]);
  });

  it.each([undefined, {}])("rejects missing or non-array steps %j", (steps) => {
    expect(validate(documentWith({ steps })).codes).toEqual(["E_STEPS_NOT_ARRAY"]);
  });

  it("collects version and steps errors together", () => {
    const { result, codes } = validate({ version: "0.1", scene: { width: 1, height: 1 } });

    expect(result).toBeNull();
    expect(codes).toEqual(["E_DOC_VERSION", "E_STEPS_NOT_ARRAY"]);
  });
});
