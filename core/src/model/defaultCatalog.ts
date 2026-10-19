import { Catalog } from "@/model/catalog";
import { SCENE_DEF } from "@/model/classes/sceneRoot";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { TEXT_DEF } from "@/model/classes/textObject";

export function createDefaultCatalog(): Catalog {
  const catalog = new Catalog();
  catalog.register(SCENE_DEF);
  catalog.register(RECTANGLE_DEF);
  catalog.register(TEXT_DEF);
  return catalog;
}
