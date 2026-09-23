import KObject, { type KObjectParams } from "./kobject";
import gsap from "gsap";

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

    Object.assign(this.propertyAnimators, {
      startX: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { startX: value, ...opts }, 0);
      },
      startY: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { startY: value, ...opts }, 0);
      },
      endX: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { endX: value, ...opts }, 0);
      },
      endY: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { endY: value, ...opts }, 0);
      },
      stroke: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _stroke: value, ...opts }, 0);
      },
      thickness: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _thickness: value, ...opts }, 0);
      },
    });
  }

  override createAnimation(options: { duration?: number; ease?: string } = {}): gsap.core.Timeline {
    const duration = options.duration ?? 0.6;
    const ease = options.ease ?? "power2.out";
    const tl = gsap.timeline();
    
    // Animate line drawing from start point to full end point
    const targetEndX = this._endX;
    const targetEndY = this._endY;
    this._endX = this._startX;
    this._endY = this._startY;

    tl.to(this, { endX: targetEndX, endY: targetEndY, duration, ease }, 0);
    return tl;
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
