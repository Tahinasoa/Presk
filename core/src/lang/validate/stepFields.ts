import { ACTION_NAMES } from "@/lang/types";
import type { ActionName, Step } from "@/lang/types";
import type { DiagnosticCollector } from "@/lang/diagnostics";

const REQUIRED: Record<ActionName, string[]> = {
  create: ["action", "target", "type"],
  set: ["action", "target", "properties"],
  animate: ["action", "target", "properties"],
  travel: ["action", "target", "along"],
  bind: ["action", "target", "properties"],
  unbind: ["action", "target"],
  stop: ["action", "target"],
  group: ["action", "target", "properties"],
  ungroup: ["action", "target"],
};

const OPTIONAL: Record<ActionName, string[]> = {
  create: ["properties"],
  set: ["start", "name"],
  animate: ["start", "name", "duration", "ease", "repeat", "repeatMode"],
  travel: ["from", "to", "duration", "speed", "ease", "repeat", "repeatMode", "orient", "anchor", "start", "name"],
  bind: ["start", "name"],
  unbind: ["properties", "start", "name"],
  stop: ["properties", "start", "name"],
  group: ["start", "name", "duration", "ease"],
  ungroup: ["properties", "start", "name"],
};

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function validateStepFields(raw: unknown, index: number, diagnostics: DiagnosticCollector): Step | null {
  const initialErrorCount = diagnostics.errors.length;
  if (!isRecord(raw)) {
    diagnostics.error("E_STEP_NOT_OBJECT", "step must be an object", { stepIndex: index });
    return null;
  }

  const actionValue = raw.action;
  if (typeof actionValue !== "string" || !ACTION_NAMES.includes(actionValue as ActionName)) {
    diagnostics.error("E_ACTION_UNKNOWN", "step action is missing or unknown", { stepIndex: index, field: "action" });
    return null;
  }
  const action = actionValue as ActionName;

  const target = raw.target;
  if (typeof target !== "string") {
    diagnostics.error("E_TARGET_MISSING", "step target must be a string", { stepIndex: index, field: "target" });
  } else if (!IDENTIFIER_PATTERN.test(target)) {
    diagnostics.error("E_TARGET_INVALID", "step target is not a valid identifier", { stepIndex: index, field: "target" });
  }

  for (const field of REQUIRED[action]) {
    if (field !== "action" && field !== "target" && raw[field] === undefined) {
      diagnostics.error("E_FIELD_REQUIRED", `required field '${field}' is missing`, { stepIndex: index, field });
    }
  }

  const allowedFields = new Set(["action", "target", ...REQUIRED[action], ...OPTIONAL[action]]);
  for (const field of Object.keys(raw)) {
    if (!allowedFields.has(field)) {
      diagnostics.error("E_FIELD_FORBIDDEN", `field '${field}' is not allowed for ${action}`, {
        stepIndex: index,
        field,
      });
    }
  }

  validateStringField(raw, "name", index, diagnostics);
  validateStringField(raw, "type", index, diagnostics);
  validateStringField(raw, "along", index, diagnostics);
  validateStringField(raw, "anchor", index, diagnostics);

  if (raw.properties !== undefined) {
    const isStringArrayProperty = action === "unbind" || action === "stop";
    const validProperties = isStringArrayProperty
      ? Array.isArray(raw.properties)
      : isRecord(raw.properties);
    if (!validProperties) {
      diagnostics.error("E_FIELD_TYPE", "properties has an invalid type", { stepIndex: index, field: "properties" });
    }
  }

  if (diagnostics.errors.length > initialErrorCount) {
    return null;
  }
  return raw as unknown as Step;
}

function validateStringField(
  step: Record<string, unknown>,
  field: "name" | "type" | "along" | "anchor",
  stepIndex: number,
  diagnostics: DiagnosticCollector,
): void {
  const value = step[field];
  if (value !== undefined && typeof value !== "string") {
    diagnostics.error("E_FIELD_TYPE", `${field} must be a string`, { stepIndex, field });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
