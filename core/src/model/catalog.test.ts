import { describe, expect, it } from "vitest";
import { Catalog } from "@/model/catalog";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";

describe("Catalog", () => {
  it("creates a sorted default catalog with arc, arrow, circle, curve, ellipse, group, line, point, polygon, polyline, ray, rectangle, scene, segment, text and triangle", () => {
    const catalog = createDefaultCatalog();

    expect(catalog.types()).toEqual(["arc", "arrow", "circle", "curve", "ellipse", "group", "line", "point", "polygon", "polyline", "ray", "rectangle", "scene", "segment", "text", "triangle"]);
    expect(catalog.get("text")?.family).toBe("rectangle");
    expect(catalog.get("nope")).toBeUndefined();
    expect(catalog.has("scene")).toBe(true);
    expect(catalog.get("scene")?.creatable).toBe(false);
    expect(catalog.get("rectangle")?.creatable).toBe(true);
    expect(catalog.get("group")?.family).toBe("rectangle");
    expect(catalog.get("group")?.creatable).toBe(true);
  });

  it("rejects registering a type more than once", () => {
    const catalog = new Catalog();
    catalog.register(RECTANGLE_DEF);

    expect(() => catalog.register(RECTANGLE_DEF)).toThrow();
  });
});
