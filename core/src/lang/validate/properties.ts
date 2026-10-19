import type { DiagnosticCollector } from "@/lang/diagnostics";
import type { Step } from "@/lang/types";

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function validatePropertiesShape(step: Step, index: number, diagnostics: DiagnosticCollector): void {
  const fields = step as unknown as Record<string, unknown>;
  const properties = fields.properties;

  if (step.action === "unbind" || step.action === "stop") {
    if (properties === undefined) {
      return;
    }
    if (!Array.isArray(properties) || !isValidNameList(properties, true, false)) {
      diagnostics.error("E_FIELD_TYPE", "properties must be a list of unique non-empty strings", {
        stepIndex: index,
        field: "properties",
      });
    }
    return;
  }

  if (step.action === "set" || step.action === "animate" || step.action === "bind") {
    if (!isRecord(properties)) {
      diagnostics.error("E_FIELD_TYPE", "properties must be an object", { stepIndex: index, field: "properties" });
      return;
    }
    if (Object.keys(properties).length === 0) {
      diagnostics.error("E_FIELD_REQUIRED", "properties must not be empty", { stepIndex: index, field: "properties" });
      return;
    }
    validateNonEmptyKeys(properties, index, diagnostics);
    return;
  }

  if (step.action === "group") {
    if (!isRecord(properties)) {
      diagnostics.error("E_FIELD_TYPE", "properties must be an object", { stepIndex: index, field: "properties" });
      return;
    }
    validateNonEmptyKeys(properties, index, diagnostics);
    if (properties.children === undefined) {
      diagnostics.error("E_FIELD_REQUIRED", "group properties require children", {
        stepIndex: index,
        field: "properties.children",
      });
    } else if (!isValidGroupChildren(properties.children)) {
      diagnostics.error("E_FIELD_TYPE", "group children must be a name or a non-empty list of names", {
        stepIndex: index,
        field: "properties.children",
      });
    }
    return;
  }

  if (step.action === "ungroup" && properties !== undefined) {
    if (!isRecord(properties)) {
      diagnostics.error("E_FIELD_TYPE", "properties must be an object", { stepIndex: index, field: "properties" });
      return;
    }
    for (const key of Object.keys(properties)) {
      if (key !== "children") {
        diagnostics.error("E_FIELD_FORBIDDEN", `property '${key}' is not allowed for ungroup`, {
          stepIndex: index,
          field: `properties.${key}`,
        });
      }
    }
    if (properties.children !== undefined && !isValidNameListOrSingle(properties.children)) {
      diagnostics.error("E_FIELD_TYPE", "ungroup children must be a string or a list of strings", {
        stepIndex: index,
        field: "properties.children",
      });
    }
  }
}

function validateNonEmptyKeys(
  properties: Record<string, unknown>,
  index: number,
  diagnostics: DiagnosticCollector,
): void {
  for (const key of Object.keys(properties)) {
    if (key.length === 0) {
      diagnostics.error("E_FIELD_TYPE", "property keys must not be empty", {
        stepIndex: index,
        field: "properties.",
      });
    }
  }
}

function isValidGroupChildren(value: unknown): boolean {
  if (typeof value === "string") {
    return IDENTIFIER_PATTERN.test(value);
  }
  return Array.isArray(value)
    && value.length > 0
    && value.every((name) => typeof name === "string" && IDENTIFIER_PATTERN.test(name));
}

function isValidNameList(value: unknown[], requireUnique: boolean, allowEmpty: boolean): boolean {
  const names = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string" || (!allowEmpty && item.length === 0)) {
      return false;
    }
    if (requireUnique && names.has(item)) {
      return false;
    }
    names.add(item);
  }
  return true;
}

function isValidNameListOrSingle(value: unknown): boolean {
  if (typeof value === "string") {
    return true;
  }
  return Array.isArray(value) && isValidNameList(value, false, true);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
