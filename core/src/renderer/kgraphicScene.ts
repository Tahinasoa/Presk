// KGraphicScene is the visual counterpart of KScene (primitives/kscene.ts):
// a registry of every live KGraphicObject, keyed by the same id as its
// paired KObject. Presk keeps the two registries in lockstep on every
// create()/destroy() call (see presk.ts).

import type KGraphicObject from "./kgraphicObject";

class KGraphicScene {
  private _graphicObjects: Map<string, KGraphicObject> = new Map();
  private _rootGraphicObjects: Map<string, KGraphicObject> = new Map();

  add(id: string, graphicObject: KGraphicObject, isRoot = true): void {
    this._graphicObjects.set(id, graphicObject);
    if (isRoot) {
      this._rootGraphicObjects.set(id, graphicObject);
    }
  }

  remove(id: string): void {
    const graphicObject = this._graphicObjects.get(id);
    graphicObject?.destroy();
    this._graphicObjects.delete(id);
    this._rootGraphicObjects.delete(id);
  }

  get(id: string): KGraphicObject | undefined {
    return this._graphicObjects.get(id);
  }

  /** Redraws every live root graphic object (children are redrawn recursively by their composite parent). Called once per frame by Presk's ticker. */
  tick(): void {
    for (const graphicObject of this._rootGraphicObjects.values()) {
      graphicObject.redraw();
    }
  }
}

export default KGraphicScene;
