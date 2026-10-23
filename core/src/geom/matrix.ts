import {
  applyToPoint as transformPoint,
  compose,
  inverse,
  rotate,
  scale,
  translate,
} from "transformation-matrix";
import type { Pt } from "@/geom/vec";

export type Mat = { a: number; b: number; c: number; d: number; e: number; f: number };

export const IDENTITY: Mat = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

export function composeMat(...ms: Mat[]): Mat {
  if (ms.length === 0) return { ...IDENTITY };
  return compose(...ms);
}

export function translateMat(x: number, y: number): Mat {
  return translate(x, y);
}

export function applyMat(m: Mat, p: Pt): Pt {
  return transformPoint(m, p);
}

export function invertMat(m: Mat): Mat {
  if (Math.abs(m.a * m.d - m.b * m.c) < 1e-12) {
    throw new Error("Presk internal: singular matrix");
  }
  return inverse(m);
}

export function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

export function radToDeg(r: number): number {
  return (r * 180) / Math.PI;
}

export function trsPivot(pos: Pt, pivot: Pt, rotationDeg: number, scaleFactor: number): Mat {
  return composeMat(
    translateMat(pos.x, pos.y),
    translateMat(pivot.x, pivot.y),
    rotate(degToRad(rotationDeg)),
    scale(scaleFactor, scaleFactor),
    translateMat(-pivot.x, -pivot.y),
  );
}

export function matRotationDeg(m: Mat): number {
  return radToDeg(Math.atan2(m.b, m.a));
}

export function matScale(m: Mat): number {
  return Math.hypot(m.a, m.b);
}

export function applyLinear(m: Mat, v: Pt): Pt {
  return { x: m.a * v.x + m.c * v.y, y: m.b * v.x + m.d * v.y };
}
