import { describe, expect, it } from "vitest";
import { parseStart } from "./start";
import type { StartSpec } from "./start";

const cases: Array<[unknown, StartSpec | null]> = [
  [3, { kind: "absolute", time: 3 }],
  [0, { kind: "absolute", time: 0 }],
  [3.5, { kind: "absolute", time: 3.5 }],
  ["3.3", { kind: "absolute", time: 3.3 }],
  ["0", { kind: "absolute", time: 0 }],
  ["<", { kind: "prevStart", offset: 0 }],
  [">", { kind: "prevEnd", offset: 0 }],
  ["<3", { kind: "prevStart", offset: 3 }],
  [">2", { kind: "prevEnd", offset: 2 }],
  ["<-1.5", { kind: "prevStart", offset: -1.5 }],
  [">-2", { kind: "prevEnd", offset: -2 }],
  ["titleReveal", { kind: "labelStart", label: "titleReveal", offset: 0 }],
  ["titleReveal<5", { kind: "labelStart", label: "titleReveal", offset: 5 }],
  ["titleReveal>-2", { kind: "labelEnd", label: "titleReveal", offset: -2 }],
  ["menu_1>0.5", { kind: "labelEnd", label: "menu_1", offset: 0.5 }],
  ["-1", { kind: "absolute", time: -1 }],
  ["", null],
  [" 3", null],
  ["3 ", null],
  ["<<", null],
  ["a<", null],
  ["1a", null],
  ["+=1", null],
  ["nom+=2", null],
  ["3.", null],
  [".5", null],
  [Number.NaN, null],
  [Number.POSITIVE_INFINITY, null],
  [true, null],
  [null, null],
  [undefined, null],
  [{}, null],
];

describe("parseStart", () => {
  it.each(cases)("parses %j", (value, expected) => {
    expect(parseStart(value)).toEqual(expected);
  });
});
