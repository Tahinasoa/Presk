import { registerRectangleView } from "@/view/rectangleView";
import { registerTextView } from "@/view/textView";
import { ViewRegistry } from "@/view/viewRegistry";

export function createDefaultViewRegistry(): ViewRegistry {
  const registry = new ViewRegistry();
  registerRectangleView(registry);
  registerTextView(registry);
  return registry;
}
