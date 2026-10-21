export const DIAGNOSTIC_CODES = [
  "E_DOC_NOT_OBJECT",
  "E_DOC_VERSION",
  "E_SCENE_INVALID",
  "E_STEPS_NOT_ARRAY",
  "E_STEP_NOT_OBJECT",
  "E_ACTION_UNKNOWN",
  "E_TARGET_MISSING",
  "E_TARGET_INVALID",
  "E_FIELD_FORBIDDEN",
  "E_FIELD_TYPE",
  "E_FIELD_REQUIRED",
  "E_NAME_INVALID",
  "E_NAME_DUPLICATE",
  "E_TYPE_UNKNOWN",
  "E_OBJECT_UNKNOWN",
  "E_OBJECT_DUPLICATE",
  "E_OBJECT_RESERVED",
  "E_FORWARD_REFERENCE",
  "E_PROPERTY_UNKNOWN",
  "E_PROPERTY_READONLY",
  "E_PROPERTY_NOT_ANIMATABLE",
  "E_PROPERTY_NOT_BINDABLE",
  "E_PROPERTY_DUPLICATE",
  "E_VALUE_TYPE",
  "E_VALUE_RANGE",
  "E_COLOR_INVALID",
  "E_EXPR_SYNTAX",
  "E_EXPR_POINT_IN_ARITHMETIC",
  "E_EXPR_BOUNDINGBOX_ALONE",
  "E_EXPR_SEGMENT_UNKNOWN",
  "E_EXPR_INFINITE_REF",
  "E_EXPR_TYPE_MISMATCH",
  "E_EXPR_PATH",
  "E_EFFECT_VALUE",
  "E_EFFECT_IN_EXPRESSION",
  "E_EFFECT_BIND",
  "E_START_INVALID",
  "E_START_UNKNOWN_NAME",
  "E_START_NEGATIVE",
  "E_START_REF_INFINITE_END",
  "E_DURATION_INVALID",
  "E_DURATION_MISSING",
  "E_EASE_UNKNOWN",
  "E_REPEAT_INVALID",
  "E_REPEAT_MODE_INVALID",
  "E_INFINITE_NEVER_PLAYED",
  "E_UNBIND_NOTHING",
  "E_STOP_NOTHING",
  "E_STOP_ON_BIND",
  "E_UNBIND_ON_ANIMATE",
  "E_STOP_PARTIAL_TRAVEL",
  "E_TRAVEL_ALONG",
  "E_TRAVEL_INFINITE_PATH",
  "E_TRAVEL_DURATION",
  "E_TRAVEL_RANGE",
  "E_TRAVEL_FROM_CURRENT",
  "E_TRAVEL_OPTION",
  "E_GROUP_CHILD_UNKNOWN",
  "E_GROUP_CYCLE",
  "E_GROUP_TARGET_NOT_GROUP",
  "E_GROUP_LAYOUT",
  "E_UNGROUP_NOT_MEMBER",
  "E_SCENE_ACTION",
  "E_SCENE_PROPERTY",
  "E_VIEW_FOCUS_UNBOUNDED",
  "E_VIEW_MARGIN_WITHOUT_FOCUS",
  "E_VIEW_RANGE",
  "E_ANCHOR_INDEX",
  "W_SPEED_PATH_MAY_CHANGE",
] as const;

export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[number];
export type Severity = "error" | "warning";

export interface Diagnostic {
  severity: Severity;
  code: DiagnosticCode;
  message: string;
  stepIndex?: number;
  field?: string;
}

export interface DiagnosticWhere {
  stepIndex?: number;
  field?: string;
}

export class DiagnosticCollector {
  private readonly diagnostics: Diagnostic[] = [];

  error(code: DiagnosticCode, message: string, where?: DiagnosticWhere): void {
    if (code.startsWith("W_")) {
      throw new Error("Presk internal: warning code passed to error()");
    }

    this.diagnostics.push({ severity: "error", code, message, ...where });
  }

  warning(code: DiagnosticCode, message: string, where?: DiagnosticWhere): void {
    if (code.startsWith("E_")) {
      throw new Error("Presk internal: error code passed to warning()");
    }

    this.diagnostics.push({ severity: "warning", code, message, ...where });
  }

  merge(items: readonly Diagnostic[]): void {
    this.diagnostics.push(...items);
  }

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  get items(): readonly Diagnostic[] {
    return this.diagnostics;
  }

  get errors(): readonly Diagnostic[] {
    return this.diagnostics.filter((diagnostic) => diagnostic.severity === "error");
  }

  get warnings(): readonly Diagnostic[] {
    return this.diagnostics.filter((diagnostic) => diagnostic.severity === "warning");
  }
}

export class PreskCompileError extends Error {
  readonly diagnostics: readonly Diagnostic[];

  constructor(diagnostics: readonly Diagnostic[]) {
    const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
    const codes = [...new Set(errors.map((diagnostic) => diagnostic.code))];
    super(`Presk compile failed: ${errors.length} error(s): ${codes.join(", ")}`);
    this.name = "PreskCompileError";
    this.diagnostics = diagnostics;
  }
}

export class PreskRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreskRuntimeError";
  }
}
