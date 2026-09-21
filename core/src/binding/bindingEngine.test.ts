// Tests the pull-based follow/unfollow semantics (spec §10).
import { describe, it, expect } from "vitest";
import KScene from "@/primitives/kscene";
import KRectangle from "@/primitives/krectangle";
import BindingEngine from "./bindingEngine";

function setup() {
  const scene = new KScene({ id: "scene", x: 0, y: 0, width: 1000, height: 1000 });
  const a = new KRectangle({ id: "a", x: 10, y: 0, width: 10, height: 10 });
  const b = new KRectangle({ id: "b", x: 0, y: 0, width: 10, height: 10 });
  scene.add(a);
  scene.add(b);
  const binding = new BindingEngine(scene);
  return { scene, a, b, binding };
}

describe("BindingEngine", () => {
  it("copies a followed value on flush()", () => {
    const { a, b, binding } = setup();
    binding.follow("b", { x: "a.x" });

    expect(b.x).toBe(0); // not yet flushed
    binding.flush();
    expect(b.x).toBe(10);

    a.x = 42;
    binding.flush();
    expect(b.x).toBe(42);
  });

  it("stops updating after unfollow()", () => {
    const { a, b, binding } = setup();
    binding.follow("b", { x: "a.x" });
    binding.flush();
    binding.unfollow("b", ["x"]);

    a.x = 999;
    binding.flush();
    expect(b.x).toBe(10); // frozen at last known value
  });

  it("clear() removes all bindings for a target", () => {
    const { binding } = setup();
    binding.follow("b", { x: "a.x", y: "a.y" });
    binding.clear("b");

    expect(binding.isFollowing("b", "x")).toBe(false);
    expect(binding.isFollowing("b", "y")).toBe(false);
  });
});
