import { describe, expect, it } from "vitest";
import { passProgress } from "@/engine/plan/passProgress";
import type { PassSpec } from "@/engine/plan/passProgress";

const lin = (x: number): number => x;
const quad = (x: number): number => x * x;

function spec(overrides: Partial<PassSpec> = {}): PassSpec {
  return { duration: 1, repeat: 1, mode: "restart", ease: lin, ...overrides };
}

describe("passProgress", () => {
  it.each([
    [spec({ duration: 2 }), 1, { p: 0.5, finished: false }],
    [spec({ duration: 2 }), 2, { p: 1, finished: true }],
    [spec({ duration: 2 }), 5, { p: 1, finished: true }],
    [spec({ duration: 2 }), -1, { p: 0, finished: false }],
    [spec({ duration: 2, ease: quad }), 1, { p: 0.25, finished: false }],
    [spec({ repeat: 2 }), 1.5, { p: 0.5, finished: false }],
    [spec({ repeat: 2 }), 2, { p: 1, finished: true }],
    [spec({ repeat: 2, mode: "yoyo" }), 0.5, { p: 0.5, finished: false }],
    [spec({ repeat: 2, mode: "yoyo" }), 1.5, { p: 0.5, finished: false }],
    [spec({ repeat: 2, mode: "yoyo" }), 1.25, { p: 0.75, finished: false }],
    [spec({ repeat: 2, mode: "yoyo" }), 2, { p: 0, finished: true }],
    [spec({ repeat: 3, mode: "yoyo" }), 3, { p: 1, finished: true }],
    [spec({ repeat: "infinite", mode: "yoyo" }), 5.25, { p: 0.75, finished: false }],
    [spec({ repeat: "infinite", mode: "yoyo" }), 6.25, { p: 0.25, finished: false }],
    [spec({ repeat: "infinite" }), 7.5, { p: 0.5, finished: false }],
    [spec({ duration: 0 }), 0, { p: 1, finished: true }],
    [spec({ repeat: 2, mode: "yoyo", ease: quad }), 1.5, { p: 0.25, finished: false }],
  ])("calculates pass progress at elapsed %s", (passSpec, elapsed, expected) => {
    expect(passProgress(elapsed, passSpec)).toEqual(expected);
  });
});
