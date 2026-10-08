// KText backs the DSL's `"text"` type (see registry/builtins.ts).
// It extends KAbstractRectangle, managing a background frame KRectangle child and text content.

import KAbstractRectangle, { type KAbstractRectangleParams } from "./kabstractRectangle";
import KRectangle from "./krectangle";
import type KObject from "./kobject";
import type { KObjectTweenOptions } from "./kobject";
import KTween from "@/timer/tween/tween";
import type { KPoint } from "./types";

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

    Object.assign(this.tweenFactors, {
      text: this.discreteTweenFactor("text"),
      verticalMargins: this.numberTweenFactor("verticalMargins"),
      horizontalMargins: this.numberTweenFactor("horizontalMargins"),
      margins: this.numberTweenFactor("margins"),
      frame: (value: unknown, options: KObjectTweenOptions) => this.frameTween(value, options),
    });
  }

  private frameTween(value: unknown, options: KObjectTweenOptions): KTween {
    const targetOpacity =
      value === false
        ? 0
        : typeof value === "object" && value !== null && "opacity" in value
          ? (value as { opacity: number }).opacity
          : 1;
    let startOpacity = this._frame.opacity;

    return new KTween({
      id: `${this.id}:frame`,
      target: this,
      startTime: options.startTime ?? 0,
      duration: options.duration ?? 1,
      easing: options.easing,
      init: () => {
        startOpacity = this._frame.opacity;
        if (value !== false) {
          this._frame.visible = true;
          if (value === true) {
            this._frame.setNow({ fill: 0x22222a, stroke: 0x444455, strokeWidth: 2 });
          } else if (typeof value === "object" && value !== null) {
            const frameOptions = value as { fill?: number; stroke?: number; strokeWidth?: number };
            this._frame.setNow({
              fill: "fill" in frameOptions ? frameOptions.fill : undefined,
              stroke: "stroke" in frameOptions ? frameOptions.stroke : undefined,
              strokeWidth:
                frameOptions.strokeWidth ??
                (frameOptions.stroke !== undefined ? 2 : 0),
            });
          } else {
            throw new Error("KText: frame tween value must be a boolean or an options object.");
          }
        }
      },
      render: (_target, progress) => {
        this._frame.opacity = startOpacity + (targetOpacity - startOpacity) * progress;
        if (value === false && progress >= 1) {
          this._frame.visible = false;
        }
      },
    });
  }

  override getChildrenRegistrations(): [string, KObject, string][] {
    return [["frame", this._frame, "rectangle"]];
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
