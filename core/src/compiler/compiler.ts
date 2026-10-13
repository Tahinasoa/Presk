// Compiles a DSL document into KTimer-managed KObject tweens and timed actions.

import gsap from "gsap";
import type Presk from "@/presk";
import type KObject from "@/primitives/kobject/kobject";
import KTween from "@/timer/tween/tween";
import KTimer from "@/timer/ktimer";
import { evaluateExpression } from "@/binding/expression";
import type { DslDocument, DslStep } from "./types";

function isExpression(value: unknown): value is string {
  return typeof value === "string";
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
): KTween {
  return new KTween({
    id,
    target,
    startTime: 0,
    duration: 0,
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
 * Materializes all create steps before compiling so expressions can resolve
 * references to objects declared later in the document.
 */
export function prepareScene(steps: DslStep[], presk: Presk): void {
  for (const step of steps) {
    if (step.action === "create") {
      if (!step.type) throw new Error(`Presk compiler: "create" step for "${step.target}" is missing "type".`);
      const properties = (step.properties ?? {}) as Record<string, unknown>;
      const followProps = (step.follow ?? (typeof properties === "object" && properties !== null && "follow" in properties ? (properties.follow as Record<string, unknown>) : {})) as Record<string, unknown>;
      const combined = { ...properties, ...followProps };
      presk.create(step.type, step.target, resolveNow(combined, presk));
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

  return timer;
}

function addStep(timer: KTimer, step: DslStep, startTime: number, presk: Presk): number {
  switch (step.action) {
    case "create": {
      const target = presk.scene.get(step.target);
      if (!target) throw new Error(`Presk: "create" step targets unknown object "${step.target}".`);

      const duration = step.duration ?? 0.4;
      const easing = step.ease ? gsap.parseEase(step.ease) : undefined;
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
        timer.addTweens([
          makeActionTween(`${target.id}:create:follow`, target, () => presk.binding.follow(step.target, followMap)),
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
      const easing = step.ease ? gsap.parseEase(step.ease) : undefined;
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
      timer.addTweens([
        makeActionTween(`${target.id}:follow`, target, () => presk.binding.follow(step.target, asStrings)),
      ], startTime);
      return startTime;
    }

    case "unfollow": {
      const properties = step.properties as string[] | undefined;
      const target = presk.scene.get(step.target) ?? presk.scene;
      timer.addTweens([
        makeActionTween(`${target.id}:unfollow`, target, () => presk.binding.unfollow(step.target, properties)),
      ], startTime);
      return startTime;
    }

    case "destroy": {
      const target = presk.scene.get(step.target);
      if (!target) throw new Error(`Presk: "destroy" targets unknown object "${step.target}".`);
      timer.addTweens([
        makeActionTween(`${target.id}:destroy`, target, () => presk.destroy(step.target)),
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
