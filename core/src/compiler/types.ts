// TypeScript shape of a Presk DSL document, per language/spec.md §2-§11.
// Deliberately permissive (properties are Record<string, unknown>) rather
// than exhaustively typed per action, since expression strings and numeric
// literals are both valid property values and the exact set of properties
// depends on the registered type (spec §4.1 lists the common ones, but a
// lib/ component can add its own).

export type DslAction = "create" | "set" | "transform" | "follow" | "unfollow" | "group" | "ungroup" | "destroy";

export interface DslStep {
  action: DslAction;
  target: string;
  /** Required for "create"; the registered DSL type name (e.g. "shape", "text"). */
  type?: string;
  /** Property values: number, or an expression string per spec §8.2. For "unfollow", a list of prop names instead. */
  properties?: Record<string, unknown> | string[];
  /** Optional label for this action, referenceable by later steps' `start` (spec §6.1). */
  name?: string;
  /** GSAP-style position parameter (spec §6.1). Defaults to sequential (same as ">"). */
  start?: string | number;
  /** Seconds. Required for interpolated `transform`s. */
  duration?: number;
  /** GSAP easing name (spec §6.3). */
  ease?: string;
}

export interface DslDocument {
  version: string;
  scene: {
    width: number;
    height: number;
    background?: string;
  };
  steps: DslStep[];
}
