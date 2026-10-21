export type StartSpec =
  | { kind: "absolute"; time: number }
  | { kind: "prevStart"; offset: number }
  | { kind: "prevEnd"; offset: number }
  | { kind: "labelStart"; label: string; offset: number }
  | { kind: "labelEnd"; label: string; offset: number };

export const DEFAULT_START: StartSpec = { kind: "prevEnd", offset: 0 };

const ABSOLUTE_PATTERN = /^-?\d+(\.\d+)?$/;
const PREVIOUS_PATTERN = /^([<>])(-?\d+(\.\d+)?)?$/;
const LABEL_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*)(?:([<>])(-?\d+(\.\d+)?))?$/;

export function parseStart(value: unknown): StartSpec | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? { kind: "absolute", time: value } : null;
  }
  if (typeof value !== "string") {
    return null;
  }

  if (ABSOLUTE_PATTERN.test(value)) {
    return { kind: "absolute", time: Number(value) };
  }

  const previousMatch = PREVIOUS_PATTERN.exec(value);
  if (previousMatch) {
    const offset = Number(previousMatch[2] ?? 0);
    return previousMatch[1] === "<"
      ? { kind: "prevStart", offset }
      : { kind: "prevEnd", offset };
  }

  const labelMatch = LABEL_PATTERN.exec(value);
  if (labelMatch) {
    const label = labelMatch[1];
    const operator = labelMatch[2];
    const offset = Number(labelMatch[3] ?? 0);
    return operator === ">"
      ? { kind: "labelEnd", label, offset }
      : { kind: "labelStart", label, offset };
  }

  return null;
}
