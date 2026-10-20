import { CanvasTextMetrics, TextStyle } from "pixi.js";
import type { TextMeasurer, TextStyle as ModelTextStyle } from "@/model/ports";

export class PixiTextMeasurer implements TextMeasurer {
  measure(text: string, style: ModelTextStyle): { width: number; height: number } {
    const metrics = CanvasTextMetrics.measureText(text, new TextStyle({
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
    }));
    return { width: text.length === 0 ? 0 : metrics.width, height: metrics.height };
  }
}
