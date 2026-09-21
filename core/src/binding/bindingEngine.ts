// BindingEngine implements the DSL's `follow`/`unfollow` actions (spec §10)
// as a pull-based system: `follow(id, { x: "other.x" })` just registers an
// expression string per property; `flush()` (called once per tick by
// Presk) re-evaluates every registered expression and writes the result
// straight onto the target KObject.
//
// See binding/README.md for why this is pull-based rather than event/proxy
// driven, and for the known limitations (chained-binding lag, no cycle
// detection).

import type KScene from "@/primitives/kscene";
import { evaluateExpression } from "./expression";

class BindingEngine {
  private _scene: KScene;
  /** targetId -> (propName -> expression source) */
  private _bindings: Map<string, Map<string, string>> = new Map();

  constructor(scene: KScene) {
    this._scene = scene;
  }

  /** Registers/replaces a `follow` binding for one or more properties of `targetId`. */
  follow(targetId: string, properties: Record<string, string>): void {
    let props = this._bindings.get(targetId);
    if (!props) {
      props = new Map();
      this._bindings.set(targetId, props);
    }
    for (const [prop, expression] of Object.entries(properties)) {
      props.set(prop, expression);
    }
  }

  /** Stops following the given properties (spec §10.4). If omitted, stops all of them. */
  unfollow(targetId: string, properties?: string[]): void {
    const props = this._bindings.get(targetId);
    if (!props) return;

    if (!properties) {
      this._bindings.delete(targetId);
      return;
    }
    for (const prop of properties) props.delete(prop);
    if (props.size === 0) this._bindings.delete(targetId);
  }

  /** Drops every binding for a destroyed object (called by Presk.destroy()). */
  clear(targetId: string): void {
    this._bindings.delete(targetId);
  }

  isFollowing(targetId: string, prop: string): boolean {
    return this._bindings.get(targetId)?.has(prop) ?? false;
  }

  /** Re-evaluates every active binding and writes the result onto its target. Called once per tick. */
  flush(): void {
    for (const [targetId, props] of this._bindings) {
      const target = this._scene.get(targetId) as unknown as Record<string, number> | undefined;
      if (!target) continue; // target was destroyed without an explicit unfollow
      for (const [prop, expression] of props) {
        target[prop] = evaluateExpression(expression, this._scene);
      }
    }
  }
}

export default BindingEngine;
