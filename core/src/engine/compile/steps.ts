import type { DiagnosticCollector } from "@/lang/diagnostics";
import type { Step } from "@/lang/types";
import { DEFAULT_START, parseStart } from "@/lang/start";
import type { Catalog } from "@/model/catalog";
import { createScope } from "@/engine/analyze/scope";
import { compileProperties } from "@/engine/compile/properties";
import { GROUP_DEF } from "@/model/classes/groupObject";
import type { CompiledEffect, CompiledProp, DraftAction, TravelDraft } from "@/engine/program";

export function compileSteps(
  steps: readonly Step[],
  types: ReadonlyMap<string, string>,
  catalog: Catalog,
  d: DiagnosticCollector,
): DraftAction[] {
  const drafts: DraftAction[] = [];
  const scope = createScope(catalog, types);
  const staticParent = new Map<string, string>();
  const groupLayouts = new Map<string, string>();
  for (const step of steps) {
    if (step.action === "create" && step.type === "group") {
      const layout = step.properties?.layout;
      if (typeof layout === "string") groupLayouts.set(step.target, layout);
    }
  }

  steps.forEach((step, index) => {
    if (step.action === "create") return;
    const type = step.target === "scene" ? "scene" : types.get(step.target);
    if (type === undefined) {
      d.error("E_OBJECT_UNKNOWN", `Unknown object '${step.target}'`, { stepIndex: index, field: "target" });
      return;
    }
    const def = catalog.get(type);
    if (!def) {
      d.error("E_TYPE_UNKNOWN", `Unknown type '${type}'`, { stepIndex: index, field: "target" });
      return;
    }

    const startSpec = parseStart(step.start) ?? DEFAULT_START;
    const name = step.name === undefined ? {} : { name: step.name };
    const where = { stepIndex: index, field: "properties" };

    switch (step.action) {
      case "set": {
        const entries = compileProperties(step.properties, "set", def, { scope, d, stepIndex: index });
        if (entries) drafts.push({ action: "set", index, target: step.target, ...name, startSpec, entries });
        return;
      }
      case "animate": {
        const entries = compileProperties(step.properties, "animate", def, { scope, d, stepIndex: index });
        if (!entries) return;
        const hasInterp = entries.some((entry) => entry.kind === "prop");
        if (hasInterp && step.duration === undefined) {
          d.error("E_DURATION_MISSING", "Animated properties require a duration", { stepIndex: index, field: "duration" });
          return;
        }
        const effects = entries.filter((entry): entry is CompiledEffect => entry.kind === "effect");
        const effectDefaultDuration = hasInterp || effects.length === 0
          ? undefined
          : Math.max(...effects.map(({ def: effect }) => effect.defaultDuration));
        const ease = step.ease
          ?? (!hasInterp && effects.length > 0 ? effects[0].def.defaultEase : "linear");
        drafts.push({
          action: "animate",
          index,
          target: step.target,
          ...name,
          startSpec,
          entries,
          ease,
          repeat: step.repeat ?? 1,
          repeatMode: step.repeatMode ?? "restart",
          ...(step.duration === undefined ? {} : { explicitDuration: step.duration }),
          ...(effectDefaultDuration === undefined ? {} : { effectDefaultDuration }),
        });
        return;
      }
      case "bind": {
        const entries = compileProperties(step.properties, "bind", def, { scope, d, stepIndex: index });
        if (entries) {
          const props = entries.filter((entry): entry is CompiledProp => entry.kind === "prop");
          drafts.push({ action: "bind", index, target: step.target, ...name, startSpec, entries: props });
        }
        return;
      }
      case "unbind":
      case "stop": {
        const keys = step.properties ?? null;
        let invalid = false;
        for (const key of keys ?? []) {
          if (!def.props[key] && !def.effects[key]) {
            d.error("E_PROPERTY_UNKNOWN", `Unknown property '${key}'`, { ...where, field: `properties.${key}` });
            invalid = true;
          }
        }
        if (!invalid) drafts.push({ action: step.action, index, target: step.target, ...name, startSpec, keys });
        return;
      }
      case "travel": {
        const separator = step.along.indexOf(".");
        const alongObject = separator === -1 ? step.along : step.along.slice(0, separator);
        const pathName = separator === -1 ? "main" : step.along.slice(separator + 1);
        const alongType = types.get(alongObject);
        const alongDef = alongType === undefined ? undefined : catalog.get(alongType);
        if (!alongDef) {
          d.error("E_TRAVEL_ALONG", `Unknown path object '${alongObject}'`, { stepIndex: index, field: "along" });
          return;
        }
        if (alongDef.family === "unbounded") {
          d.error("E_TRAVEL_INFINITE_PATH", `Cannot travel along an unbounded object '${alongObject}'`, {
            stepIndex: index,
            field: "along",
          });
          return;
        }
        const path = alongDef.paths[pathName];
        if (!path) {
          d.error("E_TRAVEL_ALONG", `Unknown path '${pathName}' on '${alongObject}'`, { stepIndex: index, field: "along" });
          return;
        }

        const anchor = step.anchor ?? "pos";
        const anchorProp = def.props[anchor];
        if (anchor !== "pos" && !(
          anchorProp?.kind === "point"
          && anchorProp.mode === "rw"
          && anchorProp.writes.length === 2
          && anchorProp.writes[0] === "x"
          && anchorProp.writes[1] === "y"
        )) {
          d.error("E_TRAVEL_OPTION", `Invalid travel anchor '${anchor}'`, { stepIndex: index, field: "anchor" });
          return;
        }

        const orient = step.orient === true
          ? { offset: 0 }
          : step.orient && typeof step.orient === "object"
            ? step.orient
            : null;
        const fromSpec = step.from ?? 0;
        const toSpec = step.to;
        if (path.closed === "never"
          && ((typeof fromSpec === "number" && (fromSpec < 0 || fromSpec > 1))
            || (toSpec !== undefined && (toSpec < 0 || toSpec > 1)))) {
          d.error("E_TRAVEL_RANGE", "Travel range must be between 0 and 1 on an open path", {
            stepIndex: index,
            field: "from",
          });
          return;
        }

        const draft: TravelDraft = {
          action: "travel",
          index,
          target: step.target,
          ...name,
          startSpec,
          along: { object: alongObject, path: pathName },
          fromT: 0,
          toT: 1,
          anchor,
          orient,
          ease: step.ease ?? "linear",
          repeat: step.repeat ?? 1,
          repeatMode: step.repeatMode ?? "restart",
          fromSpec,
          ...(toSpec === undefined ? {} : { toSpec }),
          ...(step.speed === undefined ? {} : { speed: step.speed }),
          ...(step.duration === undefined ? {} : { explicitDuration: step.duration }),
        };
        drafts.push(draft);
        return;
      }
      case "group": {
        if (type !== "group") {
          d.error("E_GROUP_TARGET_NOT_GROUP", `Target '${step.target}' is not a group`, {
            stepIndex: index,
            field: "target",
          });
          return;
        }
        const children = normalizeChildren(step.properties.children, index, d);
        if (children === null) return;
        let invalid = false;
        for (const child of children) {
          const childType = types.get(child);
          const childDef = childType === undefined ? undefined : catalog.get(childType);
          if (child === "scene" || !childDef) {
            d.error("E_GROUP_CHILD_UNKNOWN", `Unknown group child '${child}'`, {
              stepIndex: index,
              field: "properties.children",
            });
            invalid = true;
            continue;
          }
          let ancestor: string | undefined = step.target;
          while (ancestor !== undefined) {
            if (ancestor === child) {
              d.error("E_GROUP_CYCLE", `Grouping '${child}' under '${step.target}' would create a cycle`, {
                stepIndex: index,
                field: "properties.children",
              });
              invalid = true;
              break;
            }
            ancestor = staticParent.get(ancestor);
          }
        }

        const layoutValue = step.properties.layout;
        const effectiveLayout = typeof layoutValue === "string"
          ? layoutValue
          : groupLayouts.get(step.target) ?? "none";
        const properties = Object.fromEntries(
          Object.entries(step.properties).filter(([key]) => key !== "children"),
        );
        const props = compileProperties(properties, "set", GROUP_DEF, {
          scope,
          d,
          stepIndex: index,
        });
        if (!props) invalid = true;

        if (effectiveLayout === "vertical" || effectiveLayout === "horizontal") {
          for (const child of children) {
            const childType = types.get(child);
            const childDef = childType === undefined ? undefined : catalog.get(childType);
            if (childDef && (childDef.family === "unbounded" || childDef.family === "point")) {
              d.error("E_GROUP_LAYOUT", `Object '${child}' cannot be placed in a group with layout`, {
                stepIndex: index,
                field: "properties.children",
              });
              invalid = true;
            }
          }
        }
        if (typeof layoutValue === "string" && ["vertical", "horizontal", "none"].includes(layoutValue)) {
          groupLayouts.set(step.target, layoutValue);
        }
        if (invalid || !props) return;

        for (const child of children) staticParent.set(child, step.target);
        drafts.push({
          action: "group",
          index,
          target: step.target,
          ...name,
          startSpec,
          props,
          children,
          ease: step.ease ?? "linear",
          ...(step.duration === undefined ? {} : { explicitDuration: step.duration }),
        });
        return;
      }
      case "ungroup": {
        if (type !== "group") {
          d.error("E_GROUP_TARGET_NOT_GROUP", `Target '${step.target}' is not a group`, {
            stepIndex: index,
            field: "target",
          });
          return;
        }
        const requested = step.properties?.children;
        const children = requested === undefined
          ? null
          : normalizeChildren(requested, index, d);
        if (requested !== undefined && children === null) return;
        const ungroupChildren = children ?? [...staticParent]
          .filter(([, parent]) => parent === step.target)
          .map(([child]) => child);
        let invalid = false;
        for (const child of ungroupChildren) {
          if (staticParent.get(child) !== step.target) {
            d.error("E_UNGROUP_NOT_MEMBER", `Object '${child}' is not a child of '${step.target}'`, {
              stepIndex: index,
              field: "properties.children",
            });
            invalid = true;
          }
        }
        if (invalid) return;
        for (const child of ungroupChildren) staticParent.delete(child);
        drafts.push({
          action: "ungroup",
          index,
          target: step.target,
          ...name,
          startSpec,
          children: requested === undefined ? null : ungroupChildren,
        });
        return;
      }
    }
  });

  return drafts;
}

function normalizeChildren(
  value: unknown,
  stepIndex: number,
  d: DiagnosticCollector,
): string[] | null {
  if (typeof value === "string") return [value];
  if (Array.isArray(value) && value.every((child) => typeof child === "string")) {
    return value;
  }
  d.error(
    value === undefined ? "E_FIELD_REQUIRED" : "E_FIELD_TYPE",
    "Group children must be a string or an array of strings",
    { stepIndex, field: "properties.children" },
  );
  return null;
}
