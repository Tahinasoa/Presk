import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { compileCreates } from "@/engine/compile/create";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import type { Step } from "@/lang/types";

function compile(steps: readonly Step[]) {
  const d = new DiagnosticCollector();
  const result = compileCreates(steps, createDefaultCatalog(), d);
  return { ...result, diagnostics: d.items };
}

describe("compileCreates", () => {
  it("compiles valid creates and tracks declared types", () => {
    const result = compile([
      { action: "create", target: "a", type: "rectangle", properties: { width: 100 } },
      { action: "create", target: "t", type: "text", properties: { text: "hello" } },
    ]);
    expect(result.init.map(({ id }) => id)).toEqual(["a", "t"]);
    expect(result.types).toEqual(new Map([["a", "rectangle"], ["t", "text"]]));
    expect(result.diagnostics).toEqual([]);
  });

  it("allows references to earlier creates", () => {
    const result = compile([
      { action: "create", target: "a", type: "rectangle" },
      { action: "create", target: "b", type: "rectangle", properties: { x: "a.width" } },
    ]);
    expect(result.init).toHaveLength(2);
    expect(result.diagnostics).toEqual([]);
  });

  it.each([
    [
      [
        { action: "create", target: "b", type: "rectangle", properties: { x: "a.width" } },
        { action: "create", target: "a", type: "rectangle" },
      ],
      "E_FORWARD_REFERENCE",
    ],
    [[{ action: "create", target: "a", type: "rectangle", properties: { x: "a.width" } }], "E_FORWARD_REFERENCE"],
    [[{ action: "create", target: "b", type: "rectangle", properties: { x: "zzz.width" } }], "E_OBJECT_UNKNOWN"],
  ] as const)("rejects invalid references", (steps, code) => {
    const result = compile(steps);
    expect(result.diagnostics.map(({ code: actual }) => actual)).toContain(code);
  });

  it("reports duplicate identifiers at the later step", () => {
    const result = compile([
      { action: "create", target: "a", type: "rectangle" },
      { action: "create", target: "a", type: "rectangle" },
    ]);
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: "E_OBJECT_DUPLICATE", stepIndex: 1 }));
    expect(result.init).toHaveLength(1);
  });

  it.each(["hexagon", "scene"])("rejects non-creatable or unknown type %s", (type) => {
    const result = compile([{ action: "create", target: "a", type }]);
    expect(result.diagnostics.map(({ code }) => code)).toContain("E_TYPE_UNKNOWN");
    expect(result.types.get("a")).toBe(type);
    expect(result.init).toEqual([]);
  });

  it("ignores non-create steps while preserving their source indices", () => {
    const result = compile([
      { action: "set", target: "a", properties: { x: 3 } },
      { action: "create", target: "a", type: "rectangle" },
    ]);
    expect(result.init.map(({ id }) => id)).toEqual(["a"]);
    expect(result.diagnostics).toEqual([]);
  });
});
