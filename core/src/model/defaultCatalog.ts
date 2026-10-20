import { Catalog } from "@/model/catalog";
import { ARC_DEF } from "@/model/classes/arcObject";
import { SCENE_DEF } from "@/model/classes/sceneRoot";
import { GROUP_DEF } from "@/model/classes/groupObject";
import { CIRCLE_DEF } from "@/model/classes/circleObject";
import { ELLIPSE_DEF } from "@/model/classes/ellipseObject";
import { POLYGON_DEF, TRIANGLE_DEF } from "@/model/classes/polygonObject";
import { POLYLINE_DEF } from "@/model/classes/polylineObject";
import { POINT_DEF } from "@/model/classes/pointObject";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { LINE_DEF, RAY_DEF } from "@/model/classes/rayLineObject";
import { ARROW_DEF, SEGMENT_DEF } from "@/model/classes/segmentObject";
import { TEXT_DEF } from "@/model/classes/textObject";

export function createDefaultCatalog(): Catalog {
  const catalog = new Catalog();
  catalog.register(SCENE_DEF);
  catalog.register(ARC_DEF);
  catalog.register(CIRCLE_DEF);
  catalog.register(ELLIPSE_DEF);
  catalog.register(GROUP_DEF);
  catalog.register(POLYGON_DEF);
  catalog.register(POLYLINE_DEF);
  catalog.register(POINT_DEF);
  catalog.register(RAY_DEF);
  catalog.register(LINE_DEF);
  catalog.register(RECTANGLE_DEF);
  catalog.register(SEGMENT_DEF);
  catalog.register(ARROW_DEF);
  catalog.register(TEXT_DEF);
  catalog.register(TRIANGLE_DEF);
  return catalog;
}
