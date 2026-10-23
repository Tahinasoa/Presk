import { describe, expect, it } from "vitest";
import { COLOR_STRING_RE } from "@/geom/color";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";

describe("colour defaults", () => {
  const catalog = createDefaultCatalog();

  it("stores every colour property of every creatable class as a canonical string", () => {
    for (const type of catalog.types()) {
      const def = catalog.get(type);
      if (!def || !def.creatable) continue;
      const object = def.create("x", createTestEnv());
      for (const [name, spec] of Object.entries(def.props)) {
        if (spec.kind !== "color") continue;
        const value = object.getState(name);
        expect(typeof value, `${type}.${name}`).toBe("string");
        expect(COLOR_STRING_RE.test(value as string), `${type}.${name}`).toBe(true);
      }
    }
  });

  it("uses the documented defaults", () => {
    const env = createTestEnv();
    const rectangle = catalog.get("rectangle")!.create("x", env);
    expect(rectangle.getState("fill")).toBe("#9c9c9c");
    expect(rectangle.getState("stroke")).toBe("#ffffff");
    expect(catalog.get("segment")!.create("x", env).getState("stroke")).toBe("#9c9c9c");
    expect(catalog.get("text")!.create("x", env).getState("color")).toBe("#ffffff");
  });
});
