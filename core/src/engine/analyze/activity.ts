import type { DiagnosticCollector } from "@/lang/diagnostics";
import type { Catalog } from "@/model/catalog";
import type { ClassDef } from "@/model/values";
import type { CompiledEntry, PlannedAction } from "@/engine/program";

type OwnerKind = "animate" | "travel" | "bind";
interface Owner { kind: OwnerKind; end: number }

export function keysOfNames(def: ClassDef, names: readonly string[]): string[] {
  const keys = new Set<string>();
  for (const name of names) {
    const prop = def.props[name];
    if (prop) {
      for (const key of prop.writes) keys.add(key);
    } else if (def.effects[name]) {
      keys.add(`@${name}`);
    }
  }
  return [...keys];
}

function keysOfEntries(entries: readonly CompiledEntry[]): string[] {
  const keys = new Set<string>();
  for (const entry of entries) {
    if (entry.kind === "effect") {
      keys.add(`@${entry.name}`);
    } else {
      for (const key of entry.spec.writes) keys.add(key);
    }
  }
  return [...keys];
}

function actionKeys(action: Extract<PlannedAction, { action: "stop" | "unbind" }>, def: ClassDef): string[] {
  return action.keys === null ? [] : keysOfNames(def, action.keys);
}

export function analyzeActivity(
  actions: readonly PlannedAction[],
  typeOf: (id: string) => string | undefined,
  catalog: Catalog,
  d: DiagnosticCollector,
): void {
  const owners = new Map<string, Map<string, Owner>>();
  const byObject = (id: string): Map<string, Owner> => {
    let map = owners.get(id);
    if (!map) {
      map = new Map();
      owners.set(id, map);
    }
    return map;
  };

  const ordered = [...actions].sort((a, b) => a.start - b.start || a.index - b.index);
  for (const action of ordered) {
    for (const map of owners.values()) {
      for (const [key, owner] of map) {
        if ((owner.kind === "animate" || owner.kind === "travel") && owner.end <= action.start + 1e-9) {
          map.delete(key);
        }
      }
    }

    const current = byObject(action.target);
    if (action.action === "set") {
      for (const key of keysOfEntries(action.entries)) current.delete(key);
      continue;
    }

    if (action.action === "animate") {
      for (const key of keysOfEntries(action.entries)) current.set(key, { kind: "animate", end: action.end });
      continue;
    }

    if (action.action === "travel") {
      current.set("x", { kind: "travel", end: action.end });
      current.set("y", { kind: "travel", end: action.end });
      if (action.orient !== null) current.set("rotation", { kind: "travel", end: action.end });
      continue;
    }

    if (action.action === "bind") {
      for (const key of keysOfEntries(action.entries)) current.set(key, { kind: "bind", end: Infinity });
      continue;
    }

    if (action.action !== "stop" && action.action !== "unbind") continue;

    const def = catalog.get(typeOf(action.target) ?? "");
    const keys = def ? actionKeys(action, def) : [];
    if (action.action === "stop") {
      if (action.keys === null) {
        const active = [...current].filter(([, owner]) => owner.kind === "animate" || owner.kind === "travel");
        if (active.length === 0) {
          const hasBind = [...current.values()].some((owner) => owner.kind === "bind");
          d.error(hasBind ? "E_STOP_ON_BIND" : "E_STOP_NOTHING", "No active animation or travel to stop", { stepIndex: action.index, field: "properties" });
        } else {
          for (const [key] of active) current.delete(key);
        }
        continue;
      }
      const ownsTravelPosition = current.get("x")?.kind === "travel" && current.get("y")?.kind === "travel";
      if (ownsTravelPosition && !(keys.includes("x") && keys.includes("y"))) {
        d.error("E_STOP_PARTIAL_TRAVEL", "Cannot stop only part of a travel position", {
          stepIndex: action.index,
          field: "properties",
        });
        continue;
      }
      for (const key of keys) {
        const owner = current.get(key);
        if (!owner) {
          d.error("E_STOP_NOTHING", `No active animation or travel for '${key}'`, { stepIndex: action.index, field: "properties" });
        } else if (owner.kind === "bind") {
          d.error("E_STOP_ON_BIND", `Cannot stop bound key '${key}'`, { stepIndex: action.index, field: "properties" });
        } else {
          current.delete(key);
        }
      }
      continue;
    }

    if (action.keys === null) {
      const active = [...current].filter(([, owner]) => owner.kind === "bind");
      if (active.length === 0) {
        const hasAnimation = [...current.values()].some((owner) => owner.kind === "animate" || owner.kind === "travel");
        d.error(hasAnimation ? "E_UNBIND_ON_ANIMATE" : "E_UNBIND_NOTHING", "No active binding to unbind", { stepIndex: action.index, field: "properties" });
      } else {
        for (const [key] of active) current.delete(key);
      }
      continue;
    }
    for (const key of keys) {
      const owner = current.get(key);
      if (!owner) {
        d.error("E_UNBIND_NOTHING", `No active binding for '${key}'`, { stepIndex: action.index, field: "properties" });
      } else if (owner.kind !== "bind") {
        d.error("E_UNBIND_ON_ANIMATE", `Cannot unbind animated key '${key}'`, { stepIndex: action.index, field: "properties" });
      } else {
        current.delete(key);
      }
    }
  }
}
