import type { CustomCompiler } from "@/engine/compile/value";
import { parseTextFrame, parseTextHighlight, serializeTextFrame, serializeTextHighlight } from "@/model/textDecorations";

export function registerTextDecorationCompilers(registry: Record<string, CustomCompiler>): void {
  registry["text.frame"] = compileTextFrame;
  registry["text.highlight"] = compileTextHighlight;
}

const compileTextFrame: CustomCompiler = (_spec, raw, ctx) => {
  const parsed = parseTextFrame(raw);
  if (!parsed.ok) {
    reportInvalid(parsed.reason, "frame", ctx);
    return null;
  }
  const value = serializeTextFrame(parsed.value);
  return { value: () => value, reads: [] };
};

const compileTextHighlight: CustomCompiler = (_spec, raw, ctx) => {
  const parsed = parseTextHighlight(raw);
  if (!parsed.ok) {
    reportInvalid(parsed.reason, "highlight", ctx);
    return null;
  }
  const value = serializeTextHighlight(parsed.value);
  return { value: () => value, reads: [] };
};

function reportInvalid(
  reason: "type" | "color" | "range",
  property: "frame" | "highlight",
  ctx: Parameters<CustomCompiler>[2],
): void {
  if (reason === "type") {
    ctx.d.error("E_VALUE_TYPE", `Expected 'none' or a string value for text ${property}`, ctx.where);
  } else if (reason === "color") {
    ctx.d.error("E_COLOR_INVALID", `Invalid color for text ${property}`, ctx.where);
  } else {
    ctx.d.error("E_VALUE_RANGE", "Text frame width must be greater than zero", ctx.where);
  }
}
