// KScene is the *data* scene: a registry of every live KObject by id, plus
// the reserved "scene" identifier's own properties (width/height, spec §4).
//
// It deliberately knows nothing about graphics — see KGraphicScene
// (renderer/kgraphicScene.ts) for the visual counterpart that mirrors this
// registry one-to-one via Presk's registry (presk.ts).

import KObject, { type KObjectParams } from "./kobject";

export interface KSceneParams extends KObjectParams {
  width: number;
  height: number;
}

class KScene extends KObject {
  private _width: number;
  private _height: number;

  /** Every live KObject, keyed by its DSL id. Does not include the scene itself. */
  private _objects: Map<string, KObject> = new Map();

  constructor(params: KSceneParams) {
    super(params);
    this._width = params.width;
    this._height = params.height;
  }

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
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
   * "scene" always resolves to this KScene itself.
   */
  get(id: string): KObject | undefined {
    if (id === "scene") return this;
    return this._objects.get(id);
  }

  has(id: string): boolean {
    return id === "scene" || this._objects.has(id);
  }

  /** All live objects, in insertion order. Used by the binding engine and by tick(). */
  all(): KObject[] {
    return [...this._objects.values()];
  }
}

export default KScene;
