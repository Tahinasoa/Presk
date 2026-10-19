import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import type { Step } from "@/lang/types";
import { validatePropertiesShape } from "./properties";

function validate(action: Step["action"], properties?: unknown) {
  const step = { action, target: "a", properties } as unknown as Step;
  const diagnostics = new DiagnosticCollector();
  validatePropertiesShape(step, 2, diagnostics);
  return diagnostics.items.map(({ code, field }) => ({ code, field }));
}

describe("validatePropertiesShape", () => {
  it("accepts a valid stop property list", () => {
    expect(validate("stop", ["x", "y"])).toEqual([]);
  });

  it.each([
    { properties: ["x", "x"] },
    { properties: [""] },
    { properties: [1] },
  ])("rejects an invalid stop property list %j", ({ properties }) => {
    expect(validate("stop", properties)).toEqual([{ code: "E_FIELD_TYPE", field: "properties" }]);
  });

  it("allows unbind without properties", () => {
    expect(validate("unbind")).toEqual([]);
  });

  it.each(["set", "animate", "bind"] as const)("requires non-empty properties for %s", (action) => {
    expect(validate(action, {})).toEqual([{ code: "E_FIELD_REQUIRED", field: "properties" }]);
  });

  it("rejects an empty property key", () => {
    expect(validate("set", { "": 1 })).toEqual([{ code: "E_FIELD_TYPE", field: "properties." }]);
  });

  it("accepts group children as a list or a single name", () => {
    expect(validate("group", { children: ["a", "b"], layout: "vertical" })).toEqual([]);
    expect(validate("group", { children: "a" })).toEqual([]);
  });

  it("requires group children", () => {
    expect(validate("group", { layout: "vertical" })).toEqual([
      { code: "E_FIELD_REQUIRED", field: "properties.children" },
    ]);
  });

  it.each([
    { children: [] },
    { children: "" },
    { children: "a b" },
    { children: ["a", ""] },
    { children: ["a", 1] },
  ])("rejects invalid group children %j", ({ children }) => {
    expect(validate("group", { children })).toEqual([
      { code: "E_FIELD_TYPE", field: "properties.children" },
    ]);
  });

  it("allows ungroup without properties", () => {
    expect(validate("ungroup")).toEqual([]);
  });

  it("accepts ungroup children", () => {
    expect(validate("ungroup", { children: ["a"] })).toEqual([]);
    expect(validate("ungroup", { children: "a" })).toEqual([]);
  });

  it("rejects ungroup properties other than children", () => {
    expect(validate("ungroup", { gap: 1 })).toEqual([
      { code: "E_FIELD_FORBIDDEN", field: "properties.gap" },
    ]);
  });

  it.each([{ children: 3 }, { children: ["a", 1] }])("rejects invalid ungroup children %j", ({ children }) => {
    expect(validate("ungroup", { children })).toEqual([
      { code: "E_FIELD_TYPE", field: "properties.children" },
    ]);
  });
});
