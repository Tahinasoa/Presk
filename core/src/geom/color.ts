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

export function parseColor(input: unknown): number | null {
  if (typeof input === "number") {
    return Number.isInteger(input) && input >= 0 && input <= 0xffffff ? input : null;
  }
  if (typeof input !== "string") return null;

  const normalized = input.toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(normalized)) {
    const red = normalized[1];
    const green = normalized[2];
    const blue = normalized[3];
    return Number.parseInt(`${red}${red}${green}${green}${blue}${blue}`, 16);
  }
  if (/^#[0-9a-f]{6}$/.test(normalized)) return Number.parseInt(normalized.slice(1), 16);
  return NAMED_COLORS[normalized] ?? null;
}

export function lerpColor(a: number, b: number, t: number): number {
  const channel = (shift: number): number => {
    const from = (a >> shift) & 0xff;
    const to = (b >> shift) & 0xff;
    return Math.max(0, Math.min(255, Math.round(from + (to - from) * t)));
  };
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}
