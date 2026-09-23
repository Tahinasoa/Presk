import { Graphics } from "pixi.js";
import type KLine from "@/primitives/kline";
import KGraphicObject, { type KGraphicObjectParams } from "./kgraphicObject";

export interface KGraphicLineParams extends KGraphicObjectParams {
  object: KLine;
  /** Radius of the circles at both ends. Defaults to 4. */
  circleRadius?: number;
}

class KGraphicLine extends KGraphicObject {
  private _graphics: Graphics;
  private _circleRadius: number;

  constructor(params: KGraphicLineParams) {
    super(params);
    this._circleRadius = params.circleRadius ?? 4;

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

    const stroke = line.stroke;
    const thickness = line.thickness;

    // Draw line
    this._graphics
      .moveTo(line.startX, line.startY)
      .lineTo(line.endX, line.endY)
      .stroke({ width: thickness, color: stroke });

    // Draw circle at start point
    this._graphics
      .circle(line.startX, line.startY, this._circleRadius)
      .fill(stroke);

    // Draw circle at end point
    this._graphics
      .circle(line.endX, line.endY, this._circleRadius)
      .fill(stroke);

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
