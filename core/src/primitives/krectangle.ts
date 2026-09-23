// KRectangle backs the DSL's `"shape"` type (see registry/builtins.ts).
// It adds width/height plus the full corner and bounding-box geometry
// required by spec §4.2 ("real" corners, which follow rotation) and §4.3
// (`boundingBox.*`, axis-aligned corners recomputed after rotation).
//
// No PixiJS import here — see primitives/README.md.

import KObject, { type KObjectParams } from "./kobject";
import type { KPoint } from "./types";
import gsap from "gsap";

export interface KRectangleParams extends KObjectParams {
  width: number;
  height: number;
  /** 0 = left, 0.5 = center, 1 = right. Defaults to center. */
  anchorX?: number;
  /** 0 = top, 0.5 = center, 1 = bottom. Defaults to center. */
  anchorY?: number;
  fill?: number;
  stroke?: number;
  strokeWidth?: number;
}

class KRectangle extends KObject {
  private _width: number;
  private _height: number;
  private _anchorX: number;
  private _anchorY: number;
  private _fill: number;
  private _stroke: number;
  private _strokeWidth: number;

  constructor({ width, height, anchorX = 0.5, anchorY = 0.5, fill = 0x9c9c9c, stroke = 0, strokeWidth = 0, ...rest }: KRectangleParams) {
    super(rest);
    this._width = width;
    this._height = height;
    this._anchorX = anchorX;
    this._anchorY = anchorY;
    this._fill = fill;
    this._stroke = stroke;
    this._strokeWidth = strokeWidth;

    Object.assign(this.propertyAnimators, {
      width: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _width: value, ...opts }, 0);
      },
      height: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _height: value, ...opts }, 0);
      },
      anchorX: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _anchorX: value, ...opts }, 0);
      },
      anchorY: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _anchorY: value, ...opts }, 0);
      },
      fill: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _fill: value, ...opts }, 0);
      },
      stroke: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _stroke: value, ...opts }, 0);
      },
      strokeWidth: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _strokeWidth: value, ...opts }, 0);
      },
    });
  }

  override create(options: { duration?: number; ease?: string } = {}): gsap.core.Timeline {
    const duration = options.duration ?? 0.4;
    const ease = options.ease ?? "power2.out";
    const tl = gsap.timeline();
    const finalScale = this._scale;
    const finalOpacity = this._opacity;
    this._scale = 0;
    this._opacity = 0;
    tl.to(this, { _scale: finalScale, _opacity: finalOpacity, duration, ease }, 0);
    return tl;
  }

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
  }

  get anchorX(): number {
    return this._anchorX;
  }

  set anchorX(value: number) {
    this._anchorX = value;
  }

  get anchorY(): number {
    return this._anchorY;
  }

  set anchorY(value: number) {
    this._anchorY = value;
  }

  get fill(): number {
    return this._fill;
  }

  set fill(value: number) {
    this._fill = value;
  }

  get stroke(): number {
    return this._stroke;
  }

  set stroke(value: number) {
    this._stroke = value;
  }

  get strokeWidth(): number {
    return this._strokeWidth;
  }

  set strokeWidth(value: number) {
    this._strokeWidth = value;
  }

  // ---- Center & rotation pivot ----

  /**
   * Offset between the object's (x, y) anchor point and its geometric
   * center, before scale/rotation are applied.
   */
  private get pivotOffsetX(): number {
    return (0.5 - this._anchorX) * this._width;
  }

  private get pivotOffsetY(): number {
    return (0.5 - this._anchorY) * this._height;
  }

  /**
   * Real center of the rectangle in scene coordinates (accounts for anchor,
   * scale and rotation). Also the pivot rotation is applied around.
   */
  get center(): KPoint {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const ox = this.pivotOffsetX * this.scale;
    const oy = this.pivotOffsetY * this.scale;

    return {
      x: this.x + ox * cos - oy * sin,
      y: this.y + ox * sin + oy * cos,
    };
  }

  /**
   * A corner given in local, unrotated units (e.g. -0.5/-0.5 = topLeft),
   * projected into scene coordinates after scale + rotation around center.
   */
  private getCorner(localX: number, localY: number): KPoint {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const rx = (localX - this._anchorX) * this._width;
    const ry = (localY - this._anchorY) * this._height;

    // Scale
    const sx = rx * this.scale;
    const sy = ry * this.scale;

    // Rotate around anchor (x, y)
    return {
      x: this.x + sx * cos - sy * sin,
      y: this.y + sx * sin + sy * cos,
    };
  }

  get topLeft(): KPoint {
    return this.getCorner(0, 0);
  }

  get topRight(): KPoint {
    return this.getCorner(1, 0);
  }

  get bottomRight(): KPoint {
    return this.getCorner(1, 1);
  }

  get bottomLeft(): KPoint {
    return this.getCorner(0, 1);
  }

  /**
   * Bounding box axis-aligned (spec §4.3). Recomputed after rotation.
   */
  get boundingBox(): { topLeft: KPoint; topRight: KPoint; bottomLeft: KPoint; bottomRight: KPoint; center: KPoint } {
    const corners = [this.topLeft, this.topRight, this.bottomLeft, this.bottomRight];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const c of corners) {
      if (c.x < minX) minX = c.x;
      if (c.x > maxX) maxX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.y > maxY) maxY = c.y;
    }

    return {
      topLeft: { x: minX, y: minY },
      topRight: { x: maxX, y: minY },
      bottomLeft: { x: minX, y: maxY },
      bottomRight: { x: maxX, y: maxY },
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
    };
  }

  containsPoint(px: number, py: number): boolean {
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    const dx = px - this.x;
    const dy = py - this.y;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    const left = (0 - this._anchorX) * this._width * this.scale;
    const right = (1 - this._anchorX) * this._width * this.scale;
    const top = (0 - this._anchorY) * this._height * this.scale;
    const bottom = (1 - this._anchorY) * this._height * this.scale;

    return localX >= left && localX <= right && localY >= top && localY <= bottom;
  }
}

export default KRectangle;
