const NAMED_COLORS: Record<string, number> = {
  black: 0x000000,
  silver: 0xc0c0c0,
  gray: 0x808080,
  white: 0xffffff,
  maroon: 0x800000,
  red: 0xff0000,
  purple: 0x800080,
  fuchsia: 0xff00ff,
  green: 0x008000,
  lime: 0x00ff00,
  olive: 0x808000,
  yellow: 0xffff00,
  navy: 0x000080,
  blue: 0x0000ff,
  teal: 0x008080,
  aqua: 0x00ffff,
  orange: 0xffa500,
  pink: 0xffc0cb,
  brown: 0xa52a2a,
  cyan: 0x00ffff,
  magenta: 0xff00ff,
  gold: 0xffd700,
  violet: 0xee82ee,
  indigo: 0x4b0082,
  lightgray: 0xd3d3d3,
  darkgray: 0xa9a9a9,
};

export const COLOR_STRING_RE = /^#[0-9a-f]{6}([0-9a-f]{2})?$/;

export function parseColor(input: unknown): string | null {
  if (typeof input === "number") {
    if (!Number.isInteger(input) || input < 0 || input > 0xffffff) return null;
    return `#${input.toString(16).padStart(6, "0")}`;
  }
  if (typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase();

  if (Object.prototype.hasOwnProperty.call(NAMED_COLORS, trimmed)) {
    const val = NAMED_COLORS[trimmed];
    return `#${val.toString(16).padStart(6, "0")}`;
  }

  if (/^#[0-9a-f]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  if (/^#[0-9a-f]{4}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    const a = trimmed[4];
    const alphaByte = `${a}${a}`;
    if (alphaByte === "ff") {
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return `#${r}${r}${g}${g}${b}${b}${alphaByte}`;
  }

  if (/^#[0-9a-f]{6}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^#[0-9a-f]{8}$/.test(trimmed)) {
    const alpha = trimmed.slice(7, 9);
    if (alpha === "ff") {
      return trimmed.slice(0, 7);
    }
    return trimmed;
  }

  return null;
}

export function splitColor(c: string | number): { rgb: number; alpha: number } {
  if (typeof c === "number") {
    if (!Number.isInteger(c) || c < 0 || c > 0xffffff) {
      throw new Error("Presk internal: invalid colour");
    }
    return { rgb: c, alpha: 1 };
  }
  if (typeof c === "string") {
    const lower = c.trim().toLowerCase();
    if (!COLOR_STRING_RE.test(lower)) {
      throw new Error("Presk internal: invalid colour");
    }
    const rgbStr = lower.slice(1, 7);
    const rgb = Number.parseInt(rgbStr, 16);
    let alpha = 1;
    if (lower.length === 9) {
      const alphaStr = lower.slice(7, 9);
      alpha = Number.parseInt(alphaStr, 16) / 255;
    }
    return { rgb, alpha };
  }
  throw new Error("Presk internal: invalid colour");
}

export function colorFromRgba(r: number, g: number, b: number, a01: number): string {
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(val)));
  const rc = clamp(r, 0, 255);
  const gc = clamp(g, 0, 255);
  const bc = clamp(b, 0, 255);
  const ac = Number.isFinite(a01) ? Math.max(0, Math.min(1, a01)) : 1;
  const alphaByte = Math.round(ac * 255);
  const hexRgb = ((rc << 16) | (gc << 8) | bc).toString(16).padStart(6, "0");
  if (alphaByte === 255) {
    return `#${hexRgb}`;
  }
  const hexAlpha = alphaByte.toString(16).padStart(2, "0");
  return `#${hexRgb}${hexAlpha}`;
}

export function lerpColor(a: string, b: string, t: number): string {
  const colorA = splitColor(a);
  const colorB = splitColor(b);
  const extractChannels = (rgb: number, alpha: number) => ({
    r: (rgb >> 16) & 0xff,
    g: (rgb >> 8) & 0xff,
    b: rgb & 0xff,
    a: Math.round(alpha * 255),
  });
  const ca = extractChannels(colorA.rgb, colorA.alpha);
  const cb = extractChannels(colorB.rgb, colorB.alpha);

  const lerpChannel = (from: number, to: number) => Math.max(0, Math.min(255, Math.round(from + (to - from) * t)));
  const r = lerpChannel(ca.r, cb.r);
  const g = lerpChannel(ca.g, cb.g);
  const bChan = lerpChannel(ca.b, cb.b);
  const aByte = lerpChannel(ca.a, cb.a);

  return colorFromRgba(r, g, bChan, aByte / 255);
}
