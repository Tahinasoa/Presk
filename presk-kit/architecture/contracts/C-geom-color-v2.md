# C-geom-color-v2 — `core/src/geom/color.ts` (remplace la section color.ts de C-geom.md)

Réf : ADR-021, ADR-022. Pur, sans import hors `geom/`.

## API finale (après T161)
```ts
export const COLOR_STRING_RE: RegExp;                 // /^#[0-9a-f]{6}([0-9a-f]{2})?$/ : forme canonique
export function parseColor(input: unknown): string | null;
export function lerpColor(a: string, b: string, t: number): string;
export function splitColor(c: string | number): { rgb: number; alpha: number };
export function colorFromRgba(r: number, g: number, b: number, a01: number): string;
```
`SceneObject.getColor(key: string): string` (model/sceneObject.ts) : l'état doit être une chaîne vérifiant `COLOR_STRING_RE`, sinon `Error("Presk internal: not a colour '<key>' on '<id>'")`.

## Règles
- **parseColor** accepte : `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` (casse indifférente) ; les 26 noms de C-geom.md ; un entier 0..0xFFFFFF. Tout le reste → `null`. Sortie : minuscules ; alpha `ff` omis ; `#rgb`/`#rgba` : chaque chiffre doublé.
- **splitColor** : accepte une chaîne **canonique** ou un entier ; autre chose (y compris un nom comme `"red"`) → `Error`. `alpha = octet / 255`.
- **colorFromRgba** : canaux arrondis et clampés 0..255, alpha clampé [0,1], octet = `round(a × 255)`.
- **lerpColor** : interpole r, g, b et l'octet alpha ; arrondi ; clamp 0..255 ; sortie canonique.

## Pendant la migration (T157 à T160)
Les fonctions `parseColorCanonical` et `lerpColorCanonical` coexistent avec les anciennes `parseColor`/`lerpColor` numériques. T161 supprime les anciennes et renomme les canoniques. Après T161 : plus de `*Canonical`.

## Table de référence
| entrée | `parseColor` |
|---|---|
| `"#ff0000"`, `"#F00"`, `"red"`, `0xff0000` | `"#ff0000"` |
| `"#f008"` | `"#ff000088"` |
| `"#ff0000ff"`, `"#f00f"` | `"#ff0000"` |
| `"#ff000000"` | `"#ff000000"` |
| `"nope"`, `"#ff"`, `"#12345"`, `-1`, `0x1000000`, `1.5`, `null` | `null` |
