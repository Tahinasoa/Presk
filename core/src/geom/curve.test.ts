import { describe, expect, it } from "vitest";
import { flattenBezierChain, flattenSpline } from "@/geom/curve";
import type { Pt } from "@/geom/vec";

function expectPoint(actual: Pt | undefined, expected: Pt): void {
  expect(actual).toBeDefined();
  expect(actual!.x).toBeCloseTo(expected.x, 6);
  expect(actual!.y).toBeCloseTo(expected.y, 6);
}

describe("flattenSpline", () => {
  it("garde des points colinéaires sur y = 0 (97 points, extrémités exactes)", () => {
    const result = flattenSpline(
      [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }],
      false,
    );
    expect(result).toHaveLength(97);
    for (const point of result) expect(point.y).toBeCloseTo(0, 9);
    expectPoint(result[0], { x: 0, y: 0 });
    expectPoint(result[96], { x: 20, y: 0 });
  });

  it("passe par les points de contrôle intermédiaires (indice 48)", () => {
    const result = flattenSpline(
      [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }],
      false,
    );
    expectPoint(result[48], { x: 10, y: 0 });
  });

  it("passe par le sommet central d'une courbe en pic", () => {
    const result = flattenSpline(
      [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 0 }],
      false,
    );
    expectPoint(result[48], { x: 10, y: 10 });
  });

  it("fermé : 4×48 points, sans répéter le premier, passe par chaque point", () => {
    const square: Pt[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    const result = flattenSpline(square, true);
    expect(result).toHaveLength(192);
    const first = result[0]!;
    const last = result[191]!;
    expect(Math.hypot(first.x - last.x, first.y - last.y)).toBeGreaterThan(1e-6);
    square.forEach((point, index) => expectPoint(result[index * 48], point));
  });
});

describe("flattenBezierChain", () => {
  it("ouvert : une cubique donne 49 points, milieu ≈ (5, 7.5)", () => {
    const result = flattenBezierChain(
      [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }],
      false,
    );
    expect(result).toHaveLength(49);
    expectPoint(result[24], { x: 5, y: 7.5 });
  });

  it("fermé à 6 points : 2×48 = 96 points", () => {
    const result = flattenBezierChain(
      [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
        { x: 10, y: 0 },
        { x: 10, y: -10 },
        { x: 0, y: -10 },
      ],
      true,
    );
    expect(result).toHaveLength(96);
  });

  it("ouvert avec 5 points : lève une erreur", () => {
    const points: Pt[] = Array.from({ length: 5 }, (_, index) => ({ x: index, y: index }));
    expect(() => flattenBezierChain(points, false)).toThrow();
  });
});
