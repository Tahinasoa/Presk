// KText backs the DSL's `"text"` type (see registry/builtins.ts).
// It reuses KAbstractRectangle for its geometry (a text block still has a
// width/height box that other objects can anchor to via §4.2/§4.3), and
// adds the `text` string content itself.
//
// TODO: width/height are currently caller-provided or default to 0; a real
// implementation should measure the rendered text (e.g. via a PixiJS
// TextMetrics call in KGraphicText) and write the result back here so that
// `someText.width` is accurate for other objects to bind against.

import KAbstractRectangle, { type KAbstractRectangleParams } from "./kabstractRectangle";
import gsap from "gsap";

export interface KTextParams extends KAbstractRectangleParams {
  text: string;
}

class KText extends KAbstractRectangle {
  private _text: string;

  constructor({ text, width = 0, height = 0, ...rest }: KTextParams) {
    super({ ...rest, width, height });
    this._text = text;

    Object.assign(this.propertyAnimators, {
      text: (value: unknown, tl: gsap.core.Timeline, opts: { duration: number; ease?: string }) => {
        tl.to(this, { _text: value, ...opts }, 0);
      },
    });
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
  }
}

export default KText;
