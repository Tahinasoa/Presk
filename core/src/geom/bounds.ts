import type { Mat } from "@/geom/matrix";
import { applyMat } from "@/geom/matrix";
import type { Pt } from "@/geom/vec";

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const ANCHOR_NAMES = [
  "topLeft",
  "topCenter",
  "topRight",
  "centerLeft",
  "center",
  "centerRight",
  "bottomLeft",
  "bottomCenter",
  "bottomRight",
] as const;

export type AnchorName = (typeof ANCHOR_NAMES)[number];

export function isAnchorName(s: string): s is AnchorName {
  return (ANCHOR_NAMES as readonly string[]).includes(s);
}

export function boundsOfPoints(pts: readonly Pt[]): Bounds | null {
  if (pts.length === 0) return null;
  let minX = pts[0].x;
  let minY = pts[0].y;
  let maxX = pts[0].x;
  let maxY = pts[0].y;
  for (const point of pts.slice(1)) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  return { minX, minY, maxX, maxY };
}

export function unionBounds(a: Bounds | null, b: Bounds | null): Bounds | null {
  if (a === null) return b;
  if (b === null) return a;
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

export function transformBounds(b: Bounds, m: Mat): Bounds {
  return boundsOfPoints([
    applyMat(m, { x: b.minX, y: b.minY }),
    applyMat(m, { x: b.maxX, y: b.minY }),
    applyMat(m, { x: b.maxX, y: b.maxY }),
    applyMat(m, { x: b.minX, y: b.maxY }),
  ]) as Bounds;
}

export function anchorOfBounds(b: Bounds, name: AnchorName): Pt {
  const centerX = (b.minX + b.maxX) / 2;
  const centerY = (b.minY + b.maxY) / 2;
  switch (name) {
    case "topLeft": return { x: b.minX, y: b.minY };
    case "topCenter": return { x: centerX, y: b.minY };
    case "topRight": return { x: b.maxX, y: b.minY };
    case "centerLeft": return { x: b.minX, y: centerY };
    case "center": return { x: centerX, y: centerY };
    case "centerRight": return { x: b.maxX, y: centerY };
    case "bottomLeft": return { x: b.minX, y: b.maxY };
    case "bottomCenter": return { x: centerX, y: b.maxY };
    case "bottomRight": return { x: b.maxX, y: b.maxY };
  }
}

export function boundsWidth(b: Bounds): number {
  return b.maxX - b.minX;
}

export function boundsHeight(b: Bounds): number {
  return b.maxY - b.minY;
}
