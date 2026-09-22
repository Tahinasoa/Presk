// KText backs the DSL's `"text"` type (see registry/builtins.ts).
// It reuses KRectangle for its geometry (a text block still has a
// width/height box that other objects can anchor to via §4.2/§4.3), and
// adds the `text` string content itself.
//
// TODO: width/height are currently caller-provided or default to 0; a real
// implementation should measure the rendered text (e.g. via a PixiJS
// TextMetrics call in KGraphicText) and write the result back here so that
// `someText.width` is accurate for other objects to bind against.

import KRectangle, { type KRectangleParams } from "./krectangle";

export interface KTextParams extends Omit<KRectangleParams, "width" | "height"> {
  text: string;
  width?: number;
  height?: number;
}

class KText extends KRectangle {
  private _text: string;

  constructor({ text, width = 0, height = 0, ...rest }: KTextParams) {
    super({ ...rest, width, height });
    this._text = text;
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
  }
}

export default KText;
