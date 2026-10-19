import type { CompiledEffect, InitStep, PlannedAction } from "@/engine/program";

function resolveEntries(
  object: string,
  entries: readonly (CompiledEffect | { kind: "prop" })[],
  last: Map<string, string>,
): void {
  for (const entry of entries) {
    if (entry.kind !== "effect") continue;
    const key = `${object}|${entry.name}`;
    if (entry.on) {
      last.set(key, entry.variant);
    } else {
      entry.variant = last.get(key) ?? "default";
    }
  }
}

export function resolveEffectVariants(init: InitStep[], actions: PlannedAction[]): void {
  const last = new Map<string, string>();

  for (const step of init) {
    resolveEntries(step.id, step.entries, last);
  }

  const effectActions = actions
    .filter((action) => action.action === "set" || action.action === "animate")
    .sort((a, b) => a.start - b.start || a.index - b.index);

  for (const action of effectActions) {
    resolveEntries(action.target, action.entries, last);
  }
}
