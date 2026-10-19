# C-model-core — `core/src/model/`

Réf : ADR-005, 006, 008, 014. Aucun import de `engine/`, `view/`, `pixi.js`.

## values.ts
```ts
import type { Pt } from "@/geom/vec";
export type { Pt };
export interface ViewTarget { cx: number; cy: number; zoom: number }   // état de la vue de la scène (ADR-016)
export type StateValue = number | string | boolean | Pt | readonly Pt[] | ViewTarget;
export type PropKind = "number" | "point" | "color" | "string" | "boolean" | "enum" | "pointList" | "objectRef" | "objectRefList" | "region" | "view";
export type PropMode = "rw" | "ro" | "init";      // init : create/set seulement (ni animate ni bind)
export interface PropSpec {
  kind: PropKind;
  writes: readonly string[];        // clés d'état touchées (équivalences §9.4). [] pour "ro".
  mode: PropMode;
  animatable: boolean;              // vrai seulement pour number | point | color en mode rw
  order: 0 | 1 | 2 | 3;             // ordre d'application dans une étape (ADR-008)
  values?: readonly string[];       // kind "enum"
  min?: number; max?: number; minExclusive?: boolean;   // kind "number" : bornes → E_VALUE_RANGE
  required?: boolean;               // doit figurer dans `create` (sinon E_FIELD_REQUIRED) : polygon.points, image.url…
  minItems?: number; maxItems?: number;   // kind "pointList" : bornes du nombre de points → E_VALUE_RANGE
  customKind?: string;              // ex. "scene.focusOn" : compileValue délègue à un compilateur dédié de l'engine (P8)
  get(o: SceneObject): StateValue;
  set?(o: SceneObject, v: StateValue): void;            // absent si mode "ro"
}
export interface IndexedPropSpec {                       // vertex[i]
  count(o: SceneObject): number;
  get(o: SceneObject, i: number): Pt;                    // repère monde
  set?(o: SceneObject, i: number, worldPt: Pt): void;
  writeKey(i: number): string;                           // clé de base touchée, ex. "points.2"
}
export interface PathSpec {
  closed: "always" | "never" | "state";                  // "state" : dépend de l'objet (polyline.closed)
  isClosed(o: SceneObject): boolean;
  build(o: SceneObject): FlatPath;                       // repère LOCAL
}
export type Family = "rectangle" | "bounded" | "unbounded" | "point";
export interface ClassDef {
  type: string;
  family: Family;
  creatable: boolean;               // false pour "scene"
  props: Readonly<Record<string, PropSpec>>;
  indexed: Readonly<Record<string, IndexedPropSpec>>;
  effects: Readonly<Record<string, EffectDef>>;          // inclut toujours "reveal"
  paths: Readonly<Record<string, PathSpec>>;             // "main" pour tout objet borné (hors line/ray/point)
  create(id: string, env: ObjectEnv): SceneObject;
  refExtension?: {                  // lecture de chemins spéciaux (ex. scene.view.*), consultée avant les règles générales
    describe(path: RefSegment[]): RefDescription | undefined;   // undefined = pas concerné
    read(o: SceneObject, path: RefSegment[]): number | Pt;
  };
  afterGeometry?(o: SceneObject): void;   // appelé par buildWorld après les entrées d'ordre 0 et avant celles d'ordre ≥ 1 (segment, arrow, ray, line)
}
```

## ports.ts
```ts
export interface TextStyle { fontSize: number; fontFamily: string; fontWeight: "normal" | "bold" }
export interface TextMeasurer { measure(text: string, style: TextStyle): { width: number; height: number } }
export interface ImageInfoProvider { sizeOf(url: string): { width: number; height: number } | undefined }
export interface ObjectEnv { measurer: TextMeasurer; images: ImageInfoProvider }
export class FakeTextMeasurer implements TextMeasurer {}   // width = 0.6 × fontSize × text.length ; height = 1.2 × fontSize
export class FakeImageInfo implements ImageInfoProvider {}  // constructor(sizes: Record<string, {width,height}> = {})
export function createTestEnv(): ObjectEnv;               // { measurer: new FakeTextMeasurer(), images: new FakeImageInfo() }
```

## SceneObject (`sceneObject.ts`)
```ts
export abstract class SceneObject {
  readonly id: string;
  readonly def: ClassDef;
  parent: SceneObject | null;                 // modifié seulement par GroupObject / World
  protected readonly env: ObjectEnv;
  constructor(id: string, def: ClassDef, env: ObjectEnv, initial: Record<string, StateValue>);
  getState(key: string): StateValue;          // throw Error interne si clé inconnue
  setState(key: string, value: StateValue): void;   // throw si clé absente de l'état initial
  hasState(key: string): boolean;
  getNumber(key: string): number;  getPoint(key: string): Pt;  getString(key: string): string;
  snapshot(): Record<string, StateValue>;     // copie profonde
  restore(s: Record<string, StateValue>): void;
  abstract localBounds(): Bounds | null;      // repère local, origine = pos ; null si non borné
  pivotLocal(): Pt;                           // ADR-006
  localMatrix(): Mat;                         // trsPivot({x,y}, pivotLocal(), rotation, scale)
  parentMatrix(): Mat;                        // parent ? parent.worldMatrix() : IDENTITY
  worldMatrix(): Mat;                         // composeMat(parentMatrix(), localMatrix())
  worldBounds(): Bounds | null;               // transformBounds(localBounds(), worldMatrix())
  effectiveAlpha(): number;                   // opacity × presence × (parent?.effectiveAlpha() ?? 1)
  children(): readonly SceneObject[];         // [] sauf GroupObject
  setChildren(children: readonly SceneObject[]): void;   // no-op par défaut ; GroupObject remplace sa liste (utilisé par World.reset)
  readProp(name: string): StateValue;         // via def.props[name].get
  writeProp(name: string, value: StateValue): void;   // via def.props[name].set (throw si ro/inconnu)
}
```
État commun (toujours présent) : `x:0 y:0 rotation:0 scale:1 opacity:1 presence:0 pivot:"center"|"pos"`.

## baseProps.ts
`export function baseProps(opts: { pivotValues: readonly string[] }): Record<string, PropSpec>` renvoie :
| nom | kind | writes | mode | animatable | order | bornes |
|---|---|---|---|---|---|---|
| `x` | number | `["x"]` | rw | oui | 2 | |
| `y` | number | `["y"]` | rw | oui | 2 | |
| `pos` | point | `["x","y"]` | rw | oui | 2 | |
| `rotation` | number | `["rotation"]` | rw | oui | 1 | |
| `scale` | number | `["scale"]` | rw | oui | 1 | > 0 (minExclusive, min 0) |
| `opacity` | number | `["opacity"]` | rw | oui | 3 | [0,1] |
| `pivot` | enum | `["pivot"]` | **init** | non | 1 | `values = pivotValues` |
`pos.get` = `{x,y}` état. Les classes **ajoutent** leurs propres props à ce tableau.

## World (`world.ts`)
```ts
export class World {
  readonly root: SceneObject;                 // id "scene"
  constructor(root: SceneObject);
  add(o: SceneObject): void;                  // throw si id déjà pris ou "scene"
  get(id: string): SceneObject | undefined;   // "scene" → root
  require(id: string): SceneObject;           // throw PreskRuntimeError si absent
  has(id: string): boolean;
  all(): readonly SceneObject[];              // ordre de création, racine exclue
  captureInitial(): void;                     // mémorise états + hiérarchie
  reset(): void;                              // restaure états + hiérarchie initiaux
}
```

## Catalog (`catalog.ts`) et `defaultCatalog.ts`
```ts
export class Catalog { register(def: ClassDef): void; get(type: string): ClassDef | undefined; has(type: string): boolean; types(): string[] }
export function createDefaultCatalog(): Catalog;   // enregistre scene, rectangle, text, … (une ligne par classe ajoutée)
```

## Lecture de références (`refs.ts`)
```ts
export type RefDescription = { ok: true; type: "scalar" | "point" } | { ok: false; code: DiagnosticCode; message: string };
export function describeRef(def: ClassDef, path: RefSegment[]): RefDescription;      // statique, T060 l'utilise
export function readRef(o: SceneObject, path: RefSegment[]): number | Pt;            // dynamique
```
Règles (§3.2–3.4, §7.2) pour `describeRef` / `readRef` :
1. `[p]` avec `def.props[p].kind === "number"` → scalar ; `"point"` → point ; autre kind → `E_EXPR_SEGMENT_UNKNOWN`.
2. `[p, "x"|"y"]` avec `p` de kind point → scalar.
3. `["boundingBox"]` seul → `E_EXPR_BOUNDINGBOX_ALONE`. `["boundingBox", anchor]` → point ; `["boundingBox", anchor, "x"|"y"]` → scalar ; `["boundingBox","width"|"height"]` → scalar. Famille `unbounded` ou `point` → `E_EXPR_INFINITE_REF`. Valeur = `worldBounds()`.
4. `[{name, index}]` avec `def.indexed[name]` → point ; `[{name,index}, "x"|"y"]` → scalar. `readRef` : indice hors bornes → `PreskRuntimeError` (code `E_ANCHOR_INDEX` dans le message).
5. Tout le reste → `E_EXPR_SEGMENT_UNKNOWN`. Propriétés `top`, `left`, `right`, `bottom` : **inexistantes**.
6. `scene.view.*` : `def.refExtension` (ajouté en T143) est consulté **en premier** : s'il répond (`describe` ≠ undefined), son résultat prévaut.
Les ancres de la famille rectangle (`topLeft`…) sont des `props` de kind point (mode rw, writes `["x","y"]`), et lisent en **repère monde**.
