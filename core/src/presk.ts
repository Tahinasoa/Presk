// Presk is the engine's public API. It owns:
//   - the type registry (register/create), the factory pattern that answers
//     the original design question "how do I link a KObject to its
//     KGraphicObject";
//   - the KScene (data) and KGraphicScene (visuals) registries, kept in
//     lockstep;
//   - the KRenderer (PixiJS Application wrapper);
//   - the BindingEngine (pull-based `follow` bindings);
//   - the single shared GSAP ticker that drives all of the above in a
//     fixed, deterministic order every frame.
//
// See src/README.md for the full architecture diagram and the reasoning
// behind the tick order.

import gsap from "gsap";
import KScene from "@/primitives/kscene";
import type KObject from "@/primitives/kobject";
import KGraphicScene from "@/renderer/kgraphicScene";
import KRenderer from "@/renderer/krenderer";
import type KGraphicObject from "@/renderer/kgraphicObject";
import BindingEngine from "@/binding/bindingEngine";

// A registered "type" is a pair of constructors: one for the data object,
// one for its paired visual. `any` is used for constructor params here
// deliberately — each concrete pair (e.g. KRectangle/KGraphicRectangle)
// has its own, more specific params type; the registry only needs to know
// "give it an id/props object, get back an instance".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectCtor = new (params: any) => KObject;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GraphicCtor = new (params: any) => KGraphicObject;

interface RegistryEntry {
  ObjectClass: ObjectCtor;
  GraphicClass: GraphicCtor;
}

export interface PreskInitParams {
  /** CSS selector for the element the <canvas> is appended into. */
  root: string;
  width: number;
  height: number;
  background?: string;
}

class Presk {
  private _registry: Map<string, RegistryEntry> = new Map();
  private _scene!: KScene;
  private _graphicScene: KGraphicScene = new KGraphicScene();
  private _renderer!: KRenderer;
  private _binding!: BindingEngine;
  private _started = false;

  /**
   * Registers a DSL type as a pair of constructors. Answers the
   * "Presk.register(KRectangle, KGraphicRectangle)" design question: `type`
   * is the DSL's `"type"` field (e.g. "shape"), and `create()` uses this
   * pair to build both halves and link them by id.
   */
  register(type: string, ObjectClass: ObjectCtor, GraphicClass: GraphicCtor): void {
    this._registry.set(type, { ObjectClass, GraphicClass });
  }

  /** Sets up the KScene + KRenderer and mounts the PixiJS canvas. Must be called before create(). */
  async init({ root, width, height, background }: PreskInitParams): Promise<void> {
    this._scene = new KScene({ id: "scene", x: 0, y: 0, width, height });
    this._binding = new BindingEngine(this._scene);
    this._renderer = new KRenderer({ root, width, height, background });
    await this._renderer.init();
  }

  get scene(): KScene {
    return this._scene;
  }

  get binding(): BindingEngine {
    return this._binding;
  }

  /**
   * Creates a KObject + its paired KGraphicObject from a registered type,
   * links them (both keyed by the same id), and adds them to the scene.
   * This is the `create("rectangle", {...})` factory from the design chat.
   */
  create<T extends KObject = KObject>(type: string, id: string, props: Record<string, unknown>): T {
    const entry = this._registry.get(type);
    if (!entry) {
      throw new Error(`Presk.create: unknown type "${type}". Did you forget to register() it?`);
    }
    if (this._scene.has(id)) {
      throw new Error(`Presk.create: an object with id "${id}" already exists.`);
    }

    const kObject = new entry.ObjectClass({ id, ...props });
    const kGraphicObject = new entry.GraphicClass({ renderer: this._renderer, object: kObject });

    this._scene.add(kObject);
    this._graphicScene.add(id, kGraphicObject);

    return kObject as T;
  }

  /** Destroys an object and its visual, and drops any bindings pointing at it. */
  destroy(id: string): void {
    this._graphicScene.remove(id); // also calls the graphic object's destroy()
    this._scene.remove(id);
    this._binding.clear(id);
  }

  /**
   * Starts the single shared ticker driving the whole engine. Order, every
   * frame:
   *   1. GSAP's own internal tween engine updates first (built into GSAP,
   *      runs before any ticker.add() callback — see src/README.md).
   *   2. binding.flush() resolves every active `follow` expression.
   *   3. graphicScene.tick() redraws every visual from its current KObject.
   */
  start(): void {
    if (this._started) return;
    this._started = true;
    gsap.ticker.add(() => {
      this._binding.flush();
      this._graphicScene.tick();
    });
  }
}

export default Presk;
