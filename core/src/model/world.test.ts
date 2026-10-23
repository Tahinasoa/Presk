import { describe, expect, it } from "vitest";
import { PreskRuntimeError } from "@/lang/diagnostics";
import { makeTestObject } from "@/model/testing";
import { World } from "@/model/world";

describe("World", () => {
  it("keeps added objects in creation order, excluding the root", () => {
    const world = new World(makeTestObject("scene"));
    const a = makeTestObject("a");
    const b = makeTestObject("b");
    world.add(a);
    world.add(b);
    expect(world.all().map((object) => object.id)).toEqual(["a", "b"]);
  });

  it("rejects duplicate ids and the reserved scene id", () => {
    const world = new World(makeTestObject("scene"));
    world.add(makeTestObject("a"));
    expect(() => world.add(makeTestObject("a"))).toThrow();
    expect(() => world.add(makeTestObject("scene"))).toThrow();
  });

  it("looks up the root and registered objects", () => {
    const root = makeTestObject("scene");
    const world = new World(root);
    const a = makeTestObject("a");
    world.add(a);
    expect(world.get("scene")).toBe(root);
    expect(world.has("scene")).toBe(true);
    expect(world.get("a")).toBe(a);
    expect(world.get("zzz")).toBeUndefined();
  });

  it("throws PreskRuntimeError when a required object is missing", () => {
    const world = new World(makeTestObject("scene"));
    expect(() => world.require("zzz")).toThrow(PreskRuntimeError);
  });

  it("captures and restores object state", () => {
    const world = new World(makeTestObject("scene"));
    const a = makeTestObject("a", { x: 5 });
    world.add(a);
    world.captureInitial();
    a.setState("x", 99);
    world.reset();
    expect(a.getNumber("x")).toBe(5);
  });

  it("restores parent links captured as detached", () => {
    const world = new World(makeTestObject("scene"));
    const a = makeTestObject("a");
    const b = makeTestObject("b");
    world.add(a);
    world.add(b);
    world.captureInitial();
    a.parent = b;
    world.reset();
    expect(a.parent).toBeNull();
  });

  it("requires initial state capture before reset", () => {
    const world = new World(makeTestObject("scene"));
    expect(() => world.reset()).toThrow("Presk internal:");
  });
});
