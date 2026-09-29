// Draws a KText (primitives/ktext.ts) as a PixiJS Text object directly managed alongside its frame.

import { Text, Matrix } from "pixi.js";
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
    const obj = params.object as KText;

    this._graphicFrame = new KGraphicRectangle({
      object: obj.frame,
      renderer: this._renderer,
    });

    this._text = new Text({
      text: obj.text,
      style: {
        fill: params.fill ?? 0xffffff,
        fontSize: params.fontSize ?? 32,
        fontWeight: "700",
      },
    });
    this._text.anchor.set(0.5);
    this._renderer.add(this._text);

    obj.width = this._text.width;
    obj.height = this._text.height;
    obj.frame.width = this._text.width + obj.horizontalMargins * 2;
    obj.frame.height = this._text.height + obj.verticalMargins * 2;

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
      obj.width = this._text.width;
      obj.height = this._text.height;
      obj.frame.width = this._text.width + obj.horizontalMargins * 2;
      obj.frame.height = this._text.height + obj.verticalMargins * 2;
    }

    const wm = this._object.worldMatrix();
    this._text.setFromMatrix(new Matrix(wm.a, wm.b, wm.c, wm.d, wm.e, wm.f));
    this._text.alpha = this._object.opacity;

    this._graphicFrame.redraw();
  }

  override destroy(): void {
    this._text.destroy();
    this._renderer.remove(this._text);
    this._graphicFrame.destroy();
  }
}

export default KGraphicText;
