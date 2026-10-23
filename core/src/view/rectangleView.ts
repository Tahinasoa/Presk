import { Graphics } from "pixi.js";
import { splitColor } from "@/geom/color";
import type { PixiHost } from "@/view/pixiHost";
import { ObjectView } from "@/view/objectView";
import type { ViewRegistry } from "@/view/viewRegistry";
import type { SceneObject } from "@/model/sceneObject";

export class RectangleView extends ObjectView {
  private readonly graphics: Graphics;

  constructor(object: SceneObject, host: PixiHost) {
    super(object, host);
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.host.add(this.container);
  }

  protected draw(): void {
    const width = this.object.getNumber("width");
    const height = this.object.getNumber("height");
    const fill = splitColor(this.object.getColor("fill"));
    const stroke = splitColor(this.object.getColor("stroke"));
    const strokeWidth = this.object.getNumber("strokeWidth");

    this.graphics.clear();
    this.graphics.rect(0, 0, width, height);
    this.graphics.fill({ color: fill.rgb, alpha: fill.alpha });
    if (strokeWidth > 0) this.graphics.stroke({ width: strokeWidth, color: stroke.rgb, alpha: stroke.alpha });
  }
}

export function registerRectangleView(registry: ViewRegistry): void {
  registry.register("rectangle", (object, host) => new RectangleView(object, host));
}
