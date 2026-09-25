// KGraphicComposite is the base visual class for composite objects (spec §7 / GEMINI.md).
// It owns a PixiJS Container for grouping/z-order/destroy, without applying transforms directly.

import { Container, Matrix } from "pixi.js";
import KGraphicObject, { type KGraphicObjectParams } from "./kgraphicObject";

export interface KGraphicCompositeParams extends KGraphicObjectParams {
  object: any;
}

class KGraphicComposite extends KGraphicObject {
  protected _container: Container = new Container();
  protected _childrenGraphics: Map<string, KGraphicObject> = new Map();

  constructor(params: KGraphicCompositeParams) {
    super(params);
    this._displayObject = this._container;
    this._renderer.add(this._container);
  }

  protected addChildGraphic(id: string, child: KGraphicObject): void {
    this._childrenGraphics.set(id, child);
    this._container.addChild(child.displayObject);
  }

  override redraw(): void {
    const wm = this._object.worldMatrix();
    this._displayObject.setFromMatrix(new Matrix(wm.a, wm.b, wm.c, wm.d, wm.e, wm.f));
    this._displayObject.alpha = this._object.opacity;

    for (const child of this._childrenGraphics.values()) {
      child.redraw();
    }
  }

  override destroy(): void {
    for (const child of this._childrenGraphics.values()) {
      child.destroy();
    }
    this._renderer.remove(this._container);
    this._container.destroy();
  }
}

export default KGraphicComposite;
