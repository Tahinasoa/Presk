import { anchorOfBounds, boundsHeight, boundsWidth, isAnchorName } from "@/geom/bounds";
import type { AnchorName } from "@/geom/bounds";
import { PreskRuntimeError } from "@/lang/diagnostics";
import type { RefSegment } from "@/lang/expr/ast";
import type { Pt } from "@/geom/vec";
import type { SceneObject } from "@/model/sceneObject";
import type { ClassDef, RefDescription } from "@/model/values";

export type { RefDescription } from "@/model/values";

function unknownSegment(): RefDescription {
  return { ok: false, code: "E_EXPR_SEGMENT_UNKNOWN", message: "Unknown expression reference segment" };
}

function plainSegment(segment: RefSegment | undefined, name?: string): segment is RefSegment {
  return segment !== undefined && segment.index === undefined && (name === undefined || segment.name === name);
}

function isAxis(segment: RefSegment | undefined): segment is RefSegment {
  return plainSegment(segment) && (segment.name === "x" || segment.name === "y");
}

export function describeRef(def: ClassDef, path: RefSegment[]): RefDescription {
  const extension = def.refExtension?.describe(path);
  if (extension !== undefined) return extension;
  if (path.length === 0) return unknownSegment();

  const first = path[0];
  if (first.name === "boundingBox" && first.index === undefined) {
    if (path.length === 1) {
      return { ok: false, code: "E_EXPR_BOUNDINGBOX_ALONE", message: "boundingBox requires an anchor or dimension" };
    }
    if (def.family === "unbounded" || def.family === "point") {
      return { ok: false, code: "E_EXPR_INFINITE_REF", message: "This object has no finite bounding box" };
    }
    if (path.length === 2 && plainSegment(path[1])) {
      if (isAnchorName(path[1].name) || path[1].name === "width" || path[1].name === "height") {
        return { ok: true, type: isAnchorName(path[1].name) ? "point" : "scalar" };
      }
    }
    if (path.length === 3 && plainSegment(path[1]) && isAnchorName(path[1].name) && isAxis(path[2])) {
      return { ok: true, type: "scalar" };
    }
    return unknownSegment();
  }

  if (first.index !== undefined) {
    const indexed = def.indexed[first.name];
    if (!indexed) return unknownSegment();
    if (path.length === 1) return { ok: true, type: "point" };
    if (path.length === 2 && isAxis(path[1])) return { ok: true, type: "scalar" };
    return unknownSegment();
  }

  const prop = def.props[first.name];
  if (!prop) return unknownSegment();
  if (path.length === 1) {
    if (prop.kind === "number") return { ok: true, type: "scalar" };
    if (prop.kind === "point") return { ok: true, type: "point" };
    return unknownSegment();
  }
  if (path.length === 2 && prop.kind === "point" && isAxis(path[1])) {
    return { ok: true, type: "scalar" };
  }
  return unknownSegment();
}

export function readRef(o: SceneObject, path: RefSegment[]): number | Pt {
  const extension = o.def.refExtension?.describe(path);
  if (extension !== undefined) {
    if (!extension.ok || !o.def.refExtension) throw new Error("Presk internal: invalid ref");
    return o.def.refExtension.read(o, path);
  }

  const description = describeRef(o.def, path);
  if (!description.ok) throw new Error("Presk internal: invalid ref");

  const first = path[0];
  if (first.name === "boundingBox") {
    const bounds = o.worldBounds();
    if (!bounds) throw new Error("Presk internal: invalid ref");
    if (path.length === 2) {
      const name = path[1].name;
      if (name === "width") return boundsWidth(bounds);
      if (name === "height") return boundsHeight(bounds);
      if (isAnchorName(name)) return anchorOfBounds(bounds, name);
    }
    const point = anchorOfBounds(bounds, path[1].name as AnchorName);
    return path[2].name === "x" ? point.x : point.y;
  }

  if (first.index !== undefined) {
    const indexed = o.def.indexed[first.name];
    if (!indexed) throw new Error("Presk internal: invalid ref");
    if (first.index < 0 || first.index >= indexed.count(o)) {
      throw new PreskRuntimeError(`E_ANCHOR_INDEX: index ${first.index} is out of range for '${first.name}'`);
    }
    const point = indexed.get(o, first.index);
    if (path.length === 1) return point;
    return path[1].name === "x" ? point.x : point.y;
  }

  const prop = o.def.props[first.name];
  if (!prop) throw new Error("Presk internal: invalid ref");
  const value = prop.get(o);
  if (path.length === 1) return value as number | Pt;
  const point = value as Pt;
  return path[1].name === "x" ? point.x : point.y;
}
