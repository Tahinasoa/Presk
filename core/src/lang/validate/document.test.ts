import { describe, expect, it } from "vitest";
import { validateDocument } from "./document";

function documentWith(steps: unknown[], version = "1.0") {
  return { version, scene: { width: 800, height: 600 }, steps };
}

describe("validateDocument", () => {
  it("returns a valid minimal document", () => {
    const input = documentWith([
      { action: "create", target: "box", type: "rectangle" },
      { action: "animate", target: "box", properties: { x: 10 }, duration: 1 },
    ]);
    const result = validateDocument(input);

    expect(result.document).toEqual(input);
    expect(result.diagnostics).toEqual([]);
  });

  it("reports a duplicate name on its second occurrence", () => {
    const result = validateDocument(documentWith([
      { action: "set", target: "a", properties: { x: 1 }, name: "n" },
      { action: "animate", target: "a", properties: { x: 2 }, duration: 1, name: "n" },
    ]));

    expect(result.document).toBeUndefined();
    expect(result.diagnostics.map(({ code, stepIndex }) => ({ code, stepIndex }))).toEqual([
      { code: "E_NAME_DUPLICATE", stepIndex: 1 },
    ]);
  });

  it("rejects create targeting the reserved scene object", () => {
    const result = validateDocument(documentWith([
      { action: "create", target: "scene", type: "rectangle" },
    ]));

    expect(result.diagnostics.map(({ code }) => code)).toEqual(["E_OBJECT_RESERVED"]);
  });

  it("rejects travel targeting scene", () => {
    const result = validateDocument(documentWith([
      { action: "travel", target: "scene", along: "o", duration: 1 },
    ]));

    expect(result.diagnostics.map(({ code }) => code)).toEqual(["E_SCENE_ACTION"]);
  });

  it("allows set on scene for later semantic validation", () => {
    const result = validateDocument(documentWith([
      { action: "set", target: "scene", properties: { zoom: 2 } },
    ]));

    expect(result.document).toBeDefined();
    expect(result.diagnostics).toEqual([]);
  });

  it("collects diagnostics from every invalid step", () => {
    const result = validateDocument(documentWith([
      { action: "fly", target: "a" },
      { action: "set", target: "bad target" },
      { action: "travel", target: "a", along: "o" },
    ]));

    expect(result.document).toBeUndefined();
    expect(result.diagnostics.map(({ stepIndex }) => stepIndex)).toEqual([0, 1, 1, 2]);
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      "E_ACTION_UNKNOWN",
      "E_TARGET_INVALID",
      "E_FIELD_REQUIRED",
      "E_TRAVEL_DURATION",
    ]);
  });

  it("continues validating steps when the version is invalid", () => {
    const result = validateDocument(documentWith([{ action: "fly", target: "a" }], "0.1"));

    expect(result.document).toBeUndefined();
    expect(result.diagnostics.map(({ code, stepIndex }) => ({ code, stepIndex }))).toEqual([
      { code: "E_DOC_VERSION", stepIndex: undefined },
      { code: "E_ACTION_UNKNOWN", stepIndex: 0 },
    ]);
  });
});
