import type { Program } from "@/engine/program";
import type { Catalog } from "@/model/catalog";
import { createSceneRoot } from "@/model/classes/sceneRoot";
import type { ObjectEnv } from "@/model/ports";
import { World } from "@/model/world";

export function buildWorld(program: Program, env: { catalog: Catalog; objectEnv: ObjectEnv }): World {
  const root = createSceneRoot(program.scene.width, program.scene.height, env.objectEnv);
  const world = new World(root);

  for (const init of program.init) {
    const def = env.catalog.get(init.type)!;
    const object = def.create(init.id, env.objectEnv);
    for (const entry of init.entries) {
      if (entry.kind === "prop" && entry.spec.order === 0) {
        entry.spec.set!(object, entry.value(world));
      }
    }

    def.afterGeometry?.(object);

    for (const entry of init.entries) {
      if (entry.kind === "prop" && entry.spec.order >= 1) {
        entry.spec.set!(object, entry.value(world));
      }
    }

    for (const entry of init.entries) {
      if (entry.kind === "effect") {
        entry.def.apply(object, entry.variant, entry.on ? 1 : 0);
      }
    }

    world.add(object);
  }

  world.captureInitial();
  return world;
}
