export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type ActionName = "create" | "set" | "animate" | "travel" | "bind" | "unbind" | "stop" | "group" | "ungroup";
export const ACTION_NAMES: readonly ActionName[] = [
  "create",
  "set",
  "animate",
  "travel",
  "bind",
  "unbind",
  "stop",
  "group",
  "ungroup",
] as const;
export type RepeatValue = number | "infinite";
export type RepeatMode = "restart" | "yoyo";
export type StartValue = number | string;
export type PropertiesObject = { [key: string]: JsonValue };

interface Timing { start?: StartValue; name?: string }
export interface CreateStep { action: "create"; target: string; type: string; properties?: PropertiesObject }
export interface SetStep extends Timing { action: "set"; target: string; properties: PropertiesObject }
export interface AnimateStep extends Timing {
  action: "animate";
  target: string;
  properties: PropertiesObject;
  duration?: number;
  ease?: string;
  repeat?: RepeatValue;
  repeatMode?: RepeatMode;
}
export interface TravelStep extends Timing {
  action: "travel";
  target: string;
  along: string;
  from?: number | "current";
  to?: number;
  duration?: number;
  speed?: number;
  ease?: string;
  repeat?: RepeatValue;
  repeatMode?: RepeatMode;
  orient?: boolean | { offset: number };
  anchor?: string;
}
export interface BindStep extends Timing { action: "bind"; target: string; properties: PropertiesObject }
export interface UnbindStep extends Timing { action: "unbind"; target: string; properties?: string[] }
export interface StopStep extends Timing { action: "stop"; target: string; properties?: string[] }
export interface GroupStep extends Timing {
  action: "group";
  target: string;
  properties: PropertiesObject;
  duration?: number;
  ease?: string;
}
export interface UngroupStep extends Timing { action: "ungroup"; target: string; properties?: PropertiesObject }
export type Step = CreateStep | SetStep | AnimateStep | TravelStep | BindStep | UnbindStep | StopStep | GroupStep | UngroupStep;
export interface SceneConfig { width: number; height: number; background?: string }
export interface DslDocument { version: "1.0"; scene: SceneConfig; steps: Step[] }
