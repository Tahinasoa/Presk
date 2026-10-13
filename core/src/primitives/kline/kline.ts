import KObject, { type KObjectParams, type TweenOptions } from "@/primitives/kobject/kobject";
import type KTween from "@/timer/tween/tween";
import { tweenNumber } from "@/timer/tween/tweenFactory";

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

    Object.assign(this.tweenfactory, {
      startX: this.numberTweenFactory("startX"),
      startY: this.numberTweenFactory("startY"),
      endX: this.numberTweenFactory("endX"),
      endY: this.numberTweenFactory("endY"),
      stroke: this.numberTweenFactory("stroke"),
      thickness: this.numberTweenFactory("thickness"),
    });
  }

  private numberTweenFactory(property: "startX" | "startY" | "endX" | "endY" | "stroke" | "thickness") {
    return (value: unknown, options: TweenOptions): KTween => {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(`Cannot tween '${property}': target value must be a finite number`);
      }
      return tweenNumber({
        ...options,
        id: `${options.id}:${property}`,
        target: this,
        property,
        to: value,
      });
    };
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
