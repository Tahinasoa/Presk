import KObject, { type KObjectParams } from "./kobject";
import type KTween from "@/timer/tween/tween";
import type { KObjectCreateOptions } from "./kobject";

export interface KLineParams extends KObjectParams {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  stroke?: number;
  thickness?: number;
}

class KLine extends KObject {
  private _startX: number;
  private _startY: number;
  private _endX: number;
  private _endY: number;
  private _stroke: number;
  private _thickness: number;

  constructor({ startX, startY, endX, endY, stroke = 0x9c9c9c, thickness = 2, ...rest }: KLineParams) {
    super(rest);
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    this._stroke = stroke;
    this._thickness = thickness;

    Object.assign(this.tweenFactors, {
      startX: this.numberTweenFactor("startX"),
      startY: this.numberTweenFactor("startY"),
      endX: this.numberTweenFactor("endX"),
      endY: this.numberTweenFactor("endY"),
      stroke: this.numberTweenFactor("stroke"),
      thickness: this.numberTweenFactor("thickness"),
    });
  }

  override create(options: KObjectCreateOptions = {}): KTween[] {
    const duration = options.duration ?? 0.6;
    const targetEndX = this._endX;
    const targetEndY = this._endY;
    this._endX = this._startX;
    this._endY = this._startY;
    this.visible = true;
    return [
      this.tween("endX", targetEndX, { duration, easing: options.easing }),
      this.tween("endY", targetEndY, { duration, easing: options.easing }),
    ];
  }

  get startX(): number {
    return this._startX;
  }

  set startX(value: number) {
    this._startX = value;
  }

  get startY(): number {
    return this._startY;
  }

  set startY(value: number) {
    this._startY = value;
  }

  get endX(): number {
    return this._endX;
  }

  set endX(value: number) {
    this._endX = value;
  }

  get endY(): number {
    return this._endY;
  }

  set endY(value: number) {
    this._endY = value;
  }

  get stroke(): number {
    return this._stroke;
  }

  set stroke(value: number) {
    this._stroke = value;
  }

  get thickness(): number {
    return this._thickness;
  }

  set thickness(value: number) {
    this._thickness = value;
  }
}

export default KLine;
