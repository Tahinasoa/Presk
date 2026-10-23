import { passProgress } from "@/engine/plan/passProgress";
import type { PlanHooks, PlannedAction, TravelAction, TravelDraft } from "@/engine/program";
import type { DiagnosticCollector } from "@/lang/diagnostics";
import { matScale } from "@/geom/matrix";
import type { Catalog } from "@/model/catalog";
import type { SceneObject } from "@/model/sceneObject";
import type { World } from "@/model/world";
import { easings } from "@/lang/easing/easing";
import type { EasingName } from "@/lang/easing/easing";

interface TravelRecord {
  target: string;
  along: TravelAction["along"];
  fromT: number;
  toT: number;
  start: number;
  end: number;
  duration: number;
  ease: string;
  repeat: TravelAction["repeat"];
  repeatMode: TravelAction["repeatMode"];
  stoppedAt?: number;
}

const PATH_LENGTH_KEYS: ReadonlySet<string> = new Set([
  "scale", "width", "height", "radius", "points", "p0", "p1", "startAngle", "endAngle", "closed",
]);

function writesPathLengthKey(action: PlannedAction): boolean {
  if (action.action !== "set" && action.action !== "animate" && action.action !== "bind") return false;
  return action.entries.some((entry) =>
    entry.kind === "prop"
    && entry.spec.writes.some((key) => PATH_LENGTH_KEYS.has(key.split(".")[0] ?? key)));
}

export function createTravelHooks(probe: World, catalog: Catalog, d: DiagnosticCollector): PlanHooks {
  const records: TravelRecord[] = [];
  const planned: PlannedAction[] = [];

  const pathMayChangeBefore = (objectId: string, start: number): boolean => {
    const owners = new Set<string>();
    for (let current: SceneObject | null = probe.require(objectId); current; current = current.parent) {
      owners.add(current.id);
    }
    return planned.some((action) =>
      owners.has(action.target) && action.start < start && writesPathLengthKey(action));
  };

  const lastParam = (target: string, along: TravelAction["along"], start: number): number | null => {
    const record = records.findLast((candidate) =>
      candidate.target === target
      && candidate.along.object === along.object
      && candidate.along.path === along.path);
    if (!record) return null;

    const easing = easings[record.ease as EasingName];
    if (!easing) throw new Error(`Presk internal: unknown easing '${record.ease}'`);
    const tEval = Math.min(start, record.stoppedAt ?? Infinity, record.end);
    const progress = passProgress(tEval - record.start, {
      duration: record.duration,
      repeat: record.repeat,
      mode: record.repeatMode,
      ease: easing,
    }).p;
    return record.fromT + (record.toT - record.fromT) * progress;
  };

  return {
    resolveTravel(draft: TravelDraft, start) {
      const object = probe.require(draft.along.object);
      const def = catalog.get(object.def.type);
      const pathSpec = def?.paths[draft.along.path];
      if (!pathSpec) {
        d.error("E_TRAVEL_ALONG", `Unknown path '${draft.along.path}' on '${draft.along.object}'`, {
          stepIndex: draft.index,
          field: "along",
        });
        return null;
      }

      const closed = pathSpec.isClosed(object);
      const fromT = typeof draft.fromSpec === "number"
        ? draft.fromSpec
        : lastParam(draft.target, draft.along, start);
      if (fromT === null) {
        d.error("E_TRAVEL_FROM_CURRENT", "No previous travel position is available", {
          stepIndex: draft.index,
          field: "from",
        });
        return null;
      }
      const toT = draft.toSpec ?? (closed ? fromT + 1 : 1);
      const inRange = (value: number): boolean => value >= -1e-9 && value <= 1 + 1e-9;
      if (!closed && (!inRange(fromT) || !inRange(toT))) {
        d.error("E_TRAVEL_RANGE", "Travel range must be between 0 and 1 on an open path", {
          stepIndex: draft.index,
          field: !inRange(fromT) ? "from" : "to",
        });
        return null;
      }
      if (draft.fromSpec === "current" && fromT > toT) {
        d.error("E_TRAVEL_RANGE", "from current cannot be greater than to", {
          stepIndex: draft.index,
          field: "from",
        });
        return null;
      }

      let duration: number;
      if (draft.explicitDuration !== undefined) {
        duration = draft.explicitDuration;
      } else if (draft.speed !== undefined && draft.speed > 0) {
        if (pathMayChangeBefore(draft.along.object, start)) {
          d.warning(
            "W_SPEED_PATH_MAY_CHANGE",
            `Travel duration from speed is measured on '${draft.along.object}', which may change before the travel`,
            { stepIndex: draft.index },
          );
        }
        const length = pathSpec.build(object).length
          * matScale(object.worldMatrix())
          * Math.abs(toT - fromT);
        duration = length / draft.speed;
      } else {
        d.error("E_TRAVEL_DURATION", "Travel requires a positive duration or speed", {
          stepIndex: draft.index,
          field: draft.speed === undefined ? "duration" : "speed",
        });
        return null;
      }

      if (!Number.isFinite(duration) || duration <= 0) {
        d.error("E_TRAVEL_DURATION", "Travel duration must be positive", {
          stepIndex: draft.index,
          field: draft.explicitDuration === undefined ? "speed" : "duration",
        });
        return null;
      }
      return { fromT, toT, duration };
    },

    onPlanned(action: PlannedAction) {
      planned.push(action);
      if (action.action === "travel") {
        records.push({
          target: action.target,
          along: action.along,
          fromT: action.fromT,
          toT: action.toT,
          start: action.start,
          end: action.end,
          duration: action.duration,
          ease: action.ease,
          repeat: action.repeat,
          repeatMode: action.repeatMode,
        });
        return;
      }
      if (action.action !== "stop") return;
      const stopsPosition = action.keys === null || action.keys.some((key) => key === "pos" || key === "x" || key === "y");
      if (!stopsPosition) return;

      const record = records.findLast((candidate) => candidate.target === action.target);
      if (record && record.stoppedAt === undefined && record.end > action.start) {
        record.stoppedAt = action.start;
      }
    },
  };
}
