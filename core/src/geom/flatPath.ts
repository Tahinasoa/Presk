import { clamp } from "@/geom/vec";
import { radToDeg } from "@/geom/matrix";
import type { Pt } from "@/geom/vec";

type Segment = { start: Pt; end: Pt; length: number; startDistance: number; endDistance: number };

export class FlatPath {
  readonly closed: boolean;
  readonly points: readonly Pt[];
  readonly length: number;
  private readonly segments: readonly Segment[];

  constructor(points: readonly Pt[], closed: boolean) {
    this.closed = closed;
    this.points = points.map((point) => ({ x: point.x, y: point.y }));
    const pairs: Array<[Pt, Pt]> = [];
    for (let index = 0; index + 1 < this.points.length; index += 1) {
      pairs.push([this.points[index], this.points[index + 1]]);
    }
    if (closed && this.points.length > 1) {
      pairs.push([this.points[this.points.length - 1], this.points[0]]);
    }

    let cumulative = 0;
    this.segments = pairs.map(([start, end]) => {
      const segmentLength = Math.hypot(end.x - start.x, end.y - start.y);
      const segment = {
        start,
        end,
        length: segmentLength,
        startDistance: cumulative,
        endDistance: cumulative + segmentLength,
      };
      cumulative += segmentLength;
      return segment;
    });
    this.length = cumulative;
  }

  pointAt(t: number): Pt {
    const first = this.points[0];
    if (this.length === 0) return first ? { ...first } : { x: 0, y: 0 };
    const normalized = this.normalizedT(t);
    const distance = normalized * this.length;
    const segment = this.segmentAt(distance);
    if (!segment) return first ? { ...first } : { x: 0, y: 0 };
    const fraction = segment.length === 0 ? 0 : (distance - segment.startDistance) / segment.length;
    return {
      x: segment.start.x + (segment.end.x - segment.start.x) * fraction,
      y: segment.start.y + (segment.end.y - segment.start.y) * fraction,
    };
  }

  angleAt(t: number): number {
    if (this.length === 0) return 0;
    const distance = this.normalizedT(t) * this.length;
    const nonZero = this.segments.filter((segment) => segment.length >= 1e-12);
    if (nonZero.length === 0) return 0;

    let selected: Segment | undefined;
    if (!this.closed && Math.abs(distance - this.length) <= 1e-9) {
      selected = nonZero[nonZero.length - 1];
    } else {
      const effectiveDistance = this.closed && Math.abs(distance - this.length) <= 1e-9 ? 0 : distance;
      selected = nonZero.find((segment) => Math.abs(segment.startDistance - effectiveDistance) <= 1e-9);
      if (!selected) selected = nonZero.find((segment) => segment.startDistance <= effectiveDistance && segment.endDistance > effectiveDistance);
      if (!selected && this.closed) selected = nonZero[0];
      if (!selected) selected = nonZero[nonZero.length - 1];
    }
    return radToDeg(Math.atan2(selected.end.y - selected.start.y, selected.end.x - selected.start.x));
  }

  sub(from: number, to: number): Pt[] {
    const start = clamp(from, 0, 1);
    const end = clamp(to, 0, 1);
    const result: Pt[] = [];
    const append = (point: Pt): void => {
      const previous = result[result.length - 1];
      if (!previous || previous.x !== point.x || previous.y !== point.y) result.push(point);
    };
    append(this.pointAt(start));
    if (this.length > 0 && end >= start) {
      const startDistance = start * this.length;
      const endDistance = end * this.length;
      for (const segment of this.segments) {
        if (segment.endDistance > startDistance && segment.endDistance < endDistance) append({ ...segment.end });
      }
    }
    append(this.pointAt(end));
    return result;
  }

  private normalizedT(t: number): number {
    return this.closed ? ((t % 1) + 1) % 1 : clamp(t, 0, 1);
  }

  private segmentAt(distance: number): Segment | undefined {
    if (!this.closed && distance >= this.length) return this.segments[this.segments.length - 1];
    return this.segments.find((segment) => segment.startDistance <= distance && distance <= segment.endDistance);
  }
}
