import { Graphics } from "pixi.js";
import type KLine from "@/primitives/kline";
import KGraphicObject, { type KGraphicObjectParams } from "./kgraphicObject";

export interface KGraphicLineParams extends KGraphicObjectParams {
  object: KLine;
  /** Line color, as a hex number (e.g. 0xffffff). Defaults to white/gray. */
  stroke?: number;
  /** Line thickness. Defaults to 2. */
  thickness?: number;
  /** Radius of the circles at both ends. Defaults to 4. */
  circleRadius?: number;
  /** Color of the end circles. Defaults to same as stroke. */
  circleFill?: number;
}

class KGraphicLine extends KGraphicObject {
  private _graphics: Graphics;
  private _stroke: number;
  private _thickness: number;
  private _circleRadius: number;
  private _circleFill: number;

  constructor(params: KGraphicLineParams) {
    super(params);
    this._stroke = params.stroke ?? 0x9c9c9c;
    this._thickness = params.thickness ?? 2;
    this._circleRadius = params.circleRadius ?? 4;
    this._circleFill = params.circleFill ?? this._stroke;

    this._graphics = new Graphics();
    this._renderer.add(this._graphics);
    this.redraw();
  }

  private get line(): KLine {
    return this._object as KLine;
  }

  override redraw(): void {
    const line = this.line;

    this._graphics.clear();

    // Draw line
    this._graphics
      .moveTo(line.startX, line.startY)
      .lineTo(line.endX, line.endY)
      .stroke({ width: this._thickness, color: this._stroke });

    // Draw circle at start point
    this._graphics
      .circle(line.startX, line.startY, this._circleRadius)
      .fill(this._circleFill);

    // Draw circle at end point
    this._graphics
      .circle(line.endX, line.endY, this._circleRadius)
      .fill(this._circleFill);

    this._graphics.position.set(line.x, line.y);
    this._graphics.rotation = line.rotation;
    this._graphics.scale.set(line.scale);
    this._graphics.alpha = line.opacity;
  }

  override destroy(): void {
    this._renderer.remove(this._graphics);
    this._graphics.destroy();
  }
}

export default KGraphicLine;
