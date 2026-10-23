import type { DiagnosticCollector } from "@/lang/diagnostics";
import type { Step } from "@/lang/types";
import type { Catalog } from "@/model/catalog";
import { createScope } from "@/engine/analyze/scope";
import { compileProperties } from "@/engine/compile/properties";
import type { InitStep } from "@/engine/program";

export function compileCreates(
  steps: readonly Step[],
  catalog: Catalog,
  d: DiagnosticCollector,
): { init: InitStep[]; types: Map<string, string> } {
  const allCreateIds = new Set(
    steps.filter((step) => step.action === "create").map((step) => step.target),
  );
  const declaredTypes = new Map<string, string>();
  const init: InitStep[] = [];

  steps.forEach((step, stepIndex) => {
    if (step.action !== "create") return;
    const { target: id, type } = step;
    if (declaredTypes.has(id)) {
      d.error("E_OBJECT_DUPLICATE", `Object '${id}' is created more than once`, { stepIndex, field: "target" });
      return;
    }

    const def = catalog.get(type);
    if (!def || !def.creatable) {
      d.error("E_TYPE_UNKNOWN", `Unknown or non-creatable type '${type}'`, { stepIndex, field: "type" });
      declaredTypes.set(id, type);
      return;
    }

    const forwardIds = new Set([...allCreateIds].filter((createId) => !declaredTypes.has(createId)));
    const scope = createScope(catalog, declaredTypes, forwardIds);
    const entries = compileProperties(step.properties ?? {}, "create", def, { scope, d, stepIndex });
    if (entries) init.push({ id, type, entries });
    declaredTypes.set(id, type);
  });

  return { init, types: declaredTypes };
}
