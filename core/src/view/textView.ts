import { Text } from "pixi.js";
import { splitColor } from "@/geom/color";
import type { PixiHost } from "@/view/pixiHost";
import { ObjectView } from "@/view/objectView";
import type { ViewRegistry } from "@/view/viewRegistry";
import type { SceneObject } from "@/model/sceneObject";

export class TextView extends ObjectView {
  private readonly text: Text;

  constructor(object: SceneObject, host: PixiHost) {
    super(object, host);
    this.text = new Text({
      text: "",
      style: { fontSize: 32, fontFamily: "sans-serif", fontWeight: "bold", fill: 0xffffff },
    });
    this.container.addChild(this.text);
    this.host.add(this.container);
  }

  protected draw(): void {
    const fontWeight = this.object.getString("fontWeight");
    if (fontWeight !== "normal" && fontWeight !== "bold") {
      throw new Error(`TextView: unsupported font weight '${fontWeight}'.`);
    }

    this.text.text = this.object.getString("text");
    this.text.style.fontSize = this.object.getNumber("fontSize");
    this.text.style.fontFamily = this.object.getString("fontFamily");
    this.text.style.fontWeight = fontWeight;
    const color = splitColor(this.object.getColor("color"));
    this.text.style.fill = color.rgb;
    this.text.alpha = color.alpha;
  }
}

export function registerTextView(registry: ViewRegistry): void {
  registry.register("text", (object, host) => new TextView(object, host));
}
