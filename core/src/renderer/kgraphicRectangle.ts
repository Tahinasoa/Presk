// Draws a KRectangle (primitives/krectangle.ts) as a PixiJS Graphics rect.
// Paired with KRectangle under the "shape" DSL type — see
// registry/builtins.ts.

import { Graphics } from "pixi.js";
import type KRectangle from "@/primitives/krectangle";
import KGraphicObject, { type KGraphicObjectParams } from "./kgraphicObject";

export interface KGraphicRectangleParams extends KGraphicObjectParams {
  object: KRectangle;
  /** Fill color, as a hex number (e.g. 0xff0000). Defaults to a neutral gray. */
  fill?: number;
  stroke?: number;
  strokeWidth?: number;
}

class KGraphicRectangle extends KGraphicObject {
  private _graphics: Graphics;

  constructor(params: KGraphicRectangleParams) {
    super(params);
    this._graphics = new Graphics();
    this._displayObject = this._graphics;
    this._renderer.add(this._graphics);
    this.redraw();
  }

  private get rect(): KRectangle {
    return this._object as KRectangle;
  }

  override redraw(): void {
    const rect = this.rect;

    if (!rect.visible) {
      this._graphics.visible = false;
      return;
    }
    this._graphics.visible = true;

    this._graphics.clear();
    
    // Draw fill and optional stroke
    const g = this._graphics.rect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
    if (rect.fill !== undefined) {
      g.fill(rect.fill);
    }
    if (rect.strokeWidth > 0) {
      g.stroke({ width: rect.strokeWidth, color: rect.stroke });
    }

    const center = rect.center;
    this._graphics.position.set(center.x, center.y);
    this._graphics.rotation = rect.rotation;
    this._graphics.scale.set(rect.scale);
    this._graphics.alpha = rect.opacity;
  }

  override destroy(): void {
    this._renderer.remove(this._graphics);
    this._graphics.destroy();
  }
}

export default KGraphicRectangle;
