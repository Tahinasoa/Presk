import { registerRectangleView } from "@/view/rectangleView";
import { registerCircleView, registerEllipseView } from "@/view/circleEllipseView";
import { registerTextView } from "@/view/textView";
import { ViewRegistry } from "@/view/viewRegistry";

export function createDefaultViewRegistry(): ViewRegistry {
  const registry = new ViewRegistry();
  registerCircleView(registry);
  registerEllipseView(registry);
  registerRectangleView(registry);
  registerTextView(registry);
  return registry;
}
