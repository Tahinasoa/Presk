// KRectangle backs the DSL's `"shape"` type (see registry/builtins.ts).
// It adds width/height plus the full corner and bounding-box geometry
// required by spec §4.2 ("real" corners, which follow rotation) and §4.3
// (`boundingBox.*`, axis-aligned corners recomputed after rotation).
//
// No PixiJS import here — see primitives/README.md.

import KObject, { type KObjectParams } from "./kobject";
import type { KPoint } from "./types";

export interface KRectangleParams extends KObjectParams {
  width: number;
  height: number;
  /** 0 = left, 0.5 = center, 1 = right. Defaults to center. */
  anchorX?: number;
  /** 0 = top, 0.5 = center, 1 = bottom. Defaults to center. */
  anchorY?: number;
}

class KRectangle extends KObject {
  override readonly type: string = "KRectangle";

  private _width: number;
  private _height: number;
  private _anchorX: number;
  private _anchorY: number;

  constructor({ width, height, anchorX = 0.5, anchorY = 0.5, ...rest }: KRectangleParams) {
    super(rest);
    this._width = width;
    this._height = height;
    this._anchorX = anchorX;
    this._anchorY = anchorY;
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
    const center = this.center;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    const dx = localX * this._width * this.scale;
    const dy = localY * this._height * this.scale;

    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  }

  // ---- Real corners (spec §4.2 — follow rotation) ----

  get topLeft(): KPoint {
    return this.getCorner(-0.5, -0.5);
  }

  get topRight(): KPoint {
    return this.getCorner(0.5, -0.5);
  }

  get bottomRight(): KPoint {
    return this.getCorner(0.5, 0.5);
  }

  get bottomLeft(): KPoint {
    return this.getCorner(-0.5, 0.5);
  }

  get corners(): KPoint[] {
    return [this.topLeft, this.topRight, this.bottomRight, this.bottomLeft];
  }

  // ---- Axis-aligned bounding box (spec §4.3 — boundingBox.*) ----
  // TODO(spec §4.3): not yet wired into the expression evaluator
  // (binding/expression.ts), which only resolves the real corners above.

  get boundingBox(): { topLeft: KPoint; topRight: KPoint; bottomLeft: KPoint; bottomRight: KPoint; center: KPoint } {
    const xs = this.corners.map((p) => p.x);
    const ys = this.corners.map((p) => p.y);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);

    return {
      topLeft: { x: left, y: top },
      topRight: { x: right, y: top },
      bottomLeft: { x: left, y: bottom },
      bottomRight: { x: right, y: bottom },
      center: { x: (left + right) / 2, y: (top + bottom) / 2 },
    };
  }

  // ---- Hit-testing helpers (not part of the DSL yet, kept for lib/ authors) ----

  /** Precise point-in-rectangle test, accounting for rotation. */
  containsPoint(px: number, py: number): boolean {
    const center = this.center;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);

    const dx = px - center.x;
    const dy = py - center.y;

    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    const halfW = (this._width * this.scale) / 2;
    const halfH = (this._height * this.scale) / 2;

    return localX >= -halfW && localX <= halfW && localY >= -halfH && localY <= halfH;
  }
}

export default KRectangle;
