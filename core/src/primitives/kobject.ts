// KObject is the base "data" class for every object the DSL can `create`
// (spec §4.1). It knows nothing about how it is drawn — no PixiJS import is
// allowed in this file, ever (see primitives/README.md).
//
// It supports hierarchical parent/child composition and 2D transform composition
// via the pure "transformation-matrix" library.

import gsap from "gsap";
import { compose, translate, rotate, scale, applyToPoint, inverse, type Matrix } from "transformation-matrix";
import type { KPoint } from "./types";

export type PropertyAnimator = (
  value: unknown,
  tl: gsap.core.Timeline,
  options: { duration: number; ease?: string }
) => void;

export interface KObjectParams {
  id: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
}

class KObject {
  protected _id: string;
  protected _x: number;
  protected _y: number;
  protected _scale: number;
  protected _rotation: number;
  protected _opacity: number;
  protected _visible: boolean;

  protected _parent: KObject | null = null;
  protected _children: Map<string, KObject> = new Map();

  protected propertyAnimators: Record<string, PropertyAnimator> = {
    x: (value, tl, opts) => {
      tl.to(this, { _x: value, ...opts }, 0);
    },
    y: (value, tl, opts) => {
      tl.to(this, { _y: value, ...opts }, 0);
    },
    scale: (value, tl, opts) => {
      tl.to(this, { _scale: value, ...opts }, 0);
    },
    rotation: (value, tl, opts) => {
      tl.to(this, { _rotation: value, ...opts }, 0);
    },
    opacity: (value, tl, opts) => {
      tl.to(this, { _opacity: value, ...opts }, 0);
    },
    pos: (value, tl, opts) => {
      const { x, y } = value as { x: number; y: number };
      this.propertyAnimators.x(x, tl, opts);
      this.propertyAnimators.y(y, tl, opts);
    },
  };

  constructor({ id, x, y, scale = 1, rotation = 0, opacity = 1 }: KObjectParams) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._scale = scale;
    this._rotation = rotation;
    this._opacity = opacity;
    this._visible = false;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get x(): number {
    if (this._parent) {
      return this.toWorld({ x: 0, y: 0 }).x;
    }
    return this._x;
  }

  set x(value: number) {
    if (this._parent) {
      const parentInv = inverse(this._parent.worldMatrix());
      const local = applyToPoint(parentInv, { x: value, y: this.y });
      this._x = local.x;
    } else {
      this._x = value;
    }
  }

  get y(): number {
    if (this._parent) {
      return this.toWorld({ x: 0, y: 0 }).y;
    }
    return this._y;
  }

  set y(value: number) {
    if (this._parent) {
      const parentInv = inverse(this._parent.worldMatrix());
      const local = applyToPoint(parentInv, { x: this.x, y: value });
      this._y = local.y;
    } else {
      this._y = value;
    }
  }

  get pos(): KPoint {
    return { x: this.x, y: this.y };
  }

  set pos(value: KPoint) {
    this.x = value.x;
    this.y = value.y;
  }

  get scale(): number {
    return this._scale;
  }

  set scale(value: number) {
    this._scale = value;
  }

  get rotation(): number {
    return this._rotation;
  }

  set rotation(value: number) {
    this._rotation = value;
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
  }

  get parent(): KObject | null {
    return this._parent;
  }

  addChild(id: string, child: KObject): void {
    if (this._children.has(id)) {
      throw new Error(`KObject: a child with id "${id}" already exists.`);
    }
    // Anti-cycle guard
    let curr: KObject | null = this;
    while (curr !== null) {
      if (curr === child) {
        throw new Error(`KObject: cannot add ancestor as child (cycle detected).`);
      }
      curr = curr.parent;
    }
    child._parent = this;
    this._children.set(id, child);
  }

  removeChild(id: string): void {
    const child = this._children.get(id);
    if (child) {
      child._parent = null;
      this._children.delete(id);
    }
  }

  getChild(id: string): KObject | undefined {
    return this._children.get(id);
  }

  children(): [string, KObject][] {
    return [...this._children.entries()];
  }

  getChildrenRegistrations(): [string, KObject, string][] {
    return [];
  }

  localMatrix(): Matrix {
    return compose(
      translate(this._x, this._y),
      rotate(this._rotation),
      scale(this._scale)
    );
  }

  worldMatrix(): Matrix {
    if (!this._parent) {
      return this.localMatrix();
    }
    return compose(this._parent.worldMatrix(), this.localMatrix());
  }

  toWorld(point: KPoint): KPoint {
    return applyToPoint(this.worldMatrix(), point);
  }

  toLocal(point: KPoint): KPoint {
    return applyToPoint(inverse(this.worldMatrix()), point);
  }

  setNow(props: Record<string, unknown>): void {
    for (const [key, val] of Object.entries(props)) {
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);
      if (descriptor && !descriptor.set) {
        // Getter without setter (e.g. frame), try property animator if available
        const animator = this.propertyAnimators[key];
        if (animator) {
          const dummyTl = gsap.timeline();
          animator(val, dummyTl, { duration: 0 });
        }
        continue;
      }
      try {
        (this as Record<string, unknown>)[key] = val;
      } catch {
        // Fallback to property animator if direct assignment fails
        const animator = this.propertyAnimators[key];
        if (animator) {
          const dummyTl = gsap.timeline();
          animator(val, dummyTl, { duration: 0 });
        }
      }
    }
  }

  create(options: { duration?: number; ease?: string } = {}): gsap.core.Timeline {
    const tl = gsap.timeline(options);
    tl.call(() => {
      this._visible = true;
    },undefined, 0);
    for (const [, child] of this._children) {
      tl.add(child.create(options), 0);
    }
    return tl;
  }

  transform(properties: Record<string, unknown>, options: { duration: number; ease?: string }): gsap.core.Timeline {
    const tl = gsap.timeline();
    for (const [prop, value] of Object.entries(properties)) {
      const animator = this.propertyAnimators[prop];
      if (animator) {
        animator(value, tl, options);
      } else {
        tl.to(this, { [`_${prop}`]: value, ...options }, 0);
      }
    }
    return tl;
  }
}

export default KObject;
