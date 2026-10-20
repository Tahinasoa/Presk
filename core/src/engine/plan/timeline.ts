import type { DiagnosticCollector } from "@/lang/diagnostics";
import type { PlanHooks, PlannedAction, DraftAction } from "@/engine/program";

export function planTimeline(
  drafts: readonly DraftAction[],
  d: DiagnosticCollector,
  hooks?: PlanHooks,
): { actions: PlannedAction[]; duration: number } {
  const actions: PlannedAction[] = [];
  const labels = new Map<string, { start: number; end: number }>();

  for (const draft of drafts) {
    const prev = actions.at(-1) ?? null;
    const resolvedStart = resolveStart(draft, prev, labels, d);
    if (resolvedStart === null) continue;
    let start = roundInstant(resolvedStart);
    if (resolvedStart < -1e-9) {
      d.error("E_START_NEGATIVE", "Action start cannot be negative", { stepIndex: draft.index, field: "start" });
      start = 0;
    }

    let duration: number;
    let resolvedTravel: { fromT: number; toT: number; duration: number } | undefined;
    if (draft.action === "animate") {
      const animationDuration = draft.explicitDuration ?? draft.effectDefaultDuration;
      if (animationDuration === undefined) {
        d.error("E_DURATION_MISSING", "Animation duration is missing", { stepIndex: draft.index, field: "duration" });
        continue;
      }
      duration = animationDuration;
    } else if (draft.action === "group") {
      duration = draft.explicitDuration ?? 0;
    } else if (draft.action === "travel") {
      if (hooks?.resolveTravel) {
        resolvedTravel = hooks.resolveTravel(draft as Parameters<NonNullable<PlanHooks["resolveTravel"]>>[0], start) ?? undefined;
        if (!resolvedTravel) continue;
      } else {
        resolvedTravel = { fromT: draft.fromT, toT: draft.toT, duration: draft.explicitDuration ?? 0 };
      }
      duration = resolvedTravel.duration;
    } else {
      duration = 0;
    }

    const repeat = draft.action === "animate" || draft.action === "travel" ? draft.repeat : 1;
    const end = repeat === "infinite" ? Infinity : roundInstant(start + duration * repeat);
    const actionFields = draft.action === "travel"
      ? (() => {
          const {
            startSpec: _startSpec,
            explicitDuration: _explicitDuration,
            effectDefaultDuration: _effectDefaultDuration,
            speed: _speed,
            fromSpec: _fromSpec,
            toSpec: _toSpec,
            ...fields
          } = draft;
          return fields;
        })()
      : (() => {
          const {
            startSpec: _startSpec,
            explicitDuration: _explicitDuration,
            effectDefaultDuration: _effectDefaultDuration,
            ...fields
          } = draft;
          return fields;
        })();
    const action = {
      ...actionFields,
      ...(resolvedTravel ?? {}),
      start,
      end,
      duration,
    } as PlannedAction;
    actions.push(action);
    if (draft.name !== undefined) labels.set(draft.name, { start, end });
    hooks?.onPlanned?.(action);
  }

  const finiteEnds = actions.map(({ end }) => end).filter(Number.isFinite);
  const duration = finiteEnds.length === 0 ? 0 : Math.max(0, ...finiteEnds);
  for (const action of actions) {
    if (action.end === Infinity && action.start >= duration - 1e-9) {
      d.error("E_INFINITE_NEVER_PLAYED", "Infinite action starts at or after the end of the scene", {
        stepIndex: action.index,
        field: "start",
      });
    }
  }

  return { actions, duration };
}

function resolveStart(
  draft: DraftAction,
  prev: PlannedAction | null,
  labels: ReadonlyMap<string, { start: number; end: number }>,
  d: DiagnosticCollector,
): number | null {
  const { startSpec, index } = draft;
  switch (startSpec.kind) {
    case "absolute":
      return startSpec.time;
    case "prevStart":
      return (prev?.start ?? 0) + startSpec.offset;
    case "prevEnd": {
      if (prev?.end === Infinity) {
        d.error("E_START_REF_INFINITE_END", "Cannot reference the end of an infinite action", { stepIndex: index, field: "start" });
        return null;
      }
      return (prev?.end ?? 0) + startSpec.offset;
    }
    case "labelStart":
    case "labelEnd": {
      const label = labels.get(startSpec.label);
      if (!label) {
        d.error("E_START_UNKNOWN_NAME", `Unknown or forward action name '${startSpec.label}'`, { stepIndex: index, field: "start" });
        return null;
      }
      if (startSpec.kind === "labelEnd" && label.end === Infinity) {
        d.error("E_START_REF_INFINITE_END", "Cannot reference the end of an infinite action", { stepIndex: index, field: "start" });
        return null;
      }
      return (startSpec.kind === "labelStart" ? label.start : label.end) + startSpec.offset;
    }
  }
}

function roundInstant(value: number): number {
  return Math.round(value * 1e9) / 1e9;
}
