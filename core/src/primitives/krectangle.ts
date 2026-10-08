// KRectangle backs the DSL's `"shape"` type (see registry/builtins.ts).
// It adds visual fill/stroke properties on top of KAbstractRectangle.
//
// No PixiJS import here — see primitives/README.md.

import KAbstractRectangle, { type KAbstractRectangleParams } from "./kabstractRectangle";
import type KTween from "@/timer/tween/tween";
import type { KObjectCreateOptions, KObjectTweenOptions } from "./kobject";

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

    Object.assign(this.tweenFactors, {
      fill: (value: unknown, options: KObjectTweenOptions) =>
        value === undefined
          ? this.discreteTweenFactor("fill")(value, options)
          : this.numberTweenFactor("fill")(value, options),
      stroke: (value: unknown, options: KObjectTweenOptions) =>
        value === undefined
          ? this.discreteTweenFactor("stroke")(value, options)
          : this.numberTweenFactor("stroke")(value, options),
      strokeWidth: this.numberTweenFactor("strokeWidth"),
    });
  }

  override create(options: KObjectCreateOptions = {}): KTween[] {
    const duration = options.duration ?? 0.4;
    const finalScale = this._scale;
    const finalOpacity = this._opacity;
    this._scale = 0;
    this._opacity = 0;
    this.visible = true;
    return [
      this.tween("scale", finalScale, { duration, easing: options.easing }),
      this.tween("opacity", finalOpacity, { duration, easing: options.easing }),
    ];
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
