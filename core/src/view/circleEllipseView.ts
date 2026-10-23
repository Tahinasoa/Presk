import { Graphics } from "pixi.js";
import { splitColor } from "@/geom/color";
import type { PixiHost } from "@/view/pixiHost";
import { ObjectView } from "@/view/objectView";
import type { ViewRegistry } from "@/view/viewRegistry";
import type { SceneObject } from "@/model/sceneObject";

export class CircleView extends ObjectView {
  private readonly graphics: Graphics;

  constructor(object: SceneObject, host: PixiHost) {
    super(object, host);
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.host.add(this.container);
  }

  protected draw(): void {
    const radius = this.object.getNumber("radius");
    const fill = splitColor(this.object.getColor("fill"));
    const stroke = splitColor(this.object.getColor("stroke"));
    const strokeWidth = this.object.getNumber("strokeWidth");

    this.graphics.clear();
    this.graphics.circle(0, 0, radius);
    this.graphics.fill({ color: fill.rgb, alpha: fill.alpha });
    if (strokeWidth > 0) this.graphics.stroke({ width: strokeWidth, color: stroke.rgb, alpha: stroke.alpha });
  }
}

export class EllipseView extends ObjectView {
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
    this.graphics.ellipse(0, 0, width / 2, height / 2);
    this.graphics.fill({ color: fill.rgb, alpha: fill.alpha });
    if (strokeWidth > 0) this.graphics.stroke({ width: strokeWidth, color: stroke.rgb, alpha: stroke.alpha });
  }
}

export function registerCircleView(registry: ViewRegistry): void {
  registry.register("circle", (object, host) => new CircleView(object, host));
}

export function registerEllipseView(registry: ViewRegistry): void {
  registry.register("ellipse", (object, host) => new EllipseView(object, host));
}
