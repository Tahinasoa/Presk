// KText backs the DSL's `"text"` type (see registry/builtins.ts).
// It extends KRectangle and manages its frame as a KObject child.

import KRectangle, { type KRectangleParams } from "@/primitives/krectangle/krectangle";
import type KObject from "@/primitives/kobject/kobject";
import type { TweenOptions } from "@/primitives/kobject/kobject";
import KTween from "@/timer/tween/tween";
import { tweenNumber } from "@/timer/tween/tweenFactory";
import type { KPoint } from "@/primitives/types";

export interface KTextFrameOptions {
  fill?: number;
  stroke?: number;
  strokeWidth?: number;
  opacity?: number;
}

export interface KTextParams extends Omit<KRectangleParams, "width" | "height"> {
  text: string;
  width?: number;
  height?: number;
  verticalMargins?: number;
  horizontalMargins?: number;
  margins?: number;
  frame?: boolean | KTextFrameOptions;
}

class KText extends KRectangle {
  private _text: string;
  protected _verticalMargins: number;
  protected _horizontalMargins: number;
  private _frame: KRectangle;

  constructor({ text, width = 0, height = 0, verticalMargins = 30, horizontalMargins = 30, margins, frame, ...rest }: KTextParams) {
    super({ ...rest, width, height });

    const vMargins = margins !== undefined ? margins : verticalMargins;
    const hMargins = margins !== undefined ? margins : horizontalMargins;
    const frameOptions = typeof frame === "object" ? frame : undefined;
    const frameVisible = frame === true || frameOptions !== undefined;
    const frameStroke = frameOptions ? frameOptions.stroke : 0x444455;
    const frameFill = frameOptions ? frameOptions.fill : 0x22222a;
    const frameStrokeWidth = frameOptions?.strokeWidth ?? (frameStroke !== undefined ? 2 : 0);

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
      opacity: frameOptions?.opacity ?? 1,
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

    Object.assign(this.tweenfactory, {
      text: (value: unknown, options: TweenOptions) => this.textTween(value, options),
      verticalMargins: this.numberTweenFactory("verticalMargins"),
      horizontalMargins: this.numberTweenFactory("horizontalMargins"),
      margins: this.numberTweenFactory("margins"),
      frame: (value: unknown, options: TweenOptions) => this.frameTween(value, options),
    });
  }

  private numberTweenFactory(property: "verticalMargins" | "horizontalMargins" | "margins") {
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

  private textTween(value: unknown, options: TweenOptions): KTween {
    if (typeof value !== "string") {
      throw new Error("Cannot tween 'text': target value must be a string");
    }
    return new KTween({
      id: `${options.id}:text`,
      target: this,
      startTime: options.startTime,
      duration: options.duration,
      // Text is discrete; using linear progress keeps the switch at the end.
      easing: (progress) => progress,
      init: (_target, tween) => {
        tween.data = { from: this._text, to: value };
      },
      render: (_target, progress, data) => {
        this._text = progress < 1 ? data?.from as string : data?.to as string;
      },
    });
  }

  private frameTween(value: unknown, options: TweenOptions): KTween {
    if (value !== false && value !== true && (typeof value !== "object" || value === null)) {
      throw new Error("KText: frame tween value must be a boolean or an options object.");
    }

    const frameOptions = typeof value === "object" && value !== null
      ? value as KTextFrameOptions
      : undefined;
    const targetOpacity = value === false ? 0 : frameOptions?.opacity ?? 1;

    return new KTween({
      id: `${options.id}:frame`,
      target: this,
      startTime: options.startTime,
      duration: options.duration,
      easing: options.easing,
      init: (_target, tween) => {
        tween.data = { startOpacity: this._frame.opacity };
        if (value !== false) {
          this._frame.visible = true;
          if (value === true) {
            this._frame.setNow({ fill: 0x22222a, stroke: 0x444455, strokeWidth: 2 });
          } else {
            this._frame.setNow({
              fill: "fill" in frameOptions! ? frameOptions!.fill : undefined,
              stroke: "stroke" in frameOptions! ? frameOptions!.stroke : undefined,
              strokeWidth: frameOptions!.strokeWidth ?? (frameOptions!.stroke !== undefined ? 2 : 0),
            });
          }
        }
      },
      render: (_target, progress, data) => {
        const startOpacity = data?.startOpacity as number;
        this._frame.opacity = startOpacity + (targetOpacity - startOpacity) * progress;
        this._frame.visible = value !== false || progress < 1;
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

  set frame(value: unknown) {
    if (value === false) {
      this._frame.visible = false;
      return;
    }
    if (value === true) {
      this._frame.setNow({ fill: 0x22222a, stroke: 0x444455, strokeWidth: 2 });
      this._frame.opacity = 1;
      this._frame.visible = true;
      return;
    }
    if (typeof value === "object" && value !== null) {
      const options = value as KTextFrameOptions;
      this._frame.setNow({
        fill: "fill" in options ? options.fill : undefined,
        stroke: "stroke" in options ? options.stroke : undefined,
        strokeWidth: options.strokeWidth ?? (options.stroke !== undefined ? 2 : 0),
      });
      this._frame.opacity = options.opacity ?? 1;
      this._frame.visible = true;
      return;
    }
    throw new Error("KText: frame value must be a boolean or an options object.");
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
