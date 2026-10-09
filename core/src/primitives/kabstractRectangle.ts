// KAbstractRectangle is an intermediate abstract class between KObject and
// rectangular primitives/scenes (KRectangle, KScene). It encapsulates width,
// height, anchors, and geometry (scalar anchors top, bottom, left, right and
// point anchors topLeft, bottomLeft, topRight, bottomRight, center, topCenter,
// bottomCenter, leftCenter, rightCenter). It has no associated renderer.

import KObject, { type KObjectParams, type TweenOptions } from "./kobject";
import type { KPoint } from "./types";
import type KTween from "@/timer/tween/tween";
import { tweenPoint } from "@/timer/tween/tweenFactory";

type PointAnchor =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "leftCenter"
  | "center"
  | "rightCenter"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight";

function isKPoint(value: unknown): value is KPoint {
  return (
    typeof value === "object" &&
    value !== null &&
    "x" in value &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    "y" in value &&
    typeof value.y === "number" &&
    Number.isFinite(value.y)
  );
}

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
    Object.assign(this.tweenfactory, {
      topLeft: this.pointTweenFactory("topLeft"),
      topCenter: this.pointTweenFactory("topCenter"),
      topRight: this.pointTweenFactory("topRight"),
      leftCenter: this.pointTweenFactory("leftCenter"),
      center: this.pointTweenFactory("center"),
      rightCenter: this.pointTweenFactory("rightCenter"),
      bottomLeft: this.pointTweenFactory("bottomLeft"),
      bottomCenter: this.pointTweenFactory("bottomCenter"),
      bottomRight: this.pointTweenFactory("bottomRight"),
    });
  }

  private pointTweenFactory(property: PointAnchor): (value: unknown, options: TweenOptions) => KTween {
    return (value, options) => {
      if (!isKPoint(value)) {
        throw new Error(`Cannot tween '${property}': target value must be a point`);
      }
      return tweenPoint({
        ...options,
        id: `${options.id}:${property}`,
        target: this,
        property,
        to: value,
      });
    };
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
    const rx = (localX - this._anchorX) * this._width;
    const ry = (localY - this._anchorY) * this._height;
    return this.toWorld({ x: rx, y: ry });
  }

  // Point anchors
  get topLeft(): KPoint {
    return this.getCorner(0, 0);
  }

  set topLeft(value: KPoint) {
    this.setCorner(0, 0, value);
  }

  get topRight(): KPoint {
    return this.getCorner(1, 0);
  }

  set topRight(value: KPoint) {
    this.setCorner(1, 0, value);
  }

  get bottomRight(): KPoint {
    return this.getCorner(1, 1);
  }

  set bottomRight(value: KPoint) {
    this.setCorner(1, 1, value);
  }

  get bottomLeft(): KPoint {
    return this.getCorner(0, 1);
  }

  set bottomLeft(value: KPoint) {
    this.setCorner(0, 1, value);
  }

  get center(): KPoint {
    const ox = this.pivotOffsetX;
    const oy = this.pivotOffsetY;
    return this.toWorld({ x: ox, y: oy });
  }

  set center(value: KPoint) {
    this.setCorner(0.5, 0.5, value);
  }

  get topCenter(): KPoint {
    return this.getCorner(0.5, 0);
  }

  set topCenter(value: KPoint) {
    this.setCorner(0.5, 0, value);
  }

  get bottomCenter(): KPoint {
    return this.getCorner(0.5, 1);
  }

  set bottomCenter(value: KPoint) {
    this.setCorner(0.5, 1, value);
  }

  get leftCenter(): KPoint {
    return this.getCorner(0, 0.5);
  }

  set leftCenter(value: KPoint) {
    this.setCorner(0, 0.5, value);
  }

  get rightCenter(): KPoint {
    return this.getCorner(1, 0.5);
  }

  set rightCenter(value: KPoint) {
    this.setCorner(1, 0.5, value);
  }

  private setCorner(localX: number, localY: number, value: KPoint): void {
    const current = this.getCorner(localX, localY);
    this._x += value.x - current.x;
    this._y += value.y - current.y;
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
