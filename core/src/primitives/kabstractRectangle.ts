// KAbstractRectangle is an intermediate abstract class between KObject and
// rectangular primitives/scenes (KRectangle, KScene). It encapsulates width,
// height, anchors, and geometry (scalar anchors top, bottom, left, right and
// point anchors topLeft, bottomLeft, topRight, bottomRight, center, topCenter,
// bottomCenter, leftCenter, rightCenter). It has no associated renderer.

import KObject, { type KObjectParams } from "./kobject";
import type { KPoint } from "./types";

export interface KAbstractRectangleParams extends KObjectParams {
  width: number;
  height: number;
  anchorX?: number;
  anchorY?: number;
}

abstract class KAbstractRectangle extends KObject {
  protected _width: number;
  protected _height: number;
  protected _anchorX: number;
  protected _anchorY: number;

  constructor({ width, height, anchorX = 0.5, anchorY = 0.5, ...rest }: KAbstractRectangleParams) {
    super(rest);
    this._width = width;
    this._height = height;
    this._anchorX = anchorX;
    this._anchorY = anchorY;

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
    });
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

  // ---- Geometry & Anchors ----

  protected get pivotOffsetX(): number {
    return (0.5 - this._anchorX) * this._width;
  }

  protected get pivotOffsetY(): number {
    return (0.5 - this._anchorY) * this._height;
  }

  /**
   * A corner/point given in local, unrotated units (e.g. localX, localY),
   * projected into scene coordinates after scale + rotation around center.
   */
  protected getCorner(localX: number, localY: number): KPoint {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const rx = (localX - this._anchorX) * this._width;
    const ry = (localY - this._anchorY) * this._height;

    const sx = rx * this.scale;
    const sy = ry * this.scale;

    return {
      x: this.x + sx * cos - sy * sin,
      y: this.y + sx * sin + sy * cos,
    };
  }

  // Point anchors
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

  get topCenter(): KPoint {
    return this.getCorner(0.5, 0);
  }

  get bottomCenter(): KPoint {
    return this.getCorner(0.5, 1);
  }

  get leftCenter(): KPoint {
    return this.getCorner(0, 0.5);
  }

  get rightCenter(): KPoint {
    return this.getCorner(1, 0.5);
  }

  // Scalar anchors (bounding box min/max or derived positions)
  get top(): number {
    return this.boundingBox.topLeft.y;
  }

  get bottom(): number {
    return this.boundingBox.bottomLeft.y;
  }

  get left(): number {
    return this.boundingBox.topLeft.x;
  }

  get right(): number {
    return this.boundingBox.topRight.x;
  }

  /**
   * Bounding box axis-aligned. Recomputed after rotation.
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

export default KAbstractRectangle;
