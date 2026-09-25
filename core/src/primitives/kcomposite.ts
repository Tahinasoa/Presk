// KComposite is the base data class for composite objects (spec §7 / GEMINI.md).
// It extends KAbstractRectangle so any composite object (like KText or a chart)
// has full geometric properties (width, height, anchors, boundingBox) while
// managing child KObjects. It remains completely free of PixiJS rendering dependencies.

import KAbstractRectangle, { type KAbstractRectangleParams } from "./kabstractRectangle";
import type KObject from "./kobject";
import gsap from "gsap";

export interface KCompositeParams extends KAbstractRectangleParams {
  children?: Record<string, KObject>;
}

class KComposite extends KAbstractRectangle {
  protected _children: Map<string, KObject> = new Map();

  constructor(params: KCompositeParams) {
    super(params);
    if (params.children) {
      for (const [id, child] of Object.entries(params.children)) {
        this.addChild(id, child);
      }
    }
  }

  protected addChild(id: string, child: KObject): void {
    if (this._children.has(id)) {
      throw new Error(`KComposite: a child with id "${id}" already exists.`);
    }
    if (child === this || (child instanceof KComposite && child._children.has(this._id))) {
      throw new Error(`KComposite: cannot add ancestor or self as child (cycle detected).`);
    }
    this._children.set(id, child);
  }

  getChild(id: string): KObject | undefined {
    return this._children.get(id);
  }

  children(): [string, KObject][] {
    return [...this._children.entries()];
  }

  /** Returns array of [childId, childObject, dslTypeName] for recursive scene registration. */
  getChildrenRegistrations(): [string, KObject, string][] {
    return [];
  }

  override create(options: { duration?: number; ease?: string } = {}): gsap.core.Timeline {
    const tl = super.create(options);
    for (const [, child] of this._children) {
      tl.add(child.create(options), 0);
    }
    return tl;
  }
}

export default KComposite;
