import { DiagnosticCollector } from "@/lang/diagnostics";
import type { Diagnostic } from "@/lang/diagnostics";
import type { DslDocument, Step } from "@/lang/types";
import { validateShell } from "./shell";
import { validateStepFields } from "./stepFields";
import { validateTimingValues } from "./timing";
import { validatePropertiesShape } from "./properties";

export function validateDocument(raw: unknown): { document?: DslDocument; diagnostics: Diagnostic[] } {
  const collector = new DiagnosticCollector();
  const shell = validateShell(raw, collector);
  const steps = shell?.steps ?? getRawSteps(raw);
  const validSteps: Step[] = [];
  const names = new Map<string, number>();

  for (const [index, rawStep] of steps.entries()) {
    const step = validateStepFields(rawStep, index, collector);
    if (!step) {
      continue;
    }

    validateTimingValues(step, index, collector);
    validatePropertiesShape(step, index, collector);
    validSteps.push(step);

    const fields = step as unknown as Record<string, unknown>;
    if (typeof fields.name === "string") {
      if (names.has(fields.name)) {
        collector.error("E_NAME_DUPLICATE", `name '${fields.name}' is used more than once`, {
          stepIndex: index,
          field: "name",
        });
      } else {
        names.set(fields.name, index);
      }
    }

    if (step.target === "scene") {
      if (step.action === "create") {
        collector.error("E_OBJECT_RESERVED", "scene is a reserved object target", {
          stepIndex: index,
          field: "target",
        });
      } else if (step.action === "travel" || step.action === "group" || step.action === "ungroup") {
        collector.error("E_SCENE_ACTION", `${step.action} cannot target scene`, {
          stepIndex: index,
          field: "target",
        });
      }
    }
  }

  if (collector.hasErrors || !shell) {
    return { diagnostics: [...collector.items] };
  }

  return {
    document: { version: "1.0", scene: shell.scene, steps: validSteps },
    diagnostics: [...collector.items],
  };
}

function getRawSteps(raw: unknown): unknown[] {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return [];
  }
  const steps = (raw as Record<string, unknown>).steps;
  return Array.isArray(steps) ? steps : [];
}
