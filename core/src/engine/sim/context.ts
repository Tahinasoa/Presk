import type { World } from "@/model/world";

export interface Mechanism {
  readonly actionIndex: number;
  readonly targetId: string;
  readonly kind: "animate" | "travel" | "bind" | "effect";
  readonly end: number;
  keys: Set<string>;
  active: boolean;
  activate(ctx: SimContext, now: number): void;
  evaluate(ctx: SimContext, now: number): void;
  finalize(ctx: SimContext): void;
}

export interface SimContext {
  world: World;
  ownership: Ownership;
  mechanisms: Mechanism[];
}

export class Ownership {
  private readonly owners = new Map<string, Map<string, Mechanism>>();

  claim(objectId: string, keys: readonly string[], owner: Mechanism | null): void {
    let objectOwners = this.owners.get(objectId);
    if (!objectOwners && owner !== null) {
      objectOwners = new Map();
      this.owners.set(objectId, objectOwners);
    }

    for (const key of keys) {
      const previous = objectOwners?.get(key);
      if (previous && previous !== owner) {
        previous.keys.delete(key);
        if (previous.keys.size === 0) previous.active = false;
      }

      if (owner) {
        objectOwners!.set(key, owner);
        owner.keys.add(key);
      } else {
        objectOwners?.delete(key);
      }
    }

    if (objectOwners?.size === 0) this.owners.delete(objectId);
  }

  ownerOf(objectId: string, key: string): Mechanism | undefined {
    return this.owners.get(objectId)?.get(key);
  }

  ownersOf(objectId: string): ReadonlyMap<string, Mechanism> {
    return this.owners.get(objectId) ?? new Map();
  }

  release(mechanism: Mechanism): void {
    const objectOwners = this.owners.get(mechanism.targetId);
    if (objectOwners) {
      for (const [key, owner] of objectOwners) {
        if (owner === mechanism) objectOwners.delete(key);
      }
      if (objectOwners.size === 0) this.owners.delete(mechanism.targetId);
    }
    mechanism.keys.clear();
    mechanism.active = false;
  }

  clear(): void {
    for (const objectOwners of this.owners.values()) {
      for (const [key, owner] of objectOwners) {
        owner.keys.delete(key);
        if (owner.keys.size === 0) owner.active = false;
      }
    }
    this.owners.clear();
  }
}
