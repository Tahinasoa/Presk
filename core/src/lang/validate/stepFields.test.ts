import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { validateStepFields } from "./stepFields";

function validate(raw: unknown) {
  const diagnostics = new DiagnosticCollector();
  const result = validateStepFields(raw, 4, diagnostics);
  return {
    result,
    diagnostics: diagnostics.items.map(({ code, field }) => ({ code, field })),
  };
}

describe("validateStepFields", () => {
  it("accepts a valid set step", () => {
    const step = { action: "set", target: "a", properties: { x: 1 } };
    const { result, diagnostics } = validate(step);

    expect(diagnostics).toEqual([]);
    expect(result).toBe(step);
  });

  it("accepts a valid create step", () => {
    expect(validate({ action: "create", target: "a", type: "rectangle" }).diagnostics).toEqual([]);
  });

  it.each([
    [{ action: "create", target: "a", type: "rectangle", start: 1 }, ["start"]],
    [{ action: "create", target: "a", type: "rectangle", name: "n", duration: 1 }, ["name", "duration"]],
    [{ action: "set", target: "a", properties: {}, duration: 1 }, ["duration"]],
    [{ action: "bind", target: "a", properties: { x: "b.x" }, ease: "linear" }, ["ease"]],
    [{ action: "travel", target: "a", along: "o", properties: {} }, ["properties"]],
  ])("rejects forbidden fields %j", (raw, fields) => {
    const { result, diagnostics } = validate(raw);
    expect(result).toBeNull();
    expect(diagnostics).toEqual(fields.map((field) => ({ code: "E_FIELD_FORBIDDEN", field })));
  });

  it.each([
    [{ action: "travel", target: "a" }, "along"],
    [{ action: "create", target: "a" }, "type"],
    [{ action: "set", target: "a" }, "properties"],
  ])("reports a missing required field %j", (raw, field) => {
    expect(validate(raw).diagnostics).toEqual([{ code: "E_FIELD_REQUIRED", field }]);
  });

  it("accepts stop properties as a string array", () => {
    expect(validate({ action: "stop", target: "a", properties: ["x"] }).diagnostics).toEqual([]);
  });

  it.each([
    [{ action: "stop", target: "a", properties: { x: 1 } }, "properties"],
    [{ action: "animate", target: "a", properties: [] }, "properties"],
    [{ action: "create", target: "a", type: 3 }, "type"],
    [{ action: "travel", target: "a", along: 3 }, "along"],
    [{ action: "set", target: "a", properties: {}, name: 3 }, "name"],
    [{ action: "travel", target: "a", along: "o", anchor: 3 }, "anchor"],
  ])("reports a field with the wrong type %j", (raw, field) => {
    expect(validate(raw).diagnostics).toEqual([{ code: "E_FIELD_TYPE", field }]);
  });

  it.each([{ action: "fly", target: "a" }, { target: "a" }])("rejects an unknown or absent action %j", (raw) => {
    expect(validate(raw).diagnostics).toEqual([{ code: "E_ACTION_UNKNOWN", field: "action" }]);
  });

  it("rejects a missing target", () => {
    expect(validate({ action: "set", properties: {} }).diagnostics).toEqual([
      { code: "E_TARGET_MISSING", field: "target" },
    ]);
  });

  it("rejects an invalid target identifier", () => {
    expect(validate({ action: "set", target: "a b", properties: {} }).diagnostics).toEqual([
      { code: "E_TARGET_INVALID", field: "target" },
    ]);
  });

  it.each([3, null, []])("rejects a non-object step %j", (raw) => {
    expect(validate(raw).diagnostics).toEqual([{ code: "E_STEP_NOT_OBJECT", field: undefined }]);
  });
});
