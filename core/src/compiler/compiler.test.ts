// Tests DSL compilation in isolation from rendering:
// PixiJS needs a real <canvas>/WebGL context, which this test suite (run
// under Node, not a browser) doesn't have. We exercise `compile()` against
// a minimal mock and seek its KTimer synchronously.
import { describe, it, expect, vi } from "vitest";
import KScene from "@/primitives/kscene/kscene";
import KRectangle from "@/primitives/krectangle/krectangle";
import KTimer from "@/timer/ktimer";
import type Presk from "@/presk";
import { compile } from "./compiler";
import type { DslDocument } from "./types";

function makeMockPresk() {
  const scene = new KScene({ id: "scene", x: 0, y: 0, width: 800, height: 600 });
  const timer = new KTimer();
  const created: string[] = [];
  const destroyed: string[] = [];

  const presk = {
    scene,
    timer,
    binding: { follow: vi.fn(), unfollow: vi.fn() },
    create: vi.fn((_type: string, id: string, props: Record<string, unknown>) => {
      const obj = new KRectangle({ id, x: 0, y: 0, width: 10, height: 10, ...(props as object) });
      scene.add(obj);
      created.push(id);
      return obj;
    }),
    destroy: vi.fn((id: string) => {
      scene.remove(id);
      destroyed.push(id);
    }),
  } as unknown as Presk;

  return { presk, created, destroyed };
}

function compileAndFinish(doc: DslDocument, presk: Presk): KTimer {
  const timer = compile(doc, presk);
  timer.seek(timer.duration);
  return timer;
}

describe("compile", () => {
  it("creates every object declared with a 'create' step", () => {
    const { presk, created } = makeMockPresk();
    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [
        { action: "create", target: "box", type: "shape", properties: { x: 10, y: 20 } },
        { action: "create", target: "label", type: "text", properties: { text: "hi", x: 0, y: 0 } },
      ],
    };

    compileAndFinish(doc, presk);

    expect(created).toEqual(["box", "label"]);
  });

  // LEGACY-OBSOLETE (DSL v0.1): create props are no longer forwarded this way.
  it.skip("resolves an expression property once for 'create'", () => {
    const { presk } = makeMockPresk();
    presk.scene.add(new KRectangle({ id: "title", x: 100, y: 0, width: 40, height: 20 }));

    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [{ action: "create", target: "dot", type: "shape", properties: { x: "title.topRight.x", y: 0 } }],
    };

    compileAndFinish(doc, presk);

    expect(presk.create).toHaveBeenCalledWith("shape", "dot", expect.objectContaining({ x: 120 }));
  });

  it("animates a 'transform' step to its target value", () => {
    const { presk } = makeMockPresk();
    presk.scene.add(new KRectangle({ id: "box", x: 0, y: 0, width: 10, height: 10 }));

    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [{ action: "transform", target: "box", properties: { x: 100 }, duration: 0.1 }],
    };

    compileAndFinish(doc, presk);
    expect((presk.scene.get("box") as KRectangle).x).toBeCloseTo(100);
  });

  it("registers and clears 'follow'/'unfollow' bindings", () => {
    const { presk } = makeMockPresk();
    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [
        { action: "follow", target: "arrow", properties: { x: "dot.x", y: "dot.y" } },
        { action: "unfollow", target: "arrow", properties: ["x"] },
      ],
    };

    compileAndFinish(doc, presk);

    expect(presk.binding.follow).toHaveBeenCalledWith("arrow", { x: "dot.x", y: "dot.y" });
    expect(presk.binding.unfollow).toHaveBeenCalledWith("arrow", ["x"]);
  });

  it("animates a 'transform' step with composite pos property", () => {
    const { presk } = makeMockPresk();
    presk.scene.add(new KRectangle({ id: "box", x: 0, y: 0, width: 10, height: 10 }));

    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [{ action: "transform", target: "box", properties: { pos: { x: 50, y: 75 } }, duration: 0.1 }],
    };

    compileAndFinish(doc, presk);
    const box = presk.scene.get("box") as KRectangle;
    expect(box.x).toBeCloseTo(50);
    expect(box.y).toBeCloseTo(75);
    expect(box.center.x).toBeCloseTo(50);
    expect(box.center.y).toBeCloseTo(75);
  });

  it("triggers create animation on a 'create' step", () => {
    const { presk } = makeMockPresk();
    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [{ action: "create", target: "fadeInBox", type: "shape", properties: { x: 100, y: 100, width: 20, height: 20, opacity: 1 }, duration: 0.1 }],
    };

    compileAndFinish(doc, presk);
    const box = presk.scene.get("fadeInBox") as KRectangle;
    expect(box.opacity).toBeCloseTo(1);
    expect(box.visible).toBe(true);
  });

  // LEGACY-OBSOLETE (DSL v0.1): follow on create is not in spec v1.0.
  it.skip("registers follow bindings directly on create step", () => {
    const { presk } = makeMockPresk();
    presk.scene.add(new KRectangle({ id: "title", x: 100, y: 200, width: 40, height: 20 }));

    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [
        {
          action: "create",
          target: "dot",
          type: "shape",
          properties: { width: 10, height: 10 },
          follow: { x: "title.x", y: "title.y" },
        },
      ],
    };

    compileAndFinish(doc, presk);

    expect(presk.create).toHaveBeenCalledWith("shape", "dot", expect.objectContaining({ x: 100, y: 200 }));
    expect(presk.binding.follow).toHaveBeenCalledWith("dot", { x: "title.x", y: "title.y" });
  });

  it("resolves sequential transforms and label-relative starts", () => {
    const { presk } = makeMockPresk();
    const box = new KRectangle({ id: "box", x: 0, y: 0, width: 10, height: 10 });
    presk.scene.add(box);
    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [
        { action: "transform", target: "box", properties: { x: 10 }, duration: 1, name: "move" },
        { action: "transform", target: "box", properties: { x: 20 }, start: "move+=2", duration: 1 },
      ],
    };

    const timer = compile(doc, presk);
    timer.seek(1.5);
    expect(box.x).toBeCloseTo(10);
    timer.seek(2.5);
    expect(box.x).toBeCloseTo(15);
    timer.seek(3);
    expect(box.x).toBeCloseTo(20);
  });

  it("restores a set value when seeking before its scheduled time", () => {
    const { presk } = makeMockPresk();
    const box = new KRectangle({ id: "box", x: 0, y: 0, width: 10, height: 10 });
    presk.scene.add(box);
    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [{ action: "set", target: "box", properties: { x: 50 }, start: 2 }],
    };

    const timer = compile(doc, presk);
    timer.seek(2);
    expect(box.x).toBe(50);
    timer.seek(1);
    expect(box.x).toBe(0);
  });

  it("supports offsets relative to the current timeline end", () => {
    const { presk } = makeMockPresk();
    const box = new KRectangle({ id: "box", x: 0, y: 0, width: 10, height: 10 });
    presk.scene.add(box);
    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [
        { action: "transform", target: "box", properties: { x: 10 }, duration: 1 },
        { action: "transform", target: "box", properties: { x: 20 }, start: "+=1", duration: 1 },
      ],
    };

    const timer = compile(doc, presk);
    timer.seek(2.5);

    expect(box.x).toBeCloseTo(15);
  });
});
