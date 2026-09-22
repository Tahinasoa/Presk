// Compiles a DSL document (spec §2-§11) into a GSAP timeline that drives a
// Presk instance. See compiler/README.md for the reasoning behind leaning
// on GSAP's own position-parameter syntax and functional values.

import gsap from "gsap";
import type Presk from "@/presk";
import { evaluateExpression } from "@/binding/expression";
import type { DslDocument, DslStep } from "./types";

function isExpression(value: unknown): value is string {
  return typeof value === "string";
}

/** Resolves a properties object once, right now, against the current scene state. Used by "create" and "set". */
function resolveNow(properties: Record<string, unknown>, presk: Presk): Record<string, number | string> {
  const resolved: Record<string, number | string> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "number") resolved[key] = value;
    else if (isExpression(value)) {
      // "text" properties (e.g. a text object's `text` field) are strings
      // that are *not* expressions — only try to evaluate them as one if
      // they look like a Presk reference/arithmetic expression.
      resolved[key] =
        /^[A-Za-z0-9_.\s+\-*/]+$/.test(value) // 1. Whitelist valid expression characters only
        && /[A-Za-z]/.test(value)         // 2. Must contain at least one letter (identifies property/variable references)
        && value.includes(".")            // 3. Must contain at least one dot (identifies object.property access)
        ? evaluateExpression(value, presk.scene)
        : value;
    } else {
      throw new Error(`Presk compiler: unsupported property value ${JSON.stringify(value)}.`);
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
    if (typeof value === "number") vars[key] = value;
    else if (isExpression(value)) vars[key] = () => evaluateExpression(value, presk.scene);
    else throw new Error(`Presk compiler: unsupported "transform" property value ${JSON.stringify(value)}.`);
  }
  return vars;
}

export function compile(doc: DslDocument, presk: Presk): gsap.core.Timeline {
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
      if (!step.type) throw new Error(`Presk compiler: "create" step for "${step.target}" is missing "type".`);
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      tl.call(() => presk.create(step.type as string, step.target, resolveNow(properties, presk)), undefined, position);
      break;
    }

    case "set": {
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      tl.call(
        () => {
          const target = presk.scene.get(step.target) as unknown as Record<string, unknown> | undefined;
          if (!target) throw new Error(`Presk: "set" targets unknown object "${step.target}".`);
          Object.assign(target, resolveNow(properties, presk));
        },
        undefined,
        position,
      );
      break;
    }

    case "transform": {
      const target = () => presk.scene.get(step.target);
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      // The lookup happens via a call wrapper so the target is resolved at
      // the moment the tween actually starts, not at compile time (it may
      // not exist yet if "create" ran earlier in the same timeline build).
      tl.call(
        () => {
          const resolvedTarget = target();
          if (!resolvedTarget) throw new Error(`Presk: "transform" targets unknown object "${step.target}".`);
          gsap.to(resolvedTarget, { ...toTweenVars(properties, presk), duration: step.duration ?? 0, ease: step.ease });
        },
        undefined,
        position,
      );
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
      if (step.duration !== undefined) {
        // TODO(spec §10.2 / §9): path-driven progression (`pathX(name, start, end)`)
        // is not implemented yet, so a `follow` with a duration currently
        // behaves the same as one without — it just binds immediately.
        console.warn(`Presk compiler: "follow" duration on "${step.target}" is ignored (path progression not implemented).`);
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
      // TODO(spec §7): groups are not implemented yet.
      console.warn(`Presk compiler: "${step.action}" is not implemented yet, skipping step for "${step.target}".`);
      break;

    default:
      throw new Error(`Presk compiler: unknown action "${step.action satisfies never}".`);
  }

  if (step.name) {
    tl.addLabel(step.name, "<");
  }
}
