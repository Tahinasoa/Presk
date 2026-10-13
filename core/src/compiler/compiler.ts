// Compiles a DSL document into KTimer-managed KObject tweens and timed actions.

import type Presk from "@/presk";
import type KObject from "@/primitives/kobject/kobject";
import KTween from "@/timer/tween/tween";
import KTimer from "@/timer/ktimer";
import { easings, type EasingName, type EasingFunction } from "@/timer/easing/easing";
import { evaluateExpression } from "@/binding/expression";
import type { DslDocument, DslStep } from "./types";

const easeAliases: Record<string, EasingFunction> = {
  linear: (t) => t,
  none: (t) => t,
  "power0.in": (t) => t,
  "power0.out": (t) => t,
  "power0.inOut": (t) => t,
  "power1.in": easings.easeInQuad,
  "power1.out": easings.easeOutQuad,
  "power1.inOut": easings.easeInOutQuad,
  "power2.in": easings.easeInCubic,
  "power2.out": easings.easeOutCubic,
  "power2.inOut": easings.easeInOutCubic,
  "power3.in": easings.easeInQuart,
  "power3.out": easings.easeOutQuart,
  "power3.inOut": easings.easeInOutQuart,
  "power4.in": easings.easeInQuint,
  "power4.out": easings.easeOutQuint,
  "power4.inOut": easings.easeInOutQuint,
  "sine.in": easings.easeInSine,
  "sine.out": easings.easeOutSine,
  "sine.inOut": easings.easeInOutSine,
  "expo.in": easings.easeInExpo,
  "expo.out": easings.easeOutExpo,
  "expo.inOut": easings.easeInOutExpo,
  "circ.in": easings.easeInCirc,
  "circ.out": easings.easeOutCirc,
  "circ.inOut": easings.easeInOutCirc,
  "back.in": easings.easeInBack,
  "back.out": easings.easeOutBack,
  "back.inOut": easings.easeInOutBack,
  "elastic.in": easings.easeInElastic,
  "elastic.out": easings.easeOutElastic,
  "elastic.inOut": easings.easeInOutElastic,
  "bounce.in": easings.easeInBounce,
  "bounce.out": easings.easeOutBounce,
  "bounce.inOut": easings.easeInOutBounce,
};

function resolveEase(name: string | undefined): EasingFunction | undefined {
  if (!name) return undefined;
  if (Object.hasOwn(easings, name)) return easings[name as EasingName];
  const alias = easeAliases[name];
  if (alias) return alias;
  throw new Error(`Presk compiler: unknown easing "${name}".`);
}

function isExpression(value: unknown): value is string {
  return typeof value === "string";
}

function snapshotBindings(presk: Presk, targetId: string): Record<string, string> | undefined {
  const binding = presk.binding as typeof presk.binding & {
    snapshot?: (id: string) => Record<string, string> | undefined;
  };
  return binding.snapshot?.(targetId);
}

function restoreBindings(
  presk: Presk,
  targetId: string,
  snapshot: Record<string, string> | undefined,
): void {
  const binding = presk.binding as typeof presk.binding & {
    restore?: (id: string, value: Record<string, string> | undefined) => void;
  };
  binding.restore?.(targetId, snapshot);
}

function resolveNow(properties: Record<string, unknown>, presk: Presk): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "number" || typeof value === "string" || typeof value === "boolean" || (value && typeof value === "object")) {
      if (typeof value === "number" || typeof value === "boolean") {
        resolved[key] = value;
      } else if (isExpression(value)) {
        resolved[key] =
          /^[A-Za-z0-9_.\s+\-*/]+$/.test(value)
          && /[A-Za-z]/.test(value)
          && value.includes(".")
          ? evaluateExpression(value, presk.scene)
          : value;
      } else if (Array.isArray(value)) {
        resolved[key] = value;
      } else if (value && typeof value === "object") {
        resolved[key] = resolveNow(value as Record<string, unknown>, presk);
      }
    }
  }
  return resolved;
}

function makeActionTween(
  id: string,
  target: KObject,
  action: () => void,
  onReverse?: () => void,
  onInit?: () => void,
): KTween {
  return new KTween({
    id,
    target,
    startTime: 0,
    duration: 0,
    init: onInit,
    render: (_target, progress) => {
      if (progress === 1) action();
      else onReverse?.();
    },
  });
}

function makeTransformTween(
  id: string,
  target: KObject,
  property: string,
  value: unknown,
  duration: number,
  easing: ((progress: number) => number) | undefined,
  presk: Presk,
): KTween {
  let propertyTween: KTween | undefined;
  return new KTween({
    id: `${id}:${property}`,
    target,
    startTime: 0,
    duration,
    init: () => {
      const resolvedValue = resolveNow({ value }, presk).value;
      [propertyTween] = target.getTweens(
        { [property]: resolvedValue },
        { id, startTime: 0, duration, easing },
      );
      propertyTween.init();
    },
    render: (_target, progress) => {
      propertyTween?.render(progress * duration);
    },
  });
}

function getStepPosition(
  position: DslStep["start"],
  cursor: number,
  lastStart: number,
  lastEnd: number,
  labels: Map<string, number>,
): number {
  if (position === undefined) return cursor;
  if (typeof position === "number") return position;

  const timelineRelative = /^([+-]=)(\d*\.?\d+)$/.exec(position);
  if (timelineRelative) {
    const amount = Number(timelineRelative[2]) * (timelineRelative[1] === "+=" ? 1 : -1);
    return cursor + amount;
  }

  const relative = /^([<>])([+-]=)(\d*\.?\d+)$/.exec(position);
  if (relative) {
    const anchor = relative[1] === "<" ? lastStart : lastEnd;
    const amount = Number(relative[3]) * (relative[2] === "+=" ? 1 : -1);
    return anchor + amount;
  }
  if (position === "<") return lastStart;
  if (position === ">") return lastEnd;

  const labelRelative = /^([A-Za-z_$][\w$]*)([+-]=)(\d*\.?\d+)$/.exec(position);
  if (labelRelative) {
    const labelTime = labels.get(labelRelative[1]);
    if (labelTime === undefined) {
      throw new Error(`Presk compiler: unknown timeline label "${labelRelative[1]}".`);
    }
    const amount = Number(labelRelative[3]) * (labelRelative[2] === "+=" ? 1 : -1);
    return labelTime + amount;
  }
  if (labels.has(position)) return labels.get(position)!;

  const absolute = Number(position);
  if (Number.isFinite(absolute)) return absolute;
  throw new Error(`Presk compiler: invalid timeline position "${position}".`);
}

/**
 * Preloads the scene in two passes. First create every object with its raw
 * properties so forward references exist in the scene. Then resolve and apply
 * expression-valued properties now that every target can be looked up.
 */
export function prepareScene(steps: DslStep[], presk: Presk): void {
  const createSteps = steps.filter((step) => step.action === "create");

  // Pass 1: create all objects before evaluating any expressions. This makes
  // references to objects declared later in the DSL resolvable.
  for (const step of createSteps) {
    if (!step.type) throw new Error(`Presk compiler: "create" step for "${step.target}" is missing "type".`);
    const properties = { ...((step.properties ?? {}) as Record<string, unknown>) };
    delete properties.follow;
    presk.create(step.type, step.target, properties);
  }

  // Pass 2: apply initial values after the complete scene has been loaded.
  // `follow` values are also applied initially for compatibility with the
  // existing create behavior; the binding itself is scheduled below.
  for (const step of steps) {
    if (step.action === "create") {
      const target = presk.scene.get(step.target);
      if (!target) throw new Error(`Presk compiler: "create" step failed to preload "${step.target}".`);
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      const followProps = (step.follow ?? (typeof properties === "object" && properties !== null && "follow" in properties ? (properties.follow as Record<string, unknown>) : {})) as Record<string, unknown>;
      const combined = { ...properties, ...followProps };
      delete combined.follow;
      target.setNow(resolveNow(combined, presk));
    }
  }
}

export function compile(doc: DslDocument, presk: Presk): KTimer {
  prepareScene(doc.steps, presk);

  const timer = presk.timer;
  const labels = new Map<string, number>();
  let cursor = 0;
  let lastStart = 0;
  let lastEnd = 0;

  // Animation phase: append every action/tween to KTimer. The final
  // initialize() pass initializes and renders them in timeline order, so each
  // tween captures the endpoint state left by the preceding tween.
  for (const step of doc.steps) {
    const startTime = getStepPosition(step.start, cursor, lastStart, lastEnd, labels);
    const endTime = addStep(timer, step, startTime, presk);
    lastStart = startTime;
    lastEnd = endTime;
    cursor = Math.max(cursor, endTime);

    if (step.name) {
      labels.set(step.name, lastStart);
    }
  }

  timer.initialize();

  return timer;
}

function addStep(timer: KTimer, step: DslStep, startTime: number, presk: Presk): number {
  switch (step.action) {
    case "create": {
      const target = presk.scene.get(step.target);
      if (!target) throw new Error(`Presk: "create" step targets unknown object "${step.target}".`);

      const duration = step.duration ?? 0.4;
      const easing = resolveEase(step.ease);
      const finalScale = target.scale;
      const finalOpacity = target.opacity;
      target.scale = 0;
      target.opacity = 0;

      timer.addTweens([
        makeActionTween(`${target.id}:create:visible`, target, () => {
          target.visible = true;
        }, () => {
          target.visible = false;
        }),
      ], startTime);
      timer.addTweens(
        target.getTweens(
          { scale: finalScale, opacity: finalOpacity },
          { id: `${target.id}:create`, startTime: 0, duration, easing },
        ),
        startTime,
      );

      const followMap = step.follow ?? ((step.properties as Record<string, unknown>)?.follow as Record<string, string> | undefined);
      if (followMap) {
        let previousBindings: Record<string, string> | undefined;
        timer.addTweens([
          makeActionTween(
            `${target.id}:create:follow`,
            target,
            () => presk.binding.follow(step.target, followMap),
            () => restoreBindings(presk, step.target, previousBindings),
            () => { previousBindings = snapshotBindings(presk, step.target); },
          ),
        ], startTime);
      }
      return startTime + duration;
    }

    case "set": {
      const target = presk.scene.get(step.target);
      if (!target) throw new Error(`Presk: "set" targets unknown object "${step.target}".`);
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      let previous: Record<string, unknown> = {};
      timer.addTweens([
        new KTween({
          id: `${target.id}:set`,
          target,
          startTime: 0,
          duration: 0,
          init: () => {
            previous = Object.fromEntries(Object.keys(properties).map((key) => [key, Reflect.get(target, key)]));
          },
          render: (_target, progress) => {
            target.setNow(progress === 1 ? resolveNow(properties, presk) : previous);
          },
        }),
      ], startTime);
      return startTime;
    }

    case "transform": {
      const target = presk.scene.get(step.target);
      if (!target) throw new Error(`Presk: "transform" targets unknown object "${step.target}".`);
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      const duration = step.duration ?? 0;
      const easing = resolveEase(step.ease);
      for (const [property, value] of Object.entries(properties)) {
        timer.addTweens([
          makeTransformTween(
            `${target.id}:transform`,
            target,
            property,
            value,
            duration,
            easing,
            presk,
          ),
        ], startTime);
      }
      return startTime + duration;
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
      const target = presk.scene.get(step.target) ?? presk.scene;
      let previousBindings: Record<string, string> | undefined;
      timer.addTweens([
        makeActionTween(
          `${target.id}:follow`,
          target,
          () => presk.binding.follow(step.target, asStrings),
          () => restoreBindings(presk, step.target, previousBindings),
          () => { previousBindings = snapshotBindings(presk, step.target); },
        ),
      ], startTime);
      return startTime;
    }

    case "unfollow": {
      const properties = step.properties as string[] | undefined;
      const target = presk.scene.get(step.target) ?? presk.scene;
      let previousBindings: Record<string, string> | undefined;
      timer.addTweens([
        makeActionTween(
          `${target.id}:unfollow`,
          target,
          () => presk.binding.unfollow(step.target, properties),
          () => restoreBindings(presk, step.target, previousBindings),
          () => { previousBindings = snapshotBindings(presk, step.target); },
        ),
      ], startTime);
      return startTime;
    }

    case "destroy": {
      const target = presk.scene.get(step.target);
      if (!target) throw new Error(`Presk: "destroy" targets unknown object "${step.target}".`);
      let previousBindings: Record<string, string> | undefined;
      timer.addTweens([
        makeActionTween(
          `${target.id}:destroy`,
          target,
          () => presk.destroy(step.target),
          () => {
            const reversiblePresk = presk as Presk & { restore?: (object: KObject) => void };
            reversiblePresk.restore?.(target);
            restoreBindings(presk, step.target, previousBindings);
          },
          () => { previousBindings = snapshotBindings(presk, step.target); },
        ),
      ], startTime);
      return startTime;
    }

    case "group":
    case "ungroup":
      console.warn(`Presk compiler: "${step.action}" is not implemented yet, skipping step for "${step.target}".`);
      return startTime;

    default:
      throw new Error(`Presk compiler: unknown action "${step.action satisfies never}".`);
  }
}
