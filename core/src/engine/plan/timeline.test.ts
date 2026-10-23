import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { DEFAULT_START, parseStart } from "@/lang/start";
import { planTimeline } from "@/engine/plan/timeline";
import { planForTest } from "@/engine/testing";
import type { DraftAction } from "@/engine/program";

type AnimateDraft = Extract<DraftAction, { action: "animate" }>;

function draft(overrides: Partial<AnimateDraft> = {}): DraftAction {
  return {
    action: "animate",
    index: 0,
    target: "a",
    entries: [],
    ease: "linear",
    repeat: 1,
    repeatMode: "restart",
    startSpec: DEFAULT_START,
    ...overrides,
  };
}

function plan(drafts: readonly DraftAction[]) {
  const d = new DiagnosticCollector();
  const result = planTimeline(drafts, d);
  return { ...result, diagnostics: d.items };
}

describe("planTimeline", () => {
  it("places sequential actions at the previous end by default", () => {
    const result = plan([draft({ explicitDuration: 1 }), draft({ index: 1, explicitDuration: 2 })]);
    expect(result.actions.map(({ start, end }) => [start, end])).toEqual([[0, 1], [1, 3]]);
    expect(result.duration).toBe(3);
  });

  it("handles previous start and end offsets", () => {
    const previousStart = plan([
      draft({ explicitDuration: 1 }),
      draft({ index: 1, explicitDuration: 2, startSpec: parseStart("<")! }),
    ]);
    const previousEndOffset = plan([
      draft({ explicitDuration: 1 }),
      draft({ index: 1, explicitDuration: 2, startSpec: parseStart(">0.5")! }),
    ]);
    const previousStartOffset = plan([
      draft({ explicitDuration: 1 }),
      draft({ index: 1, explicitDuration: 2, startSpec: parseStart("<0.5")! }),
    ]);
    expect(previousStart.actions.map(({ start }) => start)).toEqual([0, 0]);
    expect(previousEndOffset.actions[1]?.start).toBe(1.5);
    expect(previousStartOffset.actions[1]?.start).toBe(0.5);
  });

  it("handles absolute and label based starts", () => {
    const result = plan([
      draft({ index: 0, explicitDuration: 2, name: "a" }),
      draft({ index: 1, explicitDuration: 1 }),
      draft({ index: 2, explicitDuration: 1, startSpec: parseStart("a<1")! }),
      draft({ index: 3, explicitDuration: 1, startSpec: parseStart("a>-0.5")! }),
      draft({ index: 4, explicitDuration: 2, startSpec: { kind: "absolute", time: 5 } }),
    ]);
    expect(result.actions.map(({ start }) => start)).toEqual([0, 2, 1, 1.5, 5]);
    expect(result.duration).toBe(7);
  });

  it("reports unknown labels and labels declared only later", () => {
    const result = plan([
      draft({ index: 0, explicitDuration: 1, startSpec: parseStart("zzz")! }),
      draft({ index: 1, explicitDuration: 1, startSpec: parseStart("later")! }),
      draft({ index: 2, explicitDuration: 1, name: "later" }),
    ]);
    expect(result.diagnostics.map(({ code }) => code)).toEqual(["E_START_UNKNOWN_NAME", "E_START_UNKNOWN_NAME"]);
  });

  it("reports infinite previous ends and negative start times", () => {
    const result = plan([
      draft({ explicitDuration: 1, repeat: "infinite" }),
      draft({ index: 1, explicitDuration: 1 }),
      draft({ index: 2, explicitDuration: 1, startSpec: parseStart("<-1")! }),
    ]);
    expect(result.diagnostics.map(({ code }) => code)).toEqual(["E_START_REF_INFINITE_END", "E_START_NEGATIVE"]);
    expect(result.actions[1]?.start).toBe(0);
  });

  it("uses duration and repeat to calculate action ends", () => {
    const result = plan([
      draft({ explicitDuration: 1, repeat: 3 }),
      draft({ index: 1, explicitDuration: 1, repeat: 3, repeatMode: "yoyo" }),
      draft({ index: 2, effectDefaultDuration: 0.5, entries: [{ kind: "effect", name: "reveal", def: { variants: ["default"], defaultDuration: 0.5, defaultEase: "cubicOut", touches: [], apply: () => undefined }, variant: "default", on: true }] }),
    ]);
    expect(result.actions.map(({ end }) => end)).toEqual([3, 6, 6.5]);
    expect(result.duration).toBe(6.5);
  });

  it("rejects an infinite action that never starts within the finite scene", () => {
    const result = plan([draft({ explicitDuration: 1, repeat: "infinite", startSpec: { kind: "absolute", time: 0 } })]);
    expect(result.diagnostics.map(({ code }) => code)).toEqual(["E_INFINITE_NEVER_PLAYED"]);
  });

  it("allows an infinite action when another finite action extends the scene", () => {
    const result = plan([
      draft({ explicitDuration: 1, repeat: "infinite", startSpec: { kind: "absolute", time: 0 } }),
      draft({ index: 1, explicitDuration: 3, startSpec: { kind: "absolute", time: 0 } }),
    ]);
    expect(result.duration).toBe(3);
    expect(result.actions[0]?.end).toBe(Infinity);
    expect(result.diagnostics).toEqual([]);
  });

  it("plans zero-duration actions and rounds accumulated times", () => {
    const result = plan([
      draft({ explicitDuration: 0.1 }),
      draft({ index: 1, explicitDuration: 0.2 }),
      draft({ index: 2, explicitDuration: 0.2 }),
      { action: "set", index: 3, target: "a", startSpec: DEFAULT_START, entries: [] },
    ]);
    expect(result.actions[2]?.start).toBe(0.3);
    expect(result.actions[3]).toMatchObject({ start: 0.5, end: 0.5, duration: 0 });
    const setAtTwo = plan([{ action: "set", index: 0, target: "a", startSpec: { kind: "absolute", time: 2 }, entries: [] }]);
    expect(setAtTwo).toMatchObject({ duration: 2, actions: [{ end: 2, duration: 0 }] });
  });

  it("uses an explicit travel resolver", () => {
    const d = new DiagnosticCollector();
    const travel = {
      action: "travel",
      index: 0,
      target: "a",
      along: { object: "path", path: "main" },
      fromT: 0,
      toT: 1,
      ease: "linear",
      repeat: 1,
      repeatMode: "restart",
      orient: null,
      anchor: "center",
      startSpec: DEFAULT_START,
      fromSpec: 0,
    } as DraftAction;
    const result = planTimeline([travel], d, { resolveTravel: () => ({ fromT: 0.25, toT: 0.75, duration: 4 }) });
    expect(result.actions[0]).toMatchObject({ action: "travel", fromT: 0.25, toT: 0.75, duration: 4, end: 4 });
  });

  it("calls onPlanned in declaration order", () => {
    const planned: number[] = [];
    planTimeline([draft({ index: 4, explicitDuration: 1 }), draft({ index: 7, explicitDuration: 1 })], new DiagnosticCollector(), {
      onPlanned: (action) => planned.push(action.index),
    });
    expect(planned).toEqual([4, 7]);
  });

  it("exposes a test pipeline for valid documents", () => {
    const result = planForTest([
      { action: "create", target: "a", type: "rectangle" },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 1 },
    ]);
    expect(result.diagnostics).toEqual([]);
    expect(result.init.map(({ id }) => id)).toEqual(["a"]);
    expect(result.duration).toBe(1);
  });

  it("returns validation errors through the test pipeline without throwing", () => {
    expect(() => planForTest([{ action: "unknown" }])).not.toThrow();
    expect(planForTest([{ action: "unknown" }]).diagnostics).not.toEqual([]);
  });
});
