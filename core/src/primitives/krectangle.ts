// KRectangle backs the DSL's `"shape"` type (see registry/builtins.ts).
// It adds visual fill/stroke properties on top of KAbstractRectangle.
//
// No PixiJS import here — see primitives/README.md.

import KAbstractRectangle, { type KAbstractRectangleParams } from "./kabstractRectangle";
import gsap from "gsap";

export interface KRectangleParams extends KAbstractRectangleParams {
  fill?: number | undefined;
  stroke?: number | undefined;
  strokeWidth?: number;
}

class KRectangle extends KAbstractRectangle {
  protected _fill: number | undefined;
  protected _stroke: number | undefined;
  protected _strokeWidth: number;

  constructor({ fill = 0x9c9c9c, stroke = undefined, strokeWidth = 0, ...rest }: KRectangleParams) {
    super(rest);
    this._fill = fill;
    this._stroke = stroke;
    this._strokeWidth = strokeWidth;

    Object.assign(this.propertyAnimators, {
      fill: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        if (value === undefined || opts.duration === 0) {
          this._fill = value as number | undefined;
        } else {
          tl.to(this, { _fill: value, ...opts }, 0);
        }
      },
      stroke: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        if (value === undefined || opts.duration === 0) {
          this._stroke = value as number | undefined;
        } else {
          tl.to(this, { _stroke: value, ...opts }, 0);
        }
      },
      strokeWidth: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        if (opts.duration === 0) {
          this._strokeWidth = value as number;
        } else {
          tl.to(this, { _strokeWidth: value, ...opts }, 0);
        }
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
    tl.to(this, { _scale: finalScale,_visible : true, _opacity: finalOpacity, duration, ease }, 0);
    return tl;
  }

  get fill(): number | undefined {
    return this._fill;
  }

  set fill(value: number | undefined) {
    this._fill = value;
  }

  get stroke(): number | undefined {
    return this._stroke;
  }

  set stroke(value: number | undefined) {
    this._stroke = value;
  }

  get strokeWidth(): number {
    return this._strokeWidth;
  }

  set strokeWidth(value: number) {
    this._strokeWidth = value;
  }
}

export default KRectangle;
