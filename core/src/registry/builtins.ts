// Registers the built-in DSL types with a Presk instance. Call this once,
// before compiling/running any DSL document (see main.ts).
//
// To add a new built-in type: add a KObject subclass under primitives/, a
// KGraphicObject subclass under renderer/, then register the pair here.

import type Presk from "@/presk";
import KRectangle from "@/primitives/krectangle";
import KGraphicRectangle from "@/renderer/kgraphicRectangle";
import KText from "@/primitives/ktext";
import KGraphicText from "@/renderer/kgraphicText";

export function registerBuiltins(presk: Presk): void {
  // Backs DSL `"type": "shape"` (see mockInput.json / spec.md examples).
  presk.register("shape", KRectangle, KGraphicRectangle);

  // Backs DSL `"type": "text"`.
  presk.register("text", KText, KGraphicText);
}
