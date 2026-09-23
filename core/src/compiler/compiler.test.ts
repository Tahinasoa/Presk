// Tests the DSL -> GSAP timeline compilation in isolation from rendering:
// PixiJS needs a real <canvas>/WebGL context, which this test suite (run
// under Node, not a browser) doesn't have. Instead we exercise `compile()`
// against a minimal mock that behaves like Presk's create/destroy/binding
// API, and drive the resulting timeline with `tl.progress(1)` to play it
// to completion synchronously.
import { describe, it, expect, vi } from "vitest";
import KScene from "@/primitives/kscene";
import KRectangle from "@/primitives/krectangle";
import type Presk from "@/presk";
import { compile } from "./compiler";
import type { DslDocument } from "./types";

function makeMockPresk() {
  const scene = new KScene({ id: "scene", x: 0, y: 0, width: 800, height: 600 });
  const created: string[] = [];
  const destroyed: string[] = [];

  const presk = {
    scene,
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

    const tl = compile(doc, presk);
    tl.progress(1); // play the whole timeline synchronously

    expect(created).toEqual(["box", "label"]);
  });

  it("resolves an expression property once for 'create'", () => {
    const { presk } = makeMockPresk();
    presk.scene.add(new KRectangle({ id: "title", x: 100, y: 0, width: 40, height: 20 }));

    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [{ action: "create", target: "dot", type: "shape", properties: { x: "title.topRight.x", y: 0 } }],
    };

    compile(doc, presk).progress(1);

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

    compile(doc, presk).progress(1);
    // Give the inner gsap.to() tween (started via tl.call at progress(1)) a
    // moment to complete; duration is tiny (0.1s) so this settles quickly.
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect((presk.scene.get("box") as KRectangle).x).toBeCloseTo(100);
        resolve();
      }, 200);
    });
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

    compile(doc, presk).progress(1);

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

    compile(doc, presk).progress(1);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const box = presk.scene.get("box") as KRectangle;
        expect(box.x).toBeCloseTo(50);
        expect(box.y).toBeCloseTo(75);
        expect(box.center.x).toBeCloseTo(50);
        expect(box.center.y).toBeCloseTo(75);
        resolve();
      }, 200);
    });
  });

  it("triggers create animation on a 'create' step", () => {
    const { presk } = makeMockPresk();
    const doc: DslDocument = {
      version: "0.1",
      scene: { width: 800, height: 600 },
      steps: [{ action: "create", target: "fadeInBox", type: "shape", properties: { x: 100, y: 100, width: 20, height: 20, opacity: 1 }, duration: 0.1 }],
    };

    compile(doc, presk).progress(1);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const box = presk.scene.get("fadeInBox") as KRectangle;
        expect(box.opacity).toBeCloseTo(1);
        resolve();
      }, 200);
    });
  });
});
