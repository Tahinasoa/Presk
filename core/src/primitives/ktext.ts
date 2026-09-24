// KText backs the DSL's `"text"` type (see registry/builtins.ts).
// It reuses KAbstractRectangle for its geometry (a text block still has a
// width/height box that other objects can anchor to via §4.2/§4.3), and
// adds the `text` string content itself, along with margin and framing support.

import KAbstractRectangle, { type KAbstractRectangleParams } from "./kabstractRectangle";
import KRectangle from "./krectangle";
import type { KPoint } from "./types";
import gsap from "gsap";

export interface KTextParams extends Omit<KAbstractRectangleParams, "width" | "height"> {
  text: string;
  width?: number;
  height?: number;
  verticalMargins?: number;
  horizontalMargins?: number;
  margins?: number;
  frame?: boolean | { fill?: number; stroke?: number; strokeWidth?: number; opacity?: number };
}

class KText extends KAbstractRectangle {
  private _text: string;
  protected _verticalMargins: number;
  protected _horizontalMargins: number;
  private _frame: KRectangle;

  constructor({ text, width = 0, height = 0, verticalMargins = 30, horizontalMargins = 30, margins, frame, ...rest }: KTextParams) {
    super({ ...rest, width, height });
    this._text = text;
    this._verticalMargins = margins !== undefined ? margins : verticalMargins;
    this._horizontalMargins = margins !== undefined ? margins : horizontalMargins;

    let frameVisible = false;
    let frameFill: number | undefined = 0x22222a;
    let frameStroke: number | undefined = 0x444455;
    let frameStrokeWidth = 2;

    if (frame === true) {
      frameVisible = true;
    } else if (frame && typeof frame === "object") {
      frameVisible = true;
      frameFill = "fill" in frame ? frame.fill : undefined;
      frameStroke = "stroke" in frame ? frame.stroke : undefined;
      frameStrokeWidth = frame.strokeWidth ?? (frameStroke !== undefined ? 2 : 0);
    }

    this._frame = new KRectangle({
      ...rest,
      id: `${this._id}_frame`,
      x: this._x,
      y: this._y,
      width: width + this._horizontalMargins * 2,
      height: height + this._verticalMargins * 2,
      anchorX: this._anchorX,
      anchorY: this._anchorY,
      scale: this._scale,
      rotation: this._rotation,
      opacity: this._opacity,
      fill: frameFill,
      stroke: frameStroke,
      strokeWidth: frameStrokeWidth,
    });
    this._frame.visible = frameVisible;

    Object.assign(this.propertyAnimators, {
      text: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _text: value, ...opts }, 0);
      },
      verticalMargins: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _verticalMargins: value, ...opts }, 0);
      },
      horizontalMargins: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _horizontalMargins: value, ...opts }, 0);
      },
      margins: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _verticalMargins: value, _horizontalMargins: value, ...opts }, 0);
      },
      frame: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        const duration = opts.duration ?? 0;
        if (duration === 0) {
          if (typeof value === "boolean") {
            this._frame.visible = value;
            if (value) {
              this._frame.setNow({
                fill: 0x22222a,
                stroke: 0x444455,
                strokeWidth: 2,
                opacity: 1,
              });
            } else {
              this._frame.setNow({ opacity: 0 });
            }
          } else if (value && typeof value === "object") {
            this._frame.visible = true;
            const frameOpts = value as { fill?: number; stroke?: number; strokeWidth?: number; opacity?: number };
            const updateData: Record<string, unknown> = {
              opacity: "opacity" in frameOpts ? frameOpts.opacity : 1,
              fill: "fill" in frameOpts ? frameOpts.fill : undefined,
              stroke: "stroke" in frameOpts ? frameOpts.stroke : undefined,
              strokeWidth: "strokeWidth" in frameOpts ? frameOpts.strokeWidth : ("stroke" in frameOpts && frameOpts.stroke !== undefined ? 2 : 0),
            };
            this._frame.setNow(updateData);
          }
        } else {
          if (typeof value === "boolean") {
            if (value) {
              tl.call(() => {
                this._frame.visible = true;
              }, undefined, 0);
              tl.add(
                this._frame.transform({
                  fill: 0x22222a,
                  stroke: 0x444455,
                  strokeWidth: 2,
                  opacity: 1,
                }, opts),
                0
              );
            } else {
              tl.add(
                this._frame.transform({
                  opacity: 0,
                }, opts),
                0
              );
              tl.call(() => {
                this._frame.visible = false;
              }, undefined, `+=${duration}`);
            }
          } else if (value && typeof value === "object") {
            tl.call(() => {
              this._frame.visible = true;
            }, undefined, 0);
            const frameOpts = value as { fill?: number; stroke?: number; strokeWidth?: number; opacity?: number };
            const updateData: Record<string, unknown> = {
              opacity: "opacity" in frameOpts ? frameOpts.opacity : 1,
              fill: "fill" in frameOpts ? frameOpts.fill : undefined,
              stroke: "stroke" in frameOpts ? frameOpts.stroke : undefined,
              strokeWidth: "strokeWidth" in frameOpts ? frameOpts.strokeWidth : ("stroke" in frameOpts && frameOpts.stroke !== undefined ? 2 : 0),
            };
            tl.add(this._frame.transform(updateData, opts), 0);
          }
        }
      },
    });
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
  }

  get frame(): KRectangle {
    return this._frame;
  }

  get verticalMargins(): number {
    return this._verticalMargins;
  }

  set verticalMargins(value: number) {
    this._verticalMargins = value;
    this._frame.height = this._height + this._verticalMargins * 2;
  }

  get horizontalMargins(): number {
    return this._horizontalMargins;
  }

  set horizontalMargins(value: number) {
    this._horizontalMargins = value;
    this._frame.width = this._width + this._horizontalMargins * 2;
  }

  get margins(): number {
    return this._horizontalMargins;
  }

  set margins(value: number) {
    this._verticalMargins = value;
    this._horizontalMargins = value;
    this._frame.width = this._width + this._horizontalMargins * 2;
    this._frame.height = this._height + this._verticalMargins * 2;
  }

  override get boundingBox(): { topLeft: KPoint; topRight: KPoint; bottomLeft: KPoint; bottomRight: KPoint; center: KPoint } {
    return this._frame.boundingBox;
  }

  override get x(): number {
    return this._x;
  }

  override set x(value: number) {
    this._x = value;
    this._frame.x = value;
  }

  override get y(): number {
    return this._y;
  }

  override set y(value: number) {
    this._y = value;
    this._frame.y = value;
  }

  override get width(): number {
    return this._width;
  }

  override set width(value: number) {
    this._width = value;
    this._frame.width = value + this._horizontalMargins * 2;
  }

  override get height(): number {
    return this._height;
  }

  override set height(value: number) {
    this._height = value;
    this._frame.height = value + this._verticalMargins * 2;
  }

  override get scale(): number {
    return this._scale;
  }

  override set scale(value: number) {
    this._scale = value;
    this._frame.scale = value;
  }

  override get rotation(): number {
    return this._rotation;
  }

  override set rotation(value: number) {
    this._rotation = value;
    this._frame.rotation = value;
  }

  override get opacity(): number {
    return this._opacity;
  }

  override set opacity(value: number) {
    this._opacity = value;
    this._frame.opacity = value;
  }

  override get anchorX(): number {
    return this._anchorX;
  }

  override set anchorX(value: number) {
    this._anchorX = value;
    this._frame.anchorX = value;
  }

  override get anchorY(): number {
    return this._anchorY;
  }

  override set anchorY(value: number) {
    this._anchorY = value;
    this._frame.anchorY = value;
  }

  override create(options: { duration?: number; ease?: string } = {}): gsap.core.Timeline {
    void gsap;
    const tl = super.create(options);
    if (this._frame && this._frame.visible) {
      tl.add(this._frame.create(options), 0);
    }
    return tl;
  }
}

export default KText;
