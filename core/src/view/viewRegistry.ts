import type { PixiHost } from "@/view/pixiHost";
import type { ObjectView } from "@/view/objectView";
import type { SceneObject } from "@/model/sceneObject";

export type ViewFactory = (object: SceneObject, host: PixiHost) => ObjectView;

export class ViewRegistry {
  private readonly factories = new Map<string, ViewFactory>();

  register(type: string, factory: ViewFactory): void {
    if (this.factories.has(type)) {
      throw new Error(`ViewRegistry: view factory for '${type}' is already registered.`);
    }
    this.factories.set(type, factory);
  }

  create(object: SceneObject, host: PixiHost): ObjectView | null {
    const factory = this.factories.get(object.def.type);
    return factory ? factory(object, host) : null;
  }
}
