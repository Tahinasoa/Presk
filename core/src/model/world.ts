import { PreskRuntimeError } from "@/lang/diagnostics";
import type { SceneObject } from "@/model/sceneObject";
import type { StateValue } from "@/model/values";

type InitialObject = {
  state: Record<string, StateValue>;
  parentId: string | null;
  childIds: string[];
};

export class World {
  readonly root: SceneObject;
  private readonly objects = new Map<string, SceneObject>();
  private readonly creationOrder: SceneObject[] = [];
  private initial: Map<string, InitialObject> | null = null;

  constructor(root: SceneObject) {
    this.root = root;
    this.objects.set(root.id, root);
  }

  add(object: SceneObject): void {
    if (object.id === "scene") throw new Error("Presk internal: object id 'scene' is reserved");
    if (this.objects.has(object.id)) throw new Error(`Presk internal: duplicate object id '${object.id}'`);
    this.objects.set(object.id, object);
    this.creationOrder.push(object);
  }

  get(id: string): SceneObject | undefined {
    if (id === "scene") return this.root;
    return this.objects.get(id);
  }

  require(id: string): SceneObject {
    const object = this.get(id);
    if (!object) throw new PreskRuntimeError(`Unknown object '${id}'`);
    return object;
  }

  has(id: string): boolean {
    return this.get(id) !== undefined;
  }

  all(): readonly SceneObject[] {
    return this.creationOrder;
  }

  captureInitial(): void {
    const snapshot = new Map<string, InitialObject>();
    for (const object of this.allObjects()) {
      snapshot.set(object.id, {
        state: object.snapshot(),
        parentId: object.parent?.id ?? null,
        childIds: object.children().map((child) => child.id),
      });
    }
    this.initial = snapshot;
  }

  reset(): void {
    if (this.initial === null) throw new Error("Presk internal: World.reset called before captureInitial");
    const allObjects = this.allObjects();
    for (const object of allObjects) {
      const initial = this.initial.get(object.id);
      if (!initial) throw new Error(`Presk internal: missing initial state for '${object.id}'`);
      object.restore(initial.state);
      object.parent = null;
    }
    for (const object of allObjects) {
      const initial = this.initial.get(object.id);
      if (!initial) throw new Error(`Presk internal: missing initial hierarchy for '${object.id}'`);
      const children = initial.childIds.map((id) => {
        const child = this.objects.get(id);
        if (!child) throw new Error(`Presk internal: missing initial child '${id}'`);
        child.parent = object;
        return child;
      });
      object.setChildren(children);
    }
    for (const object of allObjects) {
      const parentId = this.initial.get(object.id)?.parentId;
      if (parentId) {
        const parent = this.objects.get(parentId);
        if (!parent) throw new Error(`Presk internal: missing initial parent '${parentId}'`);
        object.parent = parent;
      }
    }
  }

  private allObjects(): SceneObject[] {
    return [this.root, ...this.creationOrder];
  }
}
