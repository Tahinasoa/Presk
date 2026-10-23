import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";

const catalog = createDefaultCatalog();
const objectEnv = createTestEnv();

describe("arc model integration", () => {
  it("compiles animation of endAngle", () => {
    const program = compileProgram({
      version: "1.0",
      scene: { width: 800, height: 600 },
      steps: [
        { action: "create", target: "arc", type: "arc" },
        { action: "animate", target: "arc", properties: { endAngle: 180 }, duration: 1 },
      ],
    }, { catalog, objectEnv });

    expect(program.actions).toHaveLength(1);
  });
});
