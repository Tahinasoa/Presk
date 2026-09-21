// Draws a KText (primitives/ktext.ts) as a PixiJS Text object. Paired with
// KText under the "text" DSL type — see registry/builtins.ts.

import { Text } from "pixi.js";
import type KText from "@/primitives/ktext";
import KGraphicObject, { type KGraphicObjectParams } from "./kgraphicObject";

export interface KGraphicTextParams extends KGraphicObjectParams {
  object: KText;
  fill?: number;
  fontSize?: number;
}

class KGraphicText extends KGraphicObject {
  private _text: Text;

  constructor(params: KGraphicTextParams) {
    super(params);
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
    this.redraw();
  }

  private get kText(): KText {
    return this._object as KText;
  }

  override redraw(): void {
    const obj = this.kText;

    if (this._text.text !== obj.text) {
      this._text.text = obj.text;
      // TODO(primitives/ktext.ts): once text is measured here, write the
      // real width/height back onto the KText so other objects can anchor
      // against it via topLeft/center/etc.
    }

    this._text.position.set(obj.x, obj.y);
    this._text.scale.set(obj.scale);
    this._text.rotation = obj.rotation;
    this._text.alpha = obj.opacity;
  }

  override destroy(): void {
    this._renderer.remove(this._text);
    this._text.destroy();
  }
}

export default KGraphicText;
