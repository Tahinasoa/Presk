import type { DiagnosticCollector } from "@/lang/diagnostics";
import type { Step } from "@/lang/types";
import { isEaseName } from "@/lang/ease";
import { parseStart } from "@/lang/start";

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function validateTimingValues(step: Step, index: number, diagnostics: DiagnosticCollector): void {
  const fields = step as unknown as Record<string, unknown>;

  if (fields.start !== undefined && parseStart(fields.start) === null) {
    report(diagnostics, "E_START_INVALID", "start is invalid", index, "start");
  }
  if (fields.name !== undefined && (typeof fields.name !== "string" || !IDENTIFIER_PATTERN.test(fields.name))) {
    report(diagnostics, "E_NAME_INVALID", "name is not a valid identifier", index, "name");
  }
  if (fields.duration !== undefined && !isPositiveFiniteNumber(fields.duration)) {
    report(diagnostics, "E_DURATION_INVALID", "duration must be a finite positive number", index, "duration");
  }
  if (fields.ease !== undefined && !isEaseName(fields.ease)) {
    report(diagnostics, "E_EASE_UNKNOWN", "ease name is unknown", index, "ease");
  }
  if (fields.repeat !== undefined && !isValidRepeat(fields.repeat)) {
    report(diagnostics, "E_REPEAT_INVALID", "repeat must be an integer of at least one or infinite", index, "repeat");
  }
  if (fields.repeatMode !== undefined && fields.repeatMode !== "restart" && fields.repeatMode !== "yoyo") {
    report(diagnostics, "E_REPEAT_MODE_INVALID", "repeatMode must be restart or yoyo", index, "repeatMode");
  }

  if (step.action === "travel") {
    validateTravel(fields, index, diagnostics);
  }
}

function validateTravel(fields: Record<string, unknown>, index: number, diagnostics: DiagnosticCollector): void {
  const hasDuration = fields.duration !== undefined;
  const hasSpeed = fields.speed !== undefined;
  if (hasDuration === hasSpeed) {
    report(diagnostics, "E_TRAVEL_DURATION", "travel requires exactly one of duration and speed", index, "duration");
  }
  if (hasSpeed && !isPositiveFiniteNumber(fields.speed)) {
    report(diagnostics, "E_TRAVEL_DURATION", "travel speed must be a finite positive number", index, "speed");
  }

  if (fields.from !== undefined && fields.from !== "current" && !isFiniteNumber(fields.from)) {
    report(diagnostics, "E_FIELD_TYPE", "travel from must be a finite number or current", index, "from");
  }
  if (fields.to !== undefined && !isFiniteNumber(fields.to)) {
    report(diagnostics, "E_FIELD_TYPE", "travel to must be a finite number", index, "to");
  }
  if (fields.orient !== undefined && !isValidOrientation(fields.orient)) {
    report(diagnostics, "E_TRAVEL_OPTION", "travel orient has an invalid value", index, "orient");
  }
}

function isValidRepeat(value: unknown): boolean {
  return value === "infinite" || (typeof value === "number" && Number.isInteger(value) && value >= 1);
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidOrientation(value: unknown): boolean {
  if (typeof value === "boolean") {
    return true;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return isFiniteNumber((value as Record<string, unknown>).offset);
}

function report(
  diagnostics: DiagnosticCollector,
  code: "E_START_INVALID" | "E_NAME_INVALID" | "E_DURATION_INVALID" | "E_EASE_UNKNOWN" | "E_REPEAT_INVALID" | "E_REPEAT_MODE_INVALID" | "E_TRAVEL_DURATION" | "E_FIELD_TYPE" | "E_TRAVEL_OPTION",
  message: string,
  stepIndex: number,
  field: string,
): void {
  diagnostics.error(code, message, { stepIndex, field });
}
