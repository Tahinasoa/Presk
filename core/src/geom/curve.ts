import { flattenCubic } from "@/geom/flatPath";
import type { Pt } from "@/geom/vec";

const CUBIC_SEGMENTS = 48;

function appendSegment(target: Pt[], segment: readonly Pt[]): void {
  const start = target.length === 0 ? 0 : 1;
  for (let index = start; index < segment.length; index += 1) target.push(segment[index]!);
}

export function flattenSpline(points: readonly Pt[], closed: boolean): Pt[] {
  const count = points.length;
  if (count < 2) return points.map((point) => ({ x: point.x, y: point.y }));

  const at = (index: number): Pt => {
    if (closed) return points[((index % count) + count) % count]!;
    return points[Math.min(Math.max(index, 0), count - 1)]!;
  };

  const result: Pt[] = [];
  const segmentCount = closed ? count : count - 1;
  for (let index = 0; index < segmentCount; index += 1) {
    const before = at(index - 1);
    const start = at(index);
    const end = at(index + 1);
    const after = at(index + 2);
    const c1: Pt = {
      x: start.x + (end.x - before.x) / 6,
      y: start.y + (end.y - before.y) / 6,
    };
    const c2: Pt = {
      x: end.x - (after.x - start.x) / 6,
      y: end.y - (after.y - start.y) / 6,
    };
    appendSegment(result, flattenCubic(start, c1, c2, end, CUBIC_SEGMENTS));
  }

  if (closed) result.pop();
  return result;
}

export function flattenBezierChain(points: readonly Pt[], closed: boolean): Pt[] {
  const count = points.length;
  if (closed ? count % 3 !== 0 : (count - 1) % 3 !== 0) {
    throw new Error(`flattenBezierChain: invalid point count ${count} (closed=${closed})`);
  }

  const result: Pt[] = [];
  const segmentCount = closed ? count / 3 : (count - 1) / 3;
  for (let index = 0; index < segmentCount; index += 1) {
    const base = index * 3;
    const start = points[base]!;
    const c1 = points[base + 1]!;
    const c2 = points[base + 2]!;
    const end = points[(base + 3) % count]!;
    appendSegment(result, flattenCubic(start, c1, c2, end, CUBIC_SEGMENTS));
  }

  if (closed && result.length > 0) result.pop();
  if (!closed && segmentCount === 0 && count === 1) result.push({ x: points[0]!.x, y: points[0]!.y });
  return result;
}
