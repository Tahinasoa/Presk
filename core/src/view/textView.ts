import { Graphics, Text } from "pixi.js";
import { splitColor } from "@/geom/color";
import { parseTextFrame, parseTextHighlight } from "@/model/textDecorations";
import type { PixiHost } from "@/view/pixiHost";
import { ObjectView } from "@/view/objectView";
import type { ViewRegistry } from "@/view/viewRegistry";
import type { SceneObject } from "@/model/sceneObject";

export class TextView extends ObjectView {
  private readonly highlight: Graphics;
  private readonly text: Text;
  private readonly frame: Graphics;

  constructor(object: SceneObject, host: PixiHost) {
    super(object, host);
    this.highlight = new Graphics();
    this.text = new Text({
      text: "",
      style: { fontSize: 32, fontFamily: "sans-serif", fontWeight: "bold", fill: 0xffffff },
    });
    this.frame = new Graphics();
    this.container.addChild(this.highlight);
    this.container.addChild(this.text);
    this.container.addChild(this.frame);
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
    this.text.position.set(this.object.getNumber("marginLeft"), this.object.getNumber("marginTop"));
    const color = splitColor(this.object.getColor("color"));
    this.text.style.fill = color.rgb;
    this.text.alpha = color.alpha;

    const width = this.object.getNumber("width");
    const height = this.object.getNumber("height");

    const highlight = parseTextHighlight(this.object.getString("highlight"));
    if (!highlight.ok) throw new Error("TextView: invalid text highlight state.");
    this.highlight.clear();
    if (highlight.value !== null) {
      const fill = splitColor(highlight.value);
      this.highlight.rect(0, 0, width, height).fill({ color: fill.rgb, alpha: fill.alpha });
    }

    const frame = parseTextFrame(this.object.getString("frame"));
    if (!frame.ok) throw new Error("TextView: invalid text frame state.");
    this.frame.clear();
    if (frame.value !== null) {
      const stroke = splitColor(frame.value.color);
      this.frame
        .rect(0, 0, width, height)
        .stroke({ width: frame.value.width, color: stroke.rgb, alpha: stroke.alpha });
    }
  }
}

export function registerTextView(registry: ViewRegistry): void {
  registry.register("text", (object, host) => new TextView(object, host));
}
