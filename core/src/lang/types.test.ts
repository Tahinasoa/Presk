import { describe, expect, it } from "vitest";
import { ACTION_NAMES } from "./types";
import type { Step } from "./types";

describe("DSL types", () => {
  it("accepts one typed step for every action", () => {
    const steps = [
      { action: "create", target: "box", type: "rectangle" } satisfies Step,
      { action: "set", target: "box", properties: { x: 10 } } satisfies Step,
      { action: "animate", target: "box", properties: { x: 20 }, duration: 1 } satisfies Step,
      { action: "travel", target: "box", along: "path", duration: 1 } satisfies Step,
      { action: "bind", target: "box", properties: { x: "other.x" } } satisfies Step,
      { action: "unbind", target: "box", properties: ["x"] } satisfies Step,
      { action: "stop", target: "box", properties: ["x"] } satisfies Step,
      { action: "group", target: "cluster", properties: { children: ["box"] } } satisfies Step,
      { action: "ungroup", target: "cluster" } satisfies Step,
    ];

    expect(steps).toHaveLength(9);
    expect(ACTION_NAMES).toEqual(["create", "set", "animate", "travel", "bind", "unbind", "stop", "group", "ungroup"]);
  });

  it("rejects properties on a travel step", () => {
    const invalidTravel = {
      action: "travel",
      target: "box",
      along: "path",
      // @ts-expect-error properties are forbidden on TravelStep
      properties: { x: 10 },
    } satisfies Step;

    void invalidTravel;
    expect(true).toBe(true);
  });
});
