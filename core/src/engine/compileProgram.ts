import { analyzeActivity } from "@/engine/analyze/activity";
import { resolveEffectVariants } from "@/engine/analyze/effects";
import { createTravelHooks } from "@/engine/analyze/travelPlan";
import { compileCreates } from "@/engine/compile/create";
import { compileSteps } from "@/engine/compile/steps";
import { planTimeline } from "@/engine/plan/timeline";
import type { Program } from "@/engine/program";
import { buildWorld } from "@/engine/sim/buildWorld";
import { DiagnosticCollector, PreskCompileError } from "@/lang/diagnostics";
import type { Diagnostic } from "@/lang/diagnostics";
import { validateDocument } from "@/lang/validate/document";
import type { ObjectEnv } from "@/model/ports";
import type { Catalog } from "@/model/catalog";

export interface CompileEnv {
  catalog: Catalog;
  objectEnv: ObjectEnv;
}

export function tryCompileProgram(raw: unknown, env: CompileEnv): { program?: Program; diagnostics: Diagnostic[] } {
  const d = new DiagnosticCollector();
  const validation = validateDocument(raw);
  d.merge(validation.diagnostics);
  const parsed = validation.document;
  if (!parsed || d.hasErrors) return { diagnostics: [...d.items] };

  const creates = compileCreates(parsed.steps, env.catalog, d);
  const drafts = compileSteps(parsed.steps, creates.types, env.catalog, d);
  if (d.hasErrors) return { diagnostics: [...d.items] };

  const travelHooks = drafts.some((draft) => draft.action === "travel")
    ? createTravelHooks(buildWorld({
        scene: parsed.scene,
        init: creates.init,
        actions: [],
        duration: 0,
        warnings: [...d.warnings],
      }, env), env.catalog, d)
    : undefined;
  const planned = planTimeline(drafts, d, travelHooks);
  if (d.hasErrors) return { diagnostics: [...d.items] };

  resolveEffectVariants(creates.init, planned.actions);
  const typeOf = (id: string): string | undefined => id === "scene" ? "scene" : creates.types.get(id);
  analyzeActivity(planned.actions, typeOf, env.catalog, d);
  if (d.hasErrors) return { diagnostics: [...d.items] };

  const program: Program = {
    scene: parsed.scene,
    init: creates.init,
    actions: planned.actions,
    duration: planned.duration,
    warnings: [...d.warnings],
  };
  return { program, diagnostics: [...d.items] };
}

export function compileProgram(raw: unknown, env: CompileEnv): Program {
  const result = tryCompileProgram(raw, env);
  if (result.diagnostics.some(({ severity }) => severity === "error")) {
    throw new PreskCompileError(result.diagnostics);
  }
  if (!result.program) throw new Error("Presk internal: compilation returned no program and no errors");
  return result.program;
}
