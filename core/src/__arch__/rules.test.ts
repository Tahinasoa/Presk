import { describe, it, expect } from "vitest";
import { checkFile, extractSpecifiers, layerOf } from "./rules";

describe("layerOf", () => {
  it("detects new layers and ignores legacy", () => {
    expect(layerOf("model/sceneObject.ts")).toBe("model");
    expect(layerOf("primitives/kobject/kobject.ts")).toBeNull();
    expect(layerOf("presk.ts")).toBeNull();
  });
});

describe("extractSpecifiers", () => {
  it("finds static, side-effect, re-export and dynamic imports", () => {
    const src = `import a from "@/x/a";\nimport type { B } from '@/y/b';\nimport "pixi.js";\nexport * from "./c";\nconst d = await import("@/z/d");`;
    expect(extractSpecifiers(src)).toEqual(["@/x/a", "@/y/b", "pixi.js", "./c", "@/z/d"]);
  });
});

describe("checkFile", () => {
  it("accepts allowed imports", () => {
    expect(checkFile("model/a.ts", `import type { Pt } from "@/geom/vec";`)).toEqual([]);
    expect(checkFile("engine/a.ts", `import { easings } from "@/lang/easing/easing";`)).toEqual([]);
  });
  it("rejects upward imports", () => {
    expect(checkFile("model/a.ts", `import { X } from "@/engine/x";`)).toHaveLength(1);
    expect(checkFile("geom/a.ts", `import { X } from "@/model/x";`)).toHaveLength(1);
  });
  it("rejects legacy imports", () => {
    expect(checkFile("model/a.ts", `import KObject from "@/primitives/kobject/kobject";`)).toHaveLength(1);
  });
  it("restricts pixi.js to view/ and app/", () => {
    expect(checkFile("model/a.ts", `import { Graphics } from "pixi.js";`)).toHaveLength(1);
    expect(checkFile("view/a.ts", `import { Graphics } from "pixi.js";`)).toEqual([]);
  });
  it("restricts transformation-matrix to geom/matrix.ts", () => {
    expect(checkFile("geom/matrix.ts", `import { compose } from "transformation-matrix";`)).toEqual([]);
    expect(checkFile("geom/vec.ts", `import { compose } from "transformation-matrix";`)).toHaveLength(1);
  });
  it("rejects non-determinism and DOM in pure layers", () => {
    expect(checkFile("engine/a.ts", `const t = Date.now();`)).toHaveLength(1);
    expect(checkFile("lang/a.ts", `document.body;`)).toHaveLength(1);
    expect(checkFile("view/a.ts", `document.body;`)).toEqual([]);
  });
  it("allows vitest and node: only in tests", () => {
    expect(checkFile("lang/a.test.ts", `import { it } from "vitest";`)).toEqual([]);
    expect(checkFile("lang/a.ts", `import { it } from "vitest";`)).toHaveLength(1);
  });
  it("rejects relative imports leaving the layer", () => {
    expect(checkFile("model/classes/a.ts", `import x from "../../engine/x";`)).toHaveLength(1);
    expect(checkFile("model/classes/a.ts", `import x from "./b";`)).toEqual([]);
  });
  it("ignores files outside the new layers", () => {
    expect(checkFile("presk.ts", `import { X } from "@/primitives/x";`)).toEqual([]);
  });
});
