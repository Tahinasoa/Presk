import { Sprite, Texture } from "pixi.js";
import type { PixiHost } from "@/view/pixiHost";
import { ObjectView } from "@/view/objectView";
import type { ViewRegistry } from "@/view/viewRegistry";
import type { SceneObject } from "@/model/sceneObject";

export class ImageView extends ObjectView {
  private readonly sprite: Sprite;

  constructor(object: SceneObject, host: PixiHost) {
    super(object, host);
    this.sprite = new Sprite(Texture.from(object.getString("url")));
    this.container.addChild(this.sprite);
    this.host.add(this.container);
  }

  protected draw(): void {
    this.sprite.width = this.object.getNumber("width");
    this.sprite.height = this.object.getNumber("height");
  }
}

export function registerImageView(registry: ViewRegistry): void {
  registry.register("image", (object, host) => new ImageView(object, host));
}
