// Draws a KText (primitives/ktext.ts) as a PixiJS Text object. Paired with
// KText under the "text" DSL type — see registry/builtins.ts.

import { Text } from "pixi.js";
import type KText from "@/primitives/ktext";
import KGraphicObject, { type KGraphicObjectParams } from "./kgraphicObject";
import KGraphicRectangle from "./kgraphicRectangle";

export interface KGraphicTextParams extends KGraphicObjectParams {
  object: KText;
  fill?: number;
  fontSize?: number;
}

class KGraphicText extends KGraphicObject {
  private _text: Text;
  private _graphicFrame: KGraphicRectangle;

  constructor(params: KGraphicTextParams) {
    super(params);
    this._graphicFrame = new KGraphicRectangle({
      object: this.kText.frame,
      renderer: this._renderer,
    });

    this._text = new Text({
      text: params.object.text,
      style: {
        fill: params.fill ?? 0xffffff,
        fontSize: params.fontSize ?? 32,
        fontWeight: "700",
      },
    });
    this._text.anchor.set(0.5);
    this._renderer.add(this._text);

    this.kText.width = this._text.width;
    this.kText.height = this._text.height;

    this.redraw();
  }

  private get kText(): KText {
    return this._object as KText;
  }

  override redraw(): void {
    const obj = this.kText;

    if (!obj.visible) {
      this._text.visible = false;
      this._graphicFrame.redraw();
      return;
    }
    this._text.visible = true;

    if (this._text.text !== obj.text) {
      this._text.text = obj.text;
      this.kText.width = this._text.width;
      this.kText.height = this._text.height;
    }

    const frame = obj.frame;
    frame.x = obj.x;
    frame.y = obj.y;
    frame.width = this._text.width + obj.horizontalMargins * 2;
    frame.height = this._text.height + obj.verticalMargins * 2;
    frame.scale = obj.scale;
    frame.rotation = obj.rotation;
    frame.opacity = obj.opacity;
    frame.anchorX = obj.anchorX;
    frame.anchorY = obj.anchorY;

    this._graphicFrame.redraw();

    this._text.position.set(obj.x, obj.y);
    this._text.scale.set(obj.scale);
    this._text.rotation = obj.rotation;
    this._text.alpha = obj.opacity;
  }

  override destroy(): void {
    this._renderer.remove(this._text);
    this._text.destroy();
    this._graphicFrame.destroy();
  }
}

export default KGraphicText;
