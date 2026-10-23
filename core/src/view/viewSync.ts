import type { World } from "@/model/world";
import type { PixiHost } from "@/view/pixiHost";
import type { ObjectView } from "@/view/objectView";
import type { ViewRegistry } from "@/view/viewRegistry";

export class ViewSync {
  private readonly world: World;
  private readonly registry: ViewRegistry;
  private readonly host: PixiHost;
  private readonly views = new Map<string, ObjectView>();

  constructor(world: World, registry: ViewRegistry, host: PixiHost) {
    this.world = world;
    this.registry = registry;
    this.host = host;
  }

  syncAll(): void {
    for (const object of this.world.all()) {
      if (this.views.has(object.id)) continue;
      const view = this.registry.create(object, this.host);
      if (view) this.views.set(object.id, view);
    }

    for (const view of this.views.values()) view.update();

    const root = this.world.root;
    this.host.setViewport(
      root.getNumber("viewCx"),
      root.getNumber("viewCy"),
      root.getNumber("viewZoom"),
      root.getNumber("width"),
      root.getNumber("height"),
    );
  }

  destroy(): void {
    for (const view of this.views.values()) view.destroy();
    this.views.clear();
  }
}
