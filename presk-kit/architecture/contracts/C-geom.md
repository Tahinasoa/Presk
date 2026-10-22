# C-geom — `core/src/geom/`

Tout est pur, sans état, sans import hors `geom/` (sauf `transformation-matrix` dans `matrix.ts`). ADR-003.

## vec.ts
```ts
export interface Pt { x: number; y: number }
export function pt(x: number, y: number): Pt;
export function addPt(a: Pt, b: Pt): Pt;  export function subPt(a: Pt, b: Pt): Pt;
export function scalePt(a: Pt, k: number): Pt;
export function lerp(a: number, b: number, t: number): number;
export function lerpPt(a: Pt, b: Pt, t: number): Pt;
export function distPt(a: Pt, b: Pt): number;
export function clamp(x: number, lo: number, hi: number): number;
export function nearlyEqual(a: number, b: number, eps?: number): boolean;   // eps défaut 1e-9
```

## matrix.ts  (encapsule `transformation-matrix`)
```ts
export type Mat = { a: number; b: number; c: number; d: number; e: number; f: number };
export const IDENTITY: Mat;
export function composeMat(...ms: Mat[]): Mat;           // composeMat(A,B) = A·B (B appliquée d'abord)
export function translateMat(x: number, y: number): Mat;
export function applyMat(m: Mat, p: Pt): Pt;
export function invertMat(m: Mat): Mat;                  // lève Error interne si singulière (det≈0)
export function degToRad(d: number): number;  export function radToDeg(r: number): number;
export function trsPivot(pos: Pt, pivot: Pt, rotationDeg: number, scale: number): Mat;  // T(pos)·T(pivot)·R·S·T(−pivot)
export function matRotationDeg(m: Mat): number;          // atan2(b, a) en degrés
export function matScale(m: Mat): number;                // hypot(a, b)  (similarité uniquement)
export function applyLinear(m: Mat, v: Pt): Pt;          // sans translation
```
Rotation positive = **sens horaire à l'écran** (y vers le bas) : `R(θ) = [[cos, −sin],[sin, cos]]` appliquée à (x,y). Ex. `applyMat(trsPivot({x:0,y:0},{x:0,y:0},90,1), {x:1,y:0})` ≈ `{x:0,y:1}`.

## bounds.ts
```ts
export interface Bounds { minX: number; minY: number; maxX: number; maxY: number }
export const ANCHOR_NAMES: readonly ["topLeft","topCenter","topRight","centerLeft","center","centerRight","bottomLeft","bottomCenter","bottomRight"];
export type AnchorName = (typeof ANCHOR_NAMES)[number];
export function isAnchorName(s: string): s is AnchorName;
export function boundsOfPoints(pts: readonly Pt[]): Bounds | null;     // null si vide
export function unionBounds(a: Bounds | null, b: Bounds | null): Bounds | null;
export function transformBounds(b: Bounds, m: Mat): Bounds;            // AABB des 4 coins transformés
export function anchorOfBounds(b: Bounds, name: AnchorName): Pt;
export function boundsWidth(b: Bounds): number;  export function boundsHeight(b: Bounds): number;
```

## color.ts
```ts
export function parseColor(input: unknown): number | null;   // 0xRRGGBB ou null
export function lerpColor(a: number, b: number, t: number): number;   // par canal, arrondi
```
Entrées : `#rgb`, `#rrggbb` (insensible à la casse), entier 0..0xFFFFFF, noms (table, insensible à la casse) :
black 000000 · silver c0c0c0 · gray 808080 · white ffffff · maroon 800000 · red ff0000 · purple 800080 · fuchsia ff00ff ·
green 008000 · lime 00ff00 · olive 808000 · yellow ffff00 · navy 000080 · blue 0000ff · teal 008080 · aqua 00ffff ·
orange ffa500 · pink ffc0cb · brown a52a2a · cyan 00ffff · magenta ff00ff · gold ffd700 · violet ee82ee · indigo 4b0082 ·
lightgray d3d3d3 · darkgray a9a9a9. Autres → `null`.

## flatPath.ts
```ts
export class FlatPath {
  constructor(points: readonly Pt[], closed: boolean);   // closed : ne PAS répéter le 1er point ; le segment de fermeture est ajouté
  readonly closed: boolean;
  readonly length: number;                               // somme des segments (fermeture comprise si closed)
  readonly points: readonly Pt[];
  pointAt(t: number): Pt;      // t normalisé par longueur d'arc. Fermé : t modulo 1 (valeurs négatives ok). Ouvert : clamp [0,1].
  angleAt(t: number): number;  // degrés, atan2(dy,dx) du segment contenant t ; sur un sommet : segment SORTANT ; t=1 ouvert : dernier segment
  sub(from: number, to: number): Pt[];    // points de la portion [from,to] (0≤from≤to≤1), extrémités interpolées (sert à `draw`)
}
export function flattenEllipse(rx: number, ry: number, segments?: number): Pt[];            // centre (0,0), départ (rx,0), sens horaire écran, défaut 720
export function flattenArc(rx: number, ry: number, startDeg: number, endDeg: number): Pt[]; // ouvert, ≥8 pts, ≤1° par segment
export function flattenCubic(p0: Pt, c1: Pt, c2: Pt, p1: Pt, segments?: number): Pt[];      // défaut 48, inclut p0 et p1
```
Segments de longueur nulle : ignorés pour `angleAt`. Un chemin de longueur 0 : `pointAt` renvoie le premier point, `angleAt` 0.
