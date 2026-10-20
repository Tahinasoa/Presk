import { Graphics } from "pixi.js";
import type { PixiHost } from "@/view/pixiHost";
import { ObjectView } from "@/view/objectView";
import type { ViewRegistry } from "@/view/viewRegistry";
import type { SceneObject } from "@/model/sceneObject";

export class PolygonView extends ObjectView {
  private readonly graphics: Graphics;

  constructor(object: SceneObject, host: PixiHost) {
    super(object, host);
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.host.add(this.container);
  }

  protected draw(): void {
    this.graphics.clear();
    const path = this.object.def.paths.main.build(this.object);
    const drawProgress = this.object.hasState("drawProgress")
      ? this.object.getNumber("drawProgress")
      : 1;
    const stroke = this.object.getNumber("stroke");
    const strokeWidth = this.object.getNumber("strokeWidth");

    if (drawProgress >= 1) {
      this.graphics.poly(path.points.flatMap((point) => [point.x, point.y]));
      this.graphics.fill({ color: this.object.getNumber("fill") });
      if (strokeWidth > 0) {
        this.graphics.stroke({ width: strokeWidth, color: stroke });
      }
      return;
    }

    const points = path.sub(0, drawProgress);
    const first = points[0];
    if (!first) return;
    this.graphics.moveTo(first.x, first.y);
    for (const point of points.slice(1)) {
      this.graphics.lineTo(point.x, point.y);
    }
    this.graphics.stroke({ width: Math.max(strokeWidth, 2), color: stroke });
  }
}

export function registerPolygonView(registry: ViewRegistry): void {
  registry.register("polygon", (object, host) => new PolygonView(object, host));
  registry.register("triangle", (object, host) => new PolygonView(object, host));
}
