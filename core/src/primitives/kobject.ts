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

export interface KObjectParams {
  id: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
}

class KObject {
  /** Discriminant used by the registry/compiler; each subclass overrides it. */
  readonly type: string = "KObject";

  protected _id: string;
  protected _x: number;
  protected _y: number;
  protected _scale: number;
  protected _rotation: number;
  protected _opacity: number;

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
