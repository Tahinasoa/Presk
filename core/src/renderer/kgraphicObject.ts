// KGraphicObject is the base class for every visual (PixiJS-backed)
// component. It holds a reference to a KObject and is responsible for
// reading its current state and pushing it to PixiJS — never the reverse.
// See renderer/README.md for the full contract.

import type KObject from "@/primitives/kobject";
import type KRenderer from "./krenderer";
import type { Container } from "pixi.js";

export interface KGraphicObjectParams {
  renderer: KRenderer;
  object: KObject;
}

abstract class KGraphicObject {
  protected _object: KObject;
  protected _renderer: KRenderer;
  protected _displayObject!: Container;

  constructor({ object, renderer }: KGraphicObjectParams) {
    this._object = object;
    this._renderer = renderer;
  }

  get displayObject(): Container {
    return this._displayObject;
  }

  /** Re-reads `this._object`'s current state and updates the PixiJS display object. */
  abstract redraw(): void;

  /** Detaches and disposes the underlying PixiJS display object(s). */
  abstract destroy(): void;
}

export default KGraphicObject;
