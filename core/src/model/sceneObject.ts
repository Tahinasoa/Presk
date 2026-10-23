import { anchorOfBounds, isAnchorName } from "@/geom/bounds";
import type { Bounds } from "@/geom/bounds";
import { transformBounds } from "@/geom/bounds";
import { COLOR_STRING_RE } from "@/geom/color";
import { composeMat, IDENTITY, trsPivot } from "@/geom/matrix";
import type { Mat } from "@/geom/matrix";
import type { Pt } from "@/geom/vec";
import type { ObjectEnv } from "@/model/ports";
import type { ClassDef, StateValue } from "@/model/values";

function cloneValue<T extends StateValue>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item as StateValue)) as unknown as T;
  if (typeof value === "object" && value !== null) {
    return { ...value } as T;
  }
  return value;
}

export abstract class SceneObject {
  readonly id: string;
  readonly def: ClassDef;
  parent: SceneObject | null = null;
  protected readonly env: ObjectEnv;
  private readonly state: Record<string, StateValue>;

  constructor(id: string, def: ClassDef, env: ObjectEnv, initial: Record<string, StateValue>) {
    this.id = id;
    this.def = def;
    this.env = env;
    this.state = {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      presence: 0,
      pivot: "center",
    };
    for (const [key, value] of Object.entries(initial)) this.state[key] = cloneValue(value);
  }

  getState(key: string): StateValue {
    if (!Object.hasOwn(this.state, key)) {
      throw new Error(`Presk internal: unknown state key '${key}' on '${this.id}'`);
    }
    return this.state[key];
  }

  setState(key: string, value: StateValue): void {
    if (!Object.hasOwn(this.state, key)) {
      throw new Error(`Presk internal: unknown state key '${key}' on '${this.id}'`);
    }
    this.state[key] = cloneValue(value);
  }

  hasState(key: string): boolean {
    return Object.hasOwn(this.state, key);
  }

  getNumber(key: string): number {
    return this.getState(key) as number;
  }

  getPoint(key: string): Pt {
    return this.getState(key) as Pt;
  }

  getString(key: string): string {
    return this.getState(key) as string;
  }

  getColor(key: string): string {
    const v = this.getState(key);
    if (typeof v === "string" && COLOR_STRING_RE.test(v)) return v;
    throw new Error(`Presk internal: not a colour '${key}' on '${this.id}'`);
  }

  snapshot(): Record<string, StateValue> {
    const result: Record<string, StateValue> = {};
    for (const [key, value] of Object.entries(this.state)) result[key] = cloneValue(value);
    return result;
  }

  restore(s: Record<string, StateValue>): void {
    for (const [key, value] of Object.entries(s)) this.setState(key, value);
  }

  abstract localBounds(): Bounds | null;

  pivotLocal(): Pt {
    const bounds = this.localBounds();
    if (bounds === null || this.getString("pivot") === "pos") return { x: 0, y: 0 };
    const pivot = this.getString("pivot");
    if (!isAnchorName(pivot)) {
      throw new Error(`Presk internal: unknown pivot '${pivot}' on '${this.id}'`);
    }
    return anchorOfBounds(bounds, pivot);
  }

  localMatrix(): Mat {
    return trsPivot(
      { x: this.getNumber("x"), y: this.getNumber("y") },
      this.pivotLocal(),
      this.getNumber("rotation"),
      this.getNumber("scale"),
    );
  }

  parentMatrix(): Mat {
    return this.parent ? this.parent.worldMatrix() : IDENTITY;
  }

  worldMatrix(): Mat {
    return composeMat(this.parentMatrix(), this.localMatrix());
  }

  worldBounds(): Bounds | null {
    const bounds = this.localBounds();
    return bounds === null ? null : transformBounds(bounds, this.worldMatrix());
  }

  effectiveAlpha(): number {
    return this.getNumber("opacity") * this.getNumber("presence") * (this.parent?.effectiveAlpha() ?? 1);
  }

  children(): readonly SceneObject[] {
    return [];
  }

  setChildren(_children: readonly SceneObject[]): void {}

  readProp(name: string): StateValue {
    const prop = this.def.props[name];
    if (!prop) throw new Error(`Presk internal: unknown property '${name}' on '${this.id}'`);
    return prop.get(this);
  }

  writeProp(name: string, value: StateValue): void {
    const prop = this.def.props[name];
    if (!prop?.set) throw new Error(`Presk internal: property '${name}' is unknown or read-only on '${this.id}'`);
    prop.set(this, value);
  }
}
