import { describe, expect, it } from "vitest";
import { tickTimes } from "@/engine/sim/ticks";
import type { Program } from "@/engine/program";

function program(actions: { start: number; end: number }[], duration = 1): Program {
  return { actions, duration } as unknown as Program;
}

describe("tickTimes", () => {
  it("includes frame-grid instants from zero through upTo", () => {
    expect(tickTimes(program([]), 2, -1, 1)).toEqual([0, 0.5, 1]);
  });

  it("excludes the after instant", () => {
    expect(tickTimes(program([]), 2, 0, 1)).toEqual([0.5, 1]);
  });

  it("unions action starts and finite ends with the frame grid", () => {
    expect(tickTimes(program([{ start: 0.25, end: 0.75 }]), 2, -1, 1)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it("does not add infinite action ends", () => {
    expect(tickTimes(program([{ start: 0.25, end: Infinity }]), 2, -1, 1)).not.toContain(Infinity);
  });

  it("rounds near-equal grid and action instants to one tick", () => {
    expect(tickTimes(program([{ start: 1.0000000001, end: 1.5 }]), 1, -1, 1)).toEqual([0, 1]);
  });

  it("returns every frame at 60 fps through one second", () => {
    const times = tickTimes(program([]), 60, -1, 1);
    expect(times).toHaveLength(61);
    expect(times.at(-1)).toBe(1);
  });

  it("returns no instants when upTo is before after", () => {
    expect(tickTimes(program([]), 2, 1, 0)).toEqual([]);
  });
});
