import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import type { Step } from "@/lang/types";
import { validateTimingValues } from "./timing";

function animate(fields: Record<string, unknown> = {}): Step {
  return { action: "animate", target: "a", properties: { x: 1 }, ...fields } as unknown as Step;
}

function travel(fields: Record<string, unknown> = {}): Step {
  return { action: "travel", target: "a", along: "o", ...fields } as unknown as Step;
}

function validate(step: Step) {
  const diagnostics = new DiagnosticCollector();
  validateTimingValues(step, 4, diagnostics);
  return diagnostics.items;
}

function expectCodes(step: Step, codes: string[]) {
  const diagnostics = validate(step);
  expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(codes);
  expect(diagnostics.every((diagnostic) => diagnostic.stepIndex === 4 && typeof diagnostic.field === "string")).toBe(true);
}

describe("validateTimingValues", () => {
  it("accepts valid animation timing values", () => {
    expectCodes(animate({ start: "<", duration: 0.5, ease: "cubicOut", repeat: 3, repeatMode: "yoyo" }), []);
  });

  it("accepts an infinite repeat", () => {
    expectCodes(animate({ repeat: "infinite" }), []);
  });

  it.each([0, -1, 1.5, "Infinite", "inf"])("rejects invalid repeat %j", (repeat) => {
    expectCodes(animate({ repeat }), ["E_REPEAT_INVALID"]);
  });

  it.each(["alternate", "reverse"])("rejects invalid repeatMode %j", (repeatMode) => {
    expectCodes(animate({ repeatMode }), ["E_REPEAT_MODE_INVALID"]);
  });

  it.each([0, -1, "1"])("rejects invalid duration %j", (duration) => {
    expectCodes(animate({ duration }), ["E_DURATION_INVALID"]);
  });

  it("rejects an unknown easing name", () => {
    expectCodes(animate({ ease: "cubic" }), ["E_EASE_UNKNOWN"]);
  });

  it("rejects an invalid start value", () => {
    expectCodes(animate({ start: "+=1" }), ["E_START_INVALID"]);
  });

  it("rejects an invalid name", () => {
    expectCodes(animate({ name: "1a" }), ["E_NAME_INVALID"]);
  });

  it("requires exactly one of travel duration and speed", () => {
    expectCodes(travel(), ["E_TRAVEL_DURATION"]);
    expectCodes(travel({ duration: 1, speed: 2 }), ["E_TRAVEL_DURATION"]);
  });

  it("accepts travel speed without duration", () => {
    expectCodes(travel({ speed: 100 }), []);
  });

  it("accepts current as a travel start position", () => {
    expectCodes(travel({ duration: 1, from: "current" }), []);
  });

  it("rejects non-numeric travel from and to values", () => {
    expectCodes(travel({ duration: 1, from: "x" }), ["E_FIELD_TYPE"]);
    expectCodes(travel({ duration: 1, to: "x" }), ["E_FIELD_TYPE"]);
  });

  it("accepts supported travel orientations", () => {
    expectCodes(travel({ duration: 1, orient: { offset: 90 } }), []);
    expectCodes(travel({ duration: 1, orient: true }), []);
    expectCodes(travel({ duration: 1, orient: false }), []);
  });

  it("rejects an invalid travel orientation", () => {
    expectCodes(travel({ duration: 1, orient: "yes" }), ["E_TRAVEL_OPTION"]);
  });
});
