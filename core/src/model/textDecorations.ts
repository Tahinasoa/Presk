import { parseColor } from "@/geom/color";

export interface TextFrame {
  color: string;
  width: number;
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: "type" | "color" | "range" };

export function parseTextFrame(input: unknown): ParseResult<TextFrame | null> {
  if (typeof input !== "string") return { ok: false, reason: "type" };
  const value = input.trim();
  if (value.toLowerCase() === "none") return { ok: true, value: null };

  const match = /^(.*?)(?:\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*px)?$/i.exec(value);
  if (!match) return { ok: false, reason: "color" };
  const color = parseColor(match[1]?.trim());
  if (color === null) return { ok: false, reason: "color" };

  const width = match[2] === undefined ? 1 : Number(match[2]);
  if (!Number.isFinite(width) || width <= 0) return { ok: false, reason: "range" };
  return { ok: true, value: { color, width } };
}

export function parseTextHighlight(input: unknown): ParseResult<string | null> {
  if (typeof input !== "string") return { ok: false, reason: "type" };
  const value = input.trim();
  if (value.toLowerCase() === "none") return { ok: true, value: null };
  const color = parseColor(value);
  return color === null ? { ok: false, reason: "color" } : { ok: true, value: color };
}

export function serializeTextFrame(frame: TextFrame | null): string {
  return frame === null ? "none" : `${frame.color} ${frame.width}px`;
}

export function serializeTextHighlight(highlight: string | null): string {
  return highlight ?? "none";
}
