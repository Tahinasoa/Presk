// KScene is the *data* scene: a registry of every live KObject by id, plus
// the reserved "scene" identifier's own properties (width/height, spec §4).
//
// It deliberately knows nothing about graphics — see KGraphicScene
// (renderer/kgraphicScene.ts) for the visual counterpart that mirrors this
// registry one-to-one via Presk's registry (presk.ts).

import KAbstractRectangle, { type KAbstractRectangleParams } from "./kabstractRectangle";
import type KObject from "./kobject";

export interface KSceneParams extends KAbstractRectangleParams {
  // width and height are inherited from KAbstractRectangle
}

class KScene extends KAbstractRectangle {
  /** Every live KObject, keyed by its DSL id. Does not include the scene itself. */
  private _objects: Map<string, KObject> = new Map();

  constructor(params: KSceneParams) {
    super(params);
  }

  /** Registers an object so it becomes resolvable as `<id>.<prop>` in expressions. */
  add(object: KObject): void {
    if (this._objects.has(object.id)) {
      throw new Error(`KScene: an object with id "${object.id}" already exists.`);
    }
    this._objects.set(object.id, object);
  }

  remove(id: string): void {
    this._objects.delete(id);
  }

  /**
   * Resolves an identifier from an expression (spec §8). The reserved id
   * "scene" always resolves to this KScene itself. Supports nested IDs (e.g. "chart1.bar1").
   */
  get(id: string): KObject | undefined {
    if (id === "scene") return this;
    if (this._objects.has(id)) return this._objects.get(id);

    // Support nested ids like "chart1.bar1" or "text1.frame"
    const parts = id.split(".");
    if (parts.length > 1) {
      let current: KObject | undefined = this._objects.get(parts[0]);
      for (let i = 1; i < parts.length; i++) {
        if (current) {
          current = current.getChild(parts[i]);
        } else {
          return undefined;
        }
      }
      return current;
    }
    return undefined;
  }

  has(id: string): boolean {
    return id === "scene" || this.get(id) !== undefined;
  }

  /** All live objects, in insertion order. Used by the binding engine and by tick(). */
  all(): KObject[] {
    return [...this._objects.values()];
  }
}

export default KScene;
