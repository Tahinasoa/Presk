// KObject is the base "data" class for every object the DSL can `create`
// (spec §4.1). It knows nothing about how it is drawn — no PixiJS import is
// allowed in this file, ever (see primitives/README.md).
//
// It exists so that:
//   - the binding engine (binding/) can read/write `x`, `y`, `scale`,
//     `rotation`, `opacity` uniformly on any object type;
//   - GSAP can tween these same properties directly, e.g.
//     `gsap.to(kObject, { x: 100 })`, since they're plain getters/setters
//     on a plain object.

import gsap from "gsap";

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

  protected propertyAnimators: Record<string, PropertyAnimator> = {
    x: (value, tl, opts) => {
      tl.to(this, { _x: value, ...opts }, 0);
    },
    y: (value, tl, opts) => {
      tl.to(this, { _y: value, ...opts }, 0);
    },
    pos: (value, tl, opts) => {
      const { x, y } = value as { x: number; y: number };
      this.propertyAnimators.x(x, tl, opts);
      this.propertyAnimators.y(y, tl, opts);
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
  };

  create(options: { duration?: number; ease?: string } = {}): gsap.core.Timeline {
    const duration = options.duration ?? 0.4;
    const ease = options.ease ?? "power2.out";
    const tl = gsap.timeline();
    
    const targetX = this._x;
    const targetY = this._y;
    const targetOpacity = this._opacity;

    // Start slightly above and transparent, dropping onto the target data
    this._x = targetX;
    this._y = targetY - 40;
    this._opacity = 0;

    tl.to(this, { _x: targetX, _y: targetY, _opacity: targetOpacity, duration, ease }, 0);
    return tl;
  }

  transform(data: Record<string, unknown>, options: { duration: number; ease?: string }): gsap.core.Timeline {
    const tl = gsap.timeline();
    for (const [key, value] of Object.entries(data)) {
      const animator = this.propertyAnimators[key];
      if (!animator) {
        throw new Error(`${this.constructor.name}: no animator registered for property "${key}".`);
      }
      animator(value, tl, options);
    }
    return tl;
  }

  setNow(data: Record<string, unknown>): void {
    const tl = this.transform(data, { duration: 0 });
    tl.progress(1);
  }

  constructor({ id, x, y, scale = 1, rotation = 0, opacity = 1 }: KObjectParams) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._scale = scale;
    this._rotation = rotation;
    this._opacity = opacity;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get x(): number {
    return this._x;
  }

  set x(value: number) {
    this._x = value;
  }

  get y(): number {
    return this._y;
  }

  set y(value: number) {
    this._y = value;
  }

  get pos(): { x: number; y: number } {
    return { x: this._x, y: this._y };
  }

  set pos(value: { x: number; y: number }) {
    this._x = value.x;
    this._y = value.y;
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
}

export default KObject;
