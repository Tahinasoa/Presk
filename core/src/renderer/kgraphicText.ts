// Draws a KText (primitives/ktext.ts) as a PixiJS Text object inside a KGraphicComposite.

import { Text } from "pixi.js";
import type KText from "@/primitives/ktext";
import KGraphicComposite, { type KGraphicCompositeParams } from "./kgraphicComposite";
import KGraphicRectangle from "./kgraphicRectangle";

export interface KGraphicTextParams extends KGraphicCompositeParams {
  object: KText;
  fill?: number;
  fontSize?: number;
}

class KGraphicText extends KGraphicComposite {
  private _text: Text;
  private _graphicFrame: KGraphicRectangle;

  constructor(params: KGraphicTextParams) {
    super(params);
    const obj = params.object as KText;

    this._graphicFrame = new KGraphicRectangle({
      object: obj.frame,
      renderer: this._renderer,
    });
    this.addChildGraphic("frame", this._graphicFrame);

    this._text = new Text({
      text: obj.text,
      style: {
        fill: params.fill ?? 0xffffff,
        fontSize: params.fontSize ?? 32,
        fontWeight: "700",
      },
    });
    this._text.anchor.set(0.5);
    this._container.addChild(this._text);

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
      this._container.visible = false;
      return;
    }
    this._container.visible = true;

    if (this._text.text !== obj.text) {
      this._text.text = obj.text;
      obj.width = this._text.width;
      obj.height = this._text.height;
      obj.frame.width = this._text.width + obj.horizontalMargins * 2;
      obj.frame.height = this._text.height + obj.verticalMargins * 2;
    }

    super.redraw();
  }

  override destroy(): void {
    this._text.destroy();
    super.destroy();
  }
}

export default KGraphicText;
