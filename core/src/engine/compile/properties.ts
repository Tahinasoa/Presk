import type { DiagnosticCollector } from "@/lang/diagnostics";
import type { PropertiesObject } from "@/lang/types";
import type { Pt } from "@/geom/vec";
import type { AnalyzeScope } from "@/engine/analyze/scope";
import { compileValue } from "@/engine/compile/value";
import type { CompiledEntry } from "@/engine/program";
import type { ClassDef, IndexedPropSpec, PropSpec } from "@/model/values";
import type { SceneObject } from "@/model/sceneObject";

export function compileProperties(
  raw: PropertiesObject,
  mode: "create" | "set" | "animate" | "bind",
  def: ClassDef,
  ctx: { scope: AnalyzeScope; d: DiagnosticCollector; stepIndex: number },
): CompiledEntry[] | null {
  const errorsBefore = ctx.d.errors.length;
  const compiled: { entry: CompiledEntry; sourceIndex: number; order: number }[] = [];
  const seenWrites = new Set<string>();
  let failed = false;
  let focusMargin = 0;

  if (def.type === "scene" && Object.hasOwn(raw, "focusMargin")) {
    if (!Object.hasOwn(raw, "focusOn")) {
      ctx.d.error("E_VIEW_MARGIN_WITHOUT_FOCUS", "focusMargin requires focusOn", {
        stepIndex: ctx.stepIndex,
        field: "properties.focusMargin",
      });
      failed = true;
    } else if (typeof raw.focusMargin !== "number" || !Number.isFinite(raw.focusMargin)) {
      ctx.d.error("E_VALUE_TYPE", "focusMargin must be a finite number", {
        stepIndex: ctx.stepIndex,
        field: "properties.focusMargin",
      });
      failed = true;
    } else {
      focusMargin = raw.focusMargin;
    }
  }

  for (const [key, rawValue] of Object.entries(raw)) {
    if (def.type === "scene" && key === "focusMargin") continue;
    const where = { stepIndex: ctx.stepIndex, field: `properties.${key}` };
    const prop = def.props[key];
    if (prop) {
      if (prop.mode === "ro") {
        ctx.d.error(def.type === "scene" ? "E_SCENE_PROPERTY" : "E_PROPERTY_READONLY", `Property '${key}' is read-only`, where);
        failed = true;
        continue;
      }
      if (mode === "animate" && !prop.animatable) {
        ctx.d.error("E_PROPERTY_NOT_ANIMATABLE", `Property '${key}' is not animatable`, where);
        failed = true;
        continue;
      }
      if (mode === "bind" && !(prop.mode === "rw"
        && (prop.kind === "number" || prop.kind === "point" || prop.kind === "view"))) {
        ctx.d.error("E_PROPERTY_NOT_BINDABLE", `Property '${key}' is not bindable`, where);
        failed = true;
        continue;
      }
      const value = compileValue(prop, rawValue, {
        scope: ctx.scope,
        d: ctx.d,
        where,
        ...(def.type === "scene" && key === "focusOn" ? { focusMargin } : {}),
      });
      if (!value) {
        failed = true;
        continue;
      }
      if (hasDuplicateWrite(prop.writes, seenWrites)) {
        ctx.d.error("E_PROPERTY_DUPLICATE", `Property '${key}' duplicates a write in this step`, where);
        failed = true;
        continue;
      }
      for (const write of prop.writes) seenWrites.add(write);
      compiled.push({
        entry: { kind: "prop", name: key, spec: prop, value: value.value, reads: value.reads },
        sourceIndex: compiled.length,
        order: prop.order,
      });
      continue;
    }

    const indexedMatch = /^([A-Za-z_]\w*)\[(\d+)\]$/.exec(key);
    if (indexedMatch) {
      const [, name, indexText] = indexedMatch;
      const indexed = def.indexed[name];
      if (!indexed) {
        unknownProperty(key, def, ctx, where);
        failed = true;
        continue;
      }
      if (!indexed.set) {
        ctx.d.error(def.type === "scene" ? "E_SCENE_PROPERTY" : "E_PROPERTY_READONLY", `Indexed property '${name}' is read-only`, where);
        failed = true;
        continue;
      }
      const index = Number(indexText);
      const synthetic = indexedPropSpec(indexed, index);
      if (mode === "animate" && !synthetic.animatable) {
        ctx.d.error("E_PROPERTY_NOT_ANIMATABLE", `Indexed property '${key}' is not animatable`, where);
        failed = true;
        continue;
      }
      if (mode === "bind" && !(synthetic.mode === "rw" && synthetic.kind === "point")) {
        ctx.d.error("E_PROPERTY_NOT_BINDABLE", `Indexed property '${key}' is not bindable`, where);
        failed = true;
        continue;
      }
      const value = compileValue(synthetic, rawValue, { scope: ctx.scope, d: ctx.d, where });
      if (!value) {
        failed = true;
        continue;
      }
      if (hasDuplicateWrite(synthetic.writes, seenWrites)) {
        ctx.d.error("E_PROPERTY_DUPLICATE", `Property '${key}' duplicates a write in this step`, where);
        failed = true;
        continue;
      }
      for (const write of synthetic.writes) seenWrites.add(write);
      compiled.push({
        entry: { kind: "prop", name: key, spec: synthetic, value: value.value, reads: value.reads },
        sourceIndex: compiled.length,
        order: synthetic.order,
      });
      continue;
    }

    const effect = def.effects[key];
    if (effect) {
      if (mode === "bind") {
        ctx.d.error("E_EFFECT_BIND", `Effect '${key}' cannot be bound`, where);
        failed = true;
        continue;
      }
      let variant: string;
      let on: boolean;
      if (rawValue === true) {
        variant = "default";
        on = true;
      } else if (rawValue === false) {
        variant = "";
        on = false;
      } else if (typeof rawValue === "string" && effect.variants.includes(rawValue)) {
        variant = rawValue;
        on = true;
      } else {
        ctx.d.error("E_EFFECT_VALUE", `Invalid value for effect '${key}'`, where);
        failed = true;
        continue;
      }
      compiled.push({
        entry: { kind: "effect", name: key, def: effect, variant, on },
        sourceIndex: compiled.length,
        order: Number.POSITIVE_INFINITY,
      });
      continue;
    }

    unknownProperty(key, def, ctx, where);
    failed = true;
  }

  if (mode === "create") {
    for (const [name, prop] of Object.entries(def.props)) {
      if (prop.required && !Object.hasOwn(raw, name)) {
        ctx.d.error("E_FIELD_REQUIRED", `Required property '${name}' is missing`, {
          stepIndex: ctx.stepIndex,
          field: `properties.${name}`,
        });
        failed = true;
      }
    }
  }

  if (failed || ctx.d.errors.length > errorsBefore) return null;
  compiled.sort((a, b) => a.order - b.order || a.sourceIndex - b.sourceIndex);
  return compiled.map(({ entry }) => entry);
}

function unknownProperty(
  key: string,
  def: ClassDef,
  ctx: { d: DiagnosticCollector; stepIndex: number },
  where: { stepIndex: number; field: string },
): void {
  const code = def.type === "scene" ? "E_SCENE_PROPERTY" : "E_PROPERTY_UNKNOWN";
  ctx.d.error(code, `Unknown property '${key}'`, where);
}

function hasDuplicateWrite(writes: readonly string[], seen: ReadonlySet<string>): boolean {
  return writes.some((write) => seen.has(write));
}

function indexedPropSpec(indexed: IndexedPropSpec, index: number): PropSpec {
  const setter = indexed.set;
  if (!setter) throw new Error("Presk internal: indexed property setter is missing");
  return {
    kind: "point",
    writes: [indexed.writeKey(index)],
    mode: "rw",
    animatable: true,
    order: 2,
    get: (object: SceneObject) => indexed.get(object, index),
    set: (object, value) => setter(object, index, value as Pt),
  };
}
