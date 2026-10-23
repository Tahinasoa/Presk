import type { Catalog } from "@/model/catalog";

export interface AnalyzeScope {
  catalog: Catalog;
  typeOf(id: string): string | undefined;
  isForward?(id: string): boolean;
}

export type ExprType = "scalar" | "point";

export interface Analyzed {
  type: ExprType;
  reads: string[];
}

export function createScope(
  catalog: Catalog,
  types: ReadonlyMap<string, string>,
  forward?: ReadonlySet<string>,
): AnalyzeScope {
  return {
    catalog,
    typeOf: (id) => id === "scene" ? "scene" : types.get(id),
    isForward: (id) => forward?.has(id) ?? false,
  };
}
