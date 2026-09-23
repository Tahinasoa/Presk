// Compiles a DSL document (spec §2-§11) into a GSAP timeline that drives a
// Presk instance. See compiler/README.md for the reasoning behind leaning
// on GSAP's own position-parameter syntax and functional values.
//
// Uses materializeScene() for sequential two-pass object creation and
// delegates all animation/setting actions to KObject's transform() and setNow().

import gsap from "gsap";
import type Presk from "@/presk";
import { evaluateExpression } from "@/binding/expression";
import type { DslDocument, DslStep } from "./types";

function isExpression(value: unknown): value is string {
  return typeof value === "string";
}

/** Resolves a properties object once, right now, against the current scene state. Used by "create" and "set". */
function resolveNow(properties: Record<string, unknown>, presk: Presk): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "number" || typeof value === "string" || typeof value === "boolean" || (value && typeof value === "object")) {
      if (typeof value === "number" || typeof value === "boolean") {
        resolved[key] = value;
      } else if (isExpression(value)) {
        // "text" properties (e.g. a text object's `text` field) are strings
        // that are *not* expressions — only try to evaluate them as one if
        // they look like a Presk reference/arithmetic expression.
        resolved[key] =
          /^[A-Za-z0-9_.\s+\-*/]+$/.test(value) // 1. Whitelist valid expression characters only
          && /[A-Za-z]/.test(value)         // 2. Must contain at least one letter (identifies property/variable references)
          && value.includes(".")            // 3. Must contain at least one dot (identifies object.property access)
          ? evaluateExpression(value, presk.scene)
          : value;
      } else if (Array.isArray(value)) {
        resolved[key] = value;
      } else if (value && typeof value === "object") {
        // Recursively resolve nested objects (e.g. position: { x: ..., y: ... })
        resolved[key] = resolveNow(value as Record<string, unknown>, presk);
      }
    }
  }
  return resolved;
}

/**
 * Builds the GSAP tween vars for a "transform" step. Expression-valued
 * properties become *functional values* so GSAP evaluates them once, the
 * first time the tween renders (spec §8.3: transform freezes at start).
 */
function toTweenVars(properties: Record<string, unknown>, presk: Presk): Record<string, unknown> {
  const vars: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "number" || typeof value === "boolean") {
      vars[key] = value;
    } else if (isExpression(value)) {
      vars[key] = () => evaluateExpression(value, presk.scene);
    } else if (value && typeof value === "object") {
      // Recursively wrap nested objects for transform vars
      const nested: Record<string, unknown> = {};
      for (const [subKey, subVal] of Object.entries(value as Record<string, unknown>)) {
        if (typeof subVal === "number" || typeof subVal === "boolean") {
          nested[subKey] = subVal;
        } else if (isExpression(subVal)) {
          nested[subKey] = () => evaluateExpression(subVal, presk.scene);
        } else {
          nested[subKey] = subVal;
        }
      }
      vars[key] = nested;
    } else {
      vars[key] = value;
    }
  }
  return vars;
}

/**
 * Materializes all "create" steps sequentially prior to timeline compilation
 * (two-pass model: 1. instantiate shells, 2. resolve & apply initial properties).
 */
export function materializeScene(steps: DslStep[], presk: Presk): void {
  // Pass 1: Instanciate shells with resolved initial properties and register them immediately in presk.scene
  for (const step of steps) {
    if (step.action === "create") {
      if (!step.type) throw new Error(`Presk compiler: "create" step for "${step.target}" is missing "type".`);
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      const resolved = resolveNow(properties, presk);
      presk.create(step.type, step.target, resolved);
    }
  }
}

export function compile(doc: DslDocument, presk: Presk): gsap.core.Timeline {
  // Pre-materialize all create steps so targets exist as shells for references
  materializeScene(doc.steps, presk);

  const tl = gsap.timeline({ paused: true });

  for (const step of doc.steps) {
    addStep(tl, step, presk);
  }

  return tl;
}

function addStep(tl: gsap.core.Timeline, step: DslStep, presk: Presk): void {
  const position = step.start; // undefined behaves like the spec's default ">" (sequential)

  switch (step.action) {
    case "create": {
      const target = presk.scene.get(step.target);
      if (!target) throw new Error(`Presk: "create" step targets unknown object "${step.target}".`);
      const creationTween = target.createAnimation({
        duration: step.duration,
        ease: step.ease,
      });
      tl.add(creationTween, position);
      break;
    }

    case "set": {
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      tl.call(
        () => {
          const target = presk.scene.get(step.target);
          if (!target) throw new Error(`Presk: "set" targets unknown object "${step.target}".`);
          const data = resolveNow(properties, presk);
          target.setNow(data);
        },
        undefined,
        position,
      );
      break;
    }

    case "transform": {
      const target = presk.scene.get(step.target);
      if (!target) throw new Error(`Presk: "transform" targets unknown object "${step.target}".`);
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      const tweenData = toTweenVars(properties, presk);
      const tween = target.transform(tweenData, {
        duration: step.duration ?? 0,
        ease: step.ease,
      });
      tl.add(tween, position);
      break;
    }

    case "follow": {
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      const asStrings: Record<string, string> = {};
      for (const [key, value] of Object.entries(properties)) {
        if (!isExpression(value)) {
          throw new Error(`Presk compiler: "follow" property "${key}" must be an expression string.`);
        }
        asStrings[key] = value;
      }
      tl.call(() => presk.binding.follow(step.target, asStrings), undefined, position);
      break;
    }

    case "unfollow": {
      const properties = step.properties as string[] | undefined;
      tl.call(() => presk.binding.unfollow(step.target, properties), undefined, position);
      break;
    }

    case "destroy": {
      tl.call(() => presk.destroy(step.target), undefined, position);
      break;
    }

    case "group":
    case "ungroup":
      console.warn(`Presk compiler: "${step.action}" is not implemented yet, skipping step for "${step.target}".`);
      break;

    default:
      throw new Error(`Presk compiler: unknown action "${step.action satisfies never}".`);
  }

  if (step.name) {
    tl.addLabel(step.name, "<");
  }
}
