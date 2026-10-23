// Layer rules (ADR-003). Pure functions, no filesystem access.

export const NEW_LAYERS = ["lang", "geom", "model", "engine", "view", "app"] as const;
export type Layer = (typeof NEW_LAYERS)[number];

const ALLOWED: Record<Layer, readonly Layer[]> = {
  lang: ["lang"],
  geom: ["geom"],
  model: ["lang", "geom", "model"],
  engine: ["lang", "geom", "model", "engine"],
  view: ["model", "geom", "view"],
  app: ["lang", "geom", "model", "engine", "view", "app"],
};
const PIXI_LAYERS: readonly Layer[] = ["view", "app"];
const PURE_LAYERS: readonly Layer[] = ["lang", "geom", "model", "engine"];

export function layerOf(relPath: string): Layer | null {
  const top = relPath.split("/")[0];
  return (NEW_LAYERS as readonly string[]).includes(top) ? (top as Layer) : null;
}

export function extractSpecifiers(source: string): string[] {
  const out: string[] = [];
  const re = /(?:import|export)\s[^"';]*?from\s*["']([^"']+)["']|import\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  for (const m of source.matchAll(re)) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

/** relPath: path relative to core/src, e.g. "model/sceneObject.ts". Returns violation messages. */
export function checkFile(relPath: string, source: string): string[] {
  const layer = layerOf(relPath);
  if (!layer) return [];
  const isTest = relPath.endsWith(".test.ts");
  const problems: string[] = [];
  for (const spec of extractSpecifiers(source)) {
    if (spec.startsWith("@/")) {
      const target = layerOf(spec.slice(2));
      if (!target) {
        problems.push(`${relPath}: imports legacy or unknown module "${spec}"`);
      } else if (!ALLOWED[layer].includes(target)) {
        problems.push(`${relPath}: layer "${layer}" must not import layer "${target}" ("${spec}")`);
      }
    } else if (spec.startsWith(".")) {
      const depth = spec.split("/").filter((p) => p === "..").length;
      const dirDepth = relPath.split("/").length - 1;
      if (depth >= dirDepth) problems.push(`${relPath}: relative import "${spec}" leaves its layer (use "@/")`);
    } else if (spec === "pixi.js") {
      if (!PIXI_LAYERS.includes(layer)) problems.push(`${relPath}: pixi.js is only allowed in view/ and app/`);
    } else if (spec === "transformation-matrix") {
      if (relPath !== "geom/matrix.ts" && relPath !== "geom/matrix.test.ts") problems.push(`${relPath}: transformation-matrix only allowed in geom/matrix.ts`);
    } else if (spec === "vitest" || spec.startsWith("node:")) {
      if (!isTest) problems.push(`${relPath}: "${spec}" only allowed in test files`);
    } else {
      problems.push(`${relPath}: unexpected external import "${spec}"`);
    }
  }
  if (!isTest && PURE_LAYERS.includes(layer)) {
    if (/\b(document|window)\./.test(source)) problems.push(`${relPath}: DOM access in a pure layer`);
    if (/\b(Date\.now|Math\.random|performance\.now)\b/.test(source)) problems.push(`${relPath}: non-deterministic call in a pure layer`);
  }
  return problems;
}
