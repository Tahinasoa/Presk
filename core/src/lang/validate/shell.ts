import type { SceneConfig } from "@/lang/types";
import type { DiagnosticCollector } from "@/lang/diagnostics";

export function validateShell(
  raw: unknown,
  diagnostics: DiagnosticCollector,
): { scene: SceneConfig; steps: unknown[] } | null {
  if (!isRecord(raw)) {
    diagnostics.error("E_DOC_NOT_OBJECT", "document must be a JSON object");
    return null;
  }

  if (raw.version !== "1.0") {
    diagnostics.error("E_DOC_VERSION", "document version must be 1.0", { field: "version" });
  }

  const scene = validateScene(raw.scene);
  if (!scene) {
    diagnostics.error("E_SCENE_INVALID", "scene must have positive dimensions and an optional string background", {
      field: "scene",
    });
  }

  const steps = Array.isArray(raw.steps) ? raw.steps : null;
  if (!steps) {
    diagnostics.error("E_STEPS_NOT_ARRAY", "steps must be an array", { field: "steps" });
  }

  if (diagnostics.hasErrors || !scene || !steps) {
    return null;
  }

  return { scene, steps };
}

function validateScene(value: unknown): SceneConfig | null {
  if (!isRecord(value)) {
    return null;
  }

  const { width, height, background } = value;
  if (typeof width !== "number" || !Number.isFinite(width) || width <= 0) {
    return null;
  }
  if (typeof height !== "number" || !Number.isFinite(height) || height <= 0) {
    return null;
  }
  if (background !== undefined && typeof background !== "string") {
    return null;
  }

  return background === undefined
    ? { width, height }
    : { width, height, background };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
