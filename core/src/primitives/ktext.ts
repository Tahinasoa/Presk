// KText backs the DSL's `"text"` type (see registry/builtins.ts).
// It extends KAbstractRectangle, managing a background frame KRectangle child and text content.

import KAbstractRectangle, { type KAbstractRectangleParams } from "./kabstractRectangle";
import KRectangle from "./krectangle";
import type KObject from "./kobject";
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

    const vMargins = margins !== undefined ? margins : verticalMargins;
    const hMargins = margins !== undefined ? margins : horizontalMargins;

    const frameRect = new KRectangle({
      ...rest,
      id: `${rest.id}_frame`,
      x: 0,
      y: 0,
      width: width + hMargins * 2,
      height: height + vMargins * 2,
      anchorX: 0.5,
      anchorY: 0.5,
      scale: 1,
      rotation: 0,
      opacity: 1,
      fill: frameFill,
      stroke: frameStroke,
      strokeWidth: frameStrokeWidth,
    });
    frameRect.visible = frameVisible;

    this.addChild("frame", frameRect);

    this._text = text;
    this._verticalMargins = vMargins;
    this._horizontalMargins = hMargins;
    this._frame = frameRect;

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

  override getChildrenRegistrations(): [string, KObject, string][] {
    return [["frame", this._frame, "shape"]];
  }

  override get boundingBox(): { topLeft: KPoint; topRight: KPoint; bottomLeft: KPoint; bottomRight: KPoint; center: KPoint } {
    return this._frame.boundingBox;
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

  override set width(value: number) {
    this._width = value;
    this._frame.width = value + this._horizontalMargins * 2;
  }

  override set height(value: number) {
    this._height = value;
    this._frame.height = value + this._verticalMargins * 2;
  }
}

export default KText;
