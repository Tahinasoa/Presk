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
}

class KGraphicRectangle extends KGraphicObject {
  private _graphics: Graphics;
  private _fill: number;

  constructor(params: KGraphicRectangleParams) {
    super(params);
    this._fill = params.fill ?? 0x9c9c9c;
    this._graphics = new Graphics();
    this._renderer.add(this._graphics);
    this.redraw();
  }

  private get rect(): KRectangle {
    return this._object as KRectangle;
  }

  override redraw(): void {
    const rect = this.rect;

    // Graphics.rect() draws relative to the top-left corner, so we draw
    // centered on (0,0) and let PixiJS's own x/y/rotation/pivot handle the
    // anchor + rotation instead of recomputing corners by hand every frame.
    this._graphics.clear();
    this._graphics.rect(-rect.width / 2, -rect.height / 2, rect.width, rect.height).fill(this._fill);

    const center = rect.center;
    this._graphics.position.set(center.x, center.y);
    this._graphics.rotation = rect.rotation;
    this._graphics.alpha = rect.opacity;
  }

  override destroy(): void {
    this._renderer.remove(this._graphics);
    this._graphics.destroy();
  }
}

export default KGraphicRectangle;
