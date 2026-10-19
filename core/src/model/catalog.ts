import type { ClassDef } from "@/model/values";

export class Catalog {
  private readonly defs = new Map<string, ClassDef>();

  register(def: ClassDef): void {
    if (this.defs.has(def.type)) {
      throw new Error(`Class '${def.type}' is already registered`);
    }
    this.defs.set(def.type, def);
  }

  get(type: string): ClassDef | undefined {
    return this.defs.get(type);
  }

  has(type: string): boolean {
    return this.defs.has(type);
  }

  types(): string[] {
    return [...this.defs.keys()].sort((a, b) => a.localeCompare(b));
  }
}
