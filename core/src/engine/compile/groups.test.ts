import { describe, expect, it } from "vitest";
import { compileCreates } from "@/engine/compile/create";
import { addImplicitGroups } from "@/engine/compile/groups";
import { compileProgram } from "@/engine/compileProgram";
import { DiagnosticCollector, PreskCompileError } from "@/lang/diagnostics";
import type { Step } from "@/lang/types";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { FakeImageInfo, FakeTextMeasurer } from "@/model/ports";

const env = {
  catalog: createDefaultCatalog(),
  objectEnv: { measurer: new FakeTextMeasurer(), images: new FakeImageInfo() },
};
const scene = { width: 800, height: 600 };

function document(steps: Step[]) {
  return { version: "1.0" as const, scene, steps };
}

function compileError(steps: Step[]): string[] {
  try {
    compileProgram(document(steps), env);
  } catch (error) {
    if (error instanceof PreskCompileError) {
      return error.diagnostics.map(({ code }) => code);
    }
    throw error;
  }
  throw new Error("Expected compilation to fail");
}

describe("group compilation", () => {
  it("adds an implicit group after all explicit creates and tracks its type", () => {
    const steps: Step[] = [
      { action: "create", target: "a", type: "rectangle" },
      { action: "create", target: "b", type: "rectangle" },
      { action: "group", target: "menu", properties: { children: ["a", "b"] } },
    ];
    const { init, types } = compileCreates(steps, env.catalog, new DiagnosticCollector());
    addImplicitGroups(steps, init, types);

    expect(init.map(({ id }) => id)).toEqual(["a", "b", "menu"]);
    expect(init[2].type).toBe("group");
    expect(types.get("menu")).toBe("group");
  });

  it("does not duplicate an explicitly created group", () => {
    const program = compileProgram(document([
      { action: "create", target: "a", type: "rectangle" },
      { action: "create", target: "menu", type: "group" },
      { action: "group", target: "menu", properties: { children: "a" } },
    ]), env);

    expect(program.init.map(({ id }) => id)).toEqual(["a", "menu"]);
    expect(program.actions[0]).toMatchObject({ action: "group", target: "menu", children: ["a"] });
  });

  it("rejects group actions targeting a non-group object", () => {
    expect(compileError([
      { action: "create", target: "a", type: "rectangle" },
      { action: "create", target: "b", type: "rectangle" },
      { action: "group", target: "a", properties: { children: ["b"] } },
    ])).toContain("E_GROUP_TARGET_NOT_GROUP");
  });

  it.each([["zzz"], ["scene"]])("rejects unknown child %j", (children) => {
    expect(compileError([
      { action: "group", target: "g", properties: { children } },
    ])).toContain("E_GROUP_CHILD_UNKNOWN");
  });

  it("rejects a group containing itself", () => {
    expect(compileError([
      { action: "group", target: "g", properties: { children: ["g"] } },
    ])).toContain("E_GROUP_CYCLE");
  });

  it("rejects a group containing an ancestor", () => {
    expect(compileError([
      { action: "group", target: "g", properties: { children: ["h"] } },
      { action: "group", target: "h", properties: { children: ["g"] } },
    ])).toContain("E_GROUP_CYCLE");
  });

  it("rejects unbounded objects in groups with a layout", () => {
    expect(compileError([
      { action: "create", target: "r", type: "ray" },
      { action: "group", target: "g", properties: { children: ["r"], layout: "vertical" } },
    ])).toContain("E_GROUP_LAYOUT");
  });

  it("uses a group's layout from its explicit create when validating later groups", () => {
    expect(compileError([
      { action: "create", target: "r", type: "ray" },
      { action: "create", target: "g", type: "group", properties: { layout: "vertical" } },
      { action: "group", target: "g", properties: { children: ["r"] } },
    ])).toContain("E_GROUP_LAYOUT");
  });

  it("retains a group's layout from an earlier group action", () => {
    expect(compileError([
      { action: "create", target: "a", type: "rectangle" },
      { action: "create", target: "r", type: "ray" },
      { action: "group", target: "g", properties: { children: ["a"], layout: "horizontal" } },
      { action: "group", target: "g", properties: { children: ["r"] } },
    ])).toContain("E_GROUP_LAYOUT");
  });

  it("normalizes a single string child into an array", () => {
    const program = compileProgram(document([
      { action: "create", target: "a", type: "rectangle" },
      { action: "group", target: "g", properties: { children: "a" } },
    ]), env);

    expect(program.actions[0]).toMatchObject({ action: "group", children: ["a"] });
  });

  it("compiles layout properties separately from children", () => {
    const program = compileProgram(document([
      { action: "create", target: "a", type: "rectangle" },
      { action: "group", target: "g", properties: { children: ["a"], layout: "horizontal", gap: 5 } },
    ]), env);
    const action = program.actions[0];

    expect(action.action).toBe("group");
    if (action.action !== "group") throw new Error("Expected group action");
    expect(action.props.map(({ name }) => name)).toEqual(["layout", "gap"]);
  });

  it("uses linear ease by default and preserves explicit duration", () => {
    const program = compileProgram(document([
      { action: "create", target: "a", type: "rectangle" },
      { action: "group", target: "g", properties: { children: ["a"] }, duration: 2 },
    ]), env);

    expect(program.actions[0]).toMatchObject({ action: "group", ease: "linear", duration: 2 });
  });

  it("rejects ungrouping a non-member", () => {
    expect(compileError([
      { action: "create", target: "a", type: "rectangle" },
      { action: "create", target: "b", type: "rectangle" },
      { action: "group", target: "g", properties: { children: ["a"] } },
      { action: "ungroup", target: "g", properties: { children: ["b"] } },
    ])).toContain("E_UNGROUP_NOT_MEMBER");
  });

  it("allows ungrouping all current children", () => {
    const program = compileProgram(document([
      { action: "create", target: "a", type: "rectangle" },
      { action: "group", target: "g", properties: { children: ["a"] } },
      { action: "ungroup", target: "g" },
    ]), env);

    expect(program.actions[1]).toMatchObject({ action: "ungroup", target: "g", children: null });
  });

  it("clears membership for explicitly ungrouped children", () => {
    const program = compileProgram(document([
      { action: "create", target: "a", type: "rectangle" },
      { action: "create", target: "g", type: "group" },
      { action: "create", target: "h", type: "group" },
      { action: "group", target: "g", properties: { children: ["a"] } },
      { action: "ungroup", target: "g", properties: { children: "a" } },
      { action: "group", target: "h", properties: { children: ["a"] } },
    ]), env);

    expect(program.actions[1]).toMatchObject({ action: "ungroup", children: ["a"] });
    expect(program.actions[2]).toMatchObject({ action: "group", target: "h", children: ["a"] });
  });

  it("rejects ungroup actions targeting a non-group object", () => {
    expect(compileError([
      { action: "create", target: "a", type: "rectangle" },
      { action: "ungroup", target: "a" },
    ])).toContain("E_GROUP_TARGET_NOT_GROUP");
  });
});
