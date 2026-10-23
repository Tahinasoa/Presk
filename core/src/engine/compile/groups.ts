import type { Step } from "@/lang/types";
import type { InitStep } from "@/engine/program";

export function addImplicitGroups(
  steps: readonly Step[],
  init: InitStep[],
  types: Map<string, string>,
): void {
  for (const step of steps) {
    if (step.action !== "group" || types.has(step.target)) continue;
    init.push({ id: step.target, type: "group", entries: [] });
    types.set(step.target, "group");
  }
}
