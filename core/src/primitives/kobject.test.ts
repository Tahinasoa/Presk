// Unit tests for KObject. Pure data class, so these run with no browser,
// no canvas, no PixiJS involved at all (see primitives/README.md).
import { describe, it, expect } from "vitest";
import KObject from "./kobject";

describe("KObject", () => {
  it("initializes properties from constructor args", () => {
    const obj = new KObject({ id: "hero", x: 10, y: 20, scale: 2, rotation: 0.5, opacity: 0.8 });

    expect(obj.id).toBe("hero");
    expect(obj.x).toBe(10);
    expect(obj.y).toBe(20);
    expect(obj.scale).toBe(2);
    expect(obj.rotation).toBe(0.5);
    expect(obj.opacity).toBe(0.8);
  });

  it("uses default values when optional args are omitted and starts invisible", () => {
    const obj = new KObject({ id: "hero", x: 10, y: 20 });

    expect(obj.scale).toBe(1);
    expect(obj.rotation).toBe(0);
    expect(obj.opacity).toBe(1);
    expect(obj.pos).toEqual({ x: 10, y: 20 });
    expect(obj.visible).toBe(false);
  });

  it("becomes visible when create() is invoked", () => {
    const obj = new KObject({ id: "hero", x: 10, y: 20 });
    expect(obj.visible).toBe(false);

    obj.create({ duration: 1 });

    expect(obj.visible).toBe(true);
  });

  it("updates values through setters", () => {
    const obj = new KObject({ id: "hero", x: 10, y: 20 });

    obj.id = "enemy";
    obj.x = 15;
    obj.y = 25;
    obj.pos = { x: 50, y: 60 };
    obj.scale = 3;
    obj.rotation = 45;
    obj.opacity = 0.2;

    expect(obj.id).toBe("enemy");
    expect(obj.x).toBe(50);
    expect(obj.y).toBe(60);
    expect(obj.pos).toEqual({ x: 50, y: 60 });
    expect(obj.scale).toBe(3);
    expect(obj.rotation).toBe(45);
    expect(obj.opacity).toBe(0.2);
  });
});
