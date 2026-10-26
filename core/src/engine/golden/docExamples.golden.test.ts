// Runs every example of "Presk — Primitives v1.0.md" (language/examples/*.json) through the real engine.
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { compileProgram } from "@/engine/compileProgram";
import { Simulation } from "@/engine/sim/simulation";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { FakeImageInfo, FakeTextMeasurer } from "@/model/ports";

const DIR = fileURLToPath(new URL("../../../../language/examples/", import.meta.url));
const FILES = readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();

function env() {
  const catalog = createDefaultCatalog();
  const objectEnv = {
    measurer: new FakeTextMeasurer(),
    images: new FakeImageInfo({ "logo.png": { width: 400, height: 200 } }),
  };
  return { catalog, objectEnv };
}

function run(file: string) {
  const raw = JSON.parse(readFileSync(join(DIR, file), "utf8"));
  const e = env();
  const program = compileProgram(raw, e);
  const sim = new Simulation(program, e);
  return { program, sim };
}

function fileFor(key: string): string {
  const f = FILES.find((name) => name.endsWith(`-${key}.json`));
  if (!f) throw new Error(`example not found: ${key}`);
  return f;
}

describe("documentation examples compile and run", () => {
  it("finds the examples", () => {
    expect(FILES.length).toBe(19);
  });

  it.each(FILES)("%s compiles and plays from start to end", (file) => {
    const { program, sim } = run(file);
    expect(program.duration).toBeGreaterThan(0);
    sim.seek(0);
    sim.seek(program.duration / 2);
    sim.seek(program.duration);
    sim.seek(0); // replay from zero must also work
  });
});

describe("documentation examples reach the documented end state", () => {
  const at = (key: string, id: string, prop: string): number => {
    const { program, sim } = run(fileFor(key));
    sim.seek(program.duration);
    return sim.world.require(id).readProp(prop) as number;
  };
  it("rectangle: width 400, rotation 15, duration 2", () => {
    const { program } = run(fileFor("rectangle"));
    expect(program.duration).toBeCloseTo(2, 6);
    expect(at("rectangle", "box", "width")).toBeCloseTo(400, 6);
    expect(at("rectangle", "box", "rotation")).toBeCloseTo(15, 6);
  });
  it("ellipse: ends 120 x 300", () => {
    expect(at("ellipse", "e", "width")).toBeCloseTo(120, 6);
    expect(at("ellipse", "e", "height")).toBeCloseTo(300, 6);
  });
  it("circle: radius 90", () => {
    expect(at("circle", "sun", "radius")).toBeCloseTo(90, 6);
  });
  it("group: the implicit group ends at x = 600", () => {
    expect(at("group", "menu", "x")).toBeCloseTo(600, 6);
  });
  it("ray: rotation 360", () => {
    expect(at("ray", "r", "rotation")).toBeCloseTo(360, 6);
  });
  it("durations quoted in the document", () => {
    const expected: Record<string, number> = {
      text: 3, group: 2.1, circle: 2.2, ellipse: 2.5, arc: 2.3, polygon: 3, triangle: 2,
      polyline: 2, polyline_circuit: 13.3, curve: 1.5, segment: 2.3, arrow: 2, ray: 4.5,
      line: 1.5, point: 6.5, scene: 4.5, travel_orient: 6.3,
    };
    for (const [key, d] of Object.entries(expected)) {
      expect(run(fileFor(key)).program.duration).toBeCloseTo(d, 6);
    }
  });
});
