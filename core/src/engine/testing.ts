import type { SceneConfig, Step } from "@/lang/types";
import { validateDocument } from "@/lang/validate/document";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { compileCreates } from "@/engine/compile/create";
import { compileSteps } from "@/engine/compile/steps";
import { planTimeline } from "@/engine/plan/timeline";
import type { Catalog } from "@/model/catalog";
import { resolveEffectVariants } from "@/engine/analyze/effects";

export function planForTest(
  steps: unknown[],
  scene: SceneConfig = { width: 800, height: 600 },
  catalog: Catalog = createDefaultCatalog(),
): {
  init: ReturnType<typeof compileCreates>["init"];
  actions: ReturnType<typeof planTimeline>["actions"];
  duration: number;
  diagnostics: DiagnosticCollector["items"];
} {
  const validation = validateDocument({ version: "1.0", scene, steps });
  const d = new DiagnosticCollector();
  d.merge(validation.diagnostics);
  const parsed = validation["document"];
  if (!parsed) return { init: [], actions: [], duration: 0, diagnostics: d.items };

  const creates = compileCreates(parsed.steps as readonly Step[], catalog, d);
  if (d.hasErrors) return { init: creates.init, actions: [], duration: 0, diagnostics: d.items };

  const drafts = compileSteps(parsed.steps, creates.types, catalog, d);
  if (d.hasErrors) return { init: creates.init, actions: [], duration: 0, diagnostics: d.items };

  const planned = planTimeline(drafts, d);
  resolveEffectVariants(creates.init, planned.actions);
  return { init: creates.init, ...planned, diagnostics: d.items };
}
