// KObject is the base data class for every object the DSL can create.
// It knows nothing about how it is drawn — no PixiJS import is allowed here.

import { compose, translate, rotate, scale, applyToPoint, inverse, type Matrix } from "transformation-matrix";
import type { KPoint } from "./types";
import type KTween from "@/timer/tween/tween";
import { tweenNumber, tweenPoint } from "@/timer/tween/tweenFactory";

export interface KObjectParams {
  id: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
}
export interface TweenOptions{
  id : string,
  startTime : number,
  duration : number,
  easing? : (input:number)=>number
}

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
    for (const [key, value] of Object.entries(props)) {
      const descriptor = this.findPropertyDescriptor(key);
      if (descriptor && !descriptor.set && !descriptor.writable) {
        throw new Error(`KObject: property "${key}" is read-only.`);
      }
      (this as unknown as Record<string, unknown>)[key] = value;
    }
  }

  private findPropertyDescriptor(property: string): PropertyDescriptor | undefined {
    for (let object: object | null = this; object !== null; object = Object.getPrototypeOf(object)) {
      const descriptor = Object.getOwnPropertyDescriptor(object, property);
      if (descriptor) return descriptor;
    }
    return undefined;
  }


  tweenfactory: Record<string, (value: unknown, options: TweenOptions) => KTween> = {
    x: (value, options) => {
      if (typeof value !== "number") {
        throw new Error(`Cannot tween 'x': target value must be a number`);
      }
      return tweenNumber({
        ...options,
        id: `${options.id}:x`,
        target: this,
        property: "x",
        to: value,
      });
    },
    y: (value, options) => {
      if (typeof value !== "number") {
        throw new Error(`Cannot tween 'y': target value must be a number`);
      }
      return tweenNumber({
        ...options,
        id: `${options.id}:y`,
        target: this,
        property: "y",
        to: value,
      });
    },
    pos: (value, options) => {
      if (!isKPoint(value)) {
        throw new Error(`Cannot tween 'pos': target value must be a point`);
      }
      return tweenPoint({
        ...options,
        id: `${options.id}:pos`,
        target: this,
        property: "pos",
        to: value,
      });
    },
    rotation: (value, options) => {
      if (typeof value !== "number") {
        throw new Error(`Cannot tween 'rotation': target value must be a number`);
      }
      return tweenNumber({
        ...options,
        id: `${options.id}:rotation`,
        target: this,
        property: "rotation",
        to: value,
      });
    },
    scale: (value, options) => {
      if (typeof value !== "number") {
        throw new Error(`Cannot tween 'scale': target value must be a number`);
      }
      return tweenNumber({
        ...options,
        id: `${options.id}:scale`,
        target: this,
        property: "scale",
        to: value,
      });
    },
    opacity: (value, options) => {
      if (typeof value !== "number") {
        throw new Error(`Cannot tween 'opacity': target value must be a number`);
      }
      return tweenNumber({
        ...options,
        id: `${options.id}:opacity`,
        target: this,
        property: "opacity",
        to: value,
      });
    },
  };

  getTweens(properties: Record<string, unknown>, options: TweenOptions): KTween[] {
    return Object.entries(properties).map(([property, value]) => {
      if (!Object.hasOwn(this.tweenfactory, property)) {
        throw new Error(`KObject: no tween factory for property "${property}".`);
      }
      return this.tweenfactory[property](value, options);
    });
  }

}

export default KObject;
