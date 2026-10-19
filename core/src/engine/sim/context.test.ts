import { describe, expect, it } from "vitest";
import { Ownership } from "@/engine/sim/context";
import type { Mechanism, SimContext } from "@/engine/sim/context";

class FakeMechanism implements Mechanism {
  readonly actionIndex: number;
  readonly targetId: string;
  readonly kind: "animate" | "travel" | "bind" | "effect" = "animate";
  readonly end = Infinity;
  readonly keys = new Set<string>();
  active = true;

  constructor(targetId: string, actionIndex = 0) {
    this.targetId = targetId;
    this.actionIndex = actionIndex;
  }

  activate(_ctx: SimContext, _now: number): void {}
  evaluate(_ctx: SimContext, _now: number): void {}
  finalize(_ctx: SimContext): void {}
}

describe("Ownership", () => {
  it("claims a key for a mechanism", () => {
    const ownership = new Ownership();
    const m1 = new FakeMechanism("a");
    ownership.claim("a", ["x"], m1);
    expect(ownership.ownerOf("a", "x")).toBe(m1);
    expect(m1.keys.has("x")).toBe(true);
  });

  it("transfers a key and deactivates an emptied mechanism", () => {
    const ownership = new Ownership();
    const m1 = new FakeMechanism("a");
    const m2 = new FakeMechanism("a", 1);
    ownership.claim("a", ["x"], m1);
    ownership.claim("a", ["x"], m2);
    expect(ownership.ownerOf("a", "x")).toBe(m2);
    expect(m1.keys.size).toBe(0);
    expect(m1.active).toBe(false);
  });

  it("keeps a mechanism active while it retains another key", () => {
    const ownership = new Ownership();
    const m1 = new FakeMechanism("a");
    const m2 = new FakeMechanism("a", 1);
    ownership.claim("a", ["x", "y"], m1);
    ownership.claim("a", ["x"], m2);
    expect(m1.keys).toEqual(new Set(["y"]));
    expect(m1.active).toBe(true);
  });

  it("releases one key when claimed by null", () => {
    const ownership = new Ownership();
    const m1 = new FakeMechanism("a");
    ownership.claim("a", ["x"], m1);
    ownership.claim("a", ["x"], null);
    expect(ownership.ownerOf("a", "x")).toBeUndefined();
    expect(m1.keys.size).toBe(0);
  });

  it("releases every key owned by a mechanism", () => {
    const ownership = new Ownership();
    const m1 = new FakeMechanism("a");
    ownership.claim("a", ["x", "y"], m1);
    ownership.release(m1);
    expect(ownership.ownersOf("a").size).toBe(0);
    expect(m1.keys.size).toBe(0);
  });

  it("keeps keys on different objects independent", () => {
    const ownership = new Ownership();
    const ma = new FakeMechanism("a");
    const mb = new FakeMechanism("b");
    ownership.claim("a", ["x"], ma);
    ownership.claim("b", ["x"], mb);
    expect(ownership.ownerOf("a", "x")).toBe(ma);
    expect(ownership.ownerOf("b", "x")).toBe(mb);
  });

  it("returns an empty map for an unknown object", () => {
    expect(new Ownership().ownersOf("zzz").size).toBe(0);
  });

  it("clears all owners and mechanism key sets", () => {
    const ownership = new Ownership();
    const m1 = new FakeMechanism("a");
    const m2 = new FakeMechanism("b");
    ownership.claim("a", ["x"], m1);
    ownership.claim("b", ["y"], m2);
    ownership.clear();
    expect(ownership.ownersOf("a").size).toBe(0);
    expect(ownership.ownersOf("b").size).toBe(0);
    expect(m1.keys.size).toBe(0);
    expect(m2.keys.size).toBe(0);
  });
});
