# T157-geom-colour-canonical-helpers
**Phase** P10 · **Dépend de** : T156-final-audit · **Réf spec** : §11.3 (extension : alpha, Q24)

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/conventions.md`
- `architecture/decisions/ADR-021-colours-canonical-strings-with-alpha.md`
- `architecture/contracts/C-geom-color-v2.md`

## Objectif
Ajouter dans `geom/color.ts` les fonctions qui manipulent les couleurs en chaînes canoniques avec alpha. **Aucun comportement existant ne change** : `parseColor` et `lerpColor` actuelles restent intactes.

## Fichiers
- modifier : `core/src/geom/color.ts`
- modifier : `core/src/geom/color.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T157.1 Écris les tests (cas ci-dessous) **à la suite** de ceux de `color.test.ts` (ne modifie aucun test existant).
T157.2 Dans `color.ts`, exporte `COLOR_STRING_RE = /^#[0-9a-f]{6}([0-9a-f]{2})?$/`. **Réutilise** la table `NAMED_COLORS` existante.
T157.3 `parseColorCanonical(input: unknown): string | null` : accepte `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` (insensible à la casse), les 26 noms, un entier 0..0xFFFFFF. Sortie : minuscules ; si l'octet alpha vaut `ff`, il est **omis** (6 chiffres). `#rgb` et `#rgba` : chaque chiffre est doublé (`#f008` → `ff000088`). Tout le reste → `null`.
T157.4 `splitColor(c: string | number): { rgb: number; alpha: number }` : `rgb` = 0xRRGGBB, `alpha` = octet / 255 (de 0 à 1). Accepte une chaîne canonique (via `parseColorCanonical`) ou un entier 0..0xFFFFFF (alpha 1). Entrée invalide → `throw new Error("Presk internal: invalid colour")`.
T157.5 `colorFromRgba(r: number, g: number, b: number, a01: number): string` : arrondit et clampe chaque canal à 0..255, `a01` à [0,1] ; octet alpha = `Math.round(a01 × 255)` ; renvoie la forme canonique (alpha 255 → 6 chiffres).
T157.6 `lerpColorCanonical(a: string, b: string, t: number): string` : extrait r, g, b et **alpha (octet 0..255)** de chaque couleur, interpole chaque canal linéairement, arrondit, clampe 0..255, renvoie la forme canonique. `t` hors [0,1] autorisé (les easings dépassent) : seul le clamp des canaux protège.

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| `parseColorCanonical("#ff0000")` ; `"#F00"` ; `"#888"` | `"#ff0000"` ; `"#ff0000"` ; `"#888888"` |
| `parseColorCanonical("blue")` ; `"Blue"` | `"#0000ff"` ; `"#0000ff"` |
| `parseColorCanonical(0x9c9c9c)` ; `0` | `"#9c9c9c"` ; `"#000000"` |
| `parseColorCanonical("#f008")` ; `"#ff000080"` ; `"#FF000080"` | `"#ff000088"` ; `"#ff000080"` ; `"#ff000080"` |
| `parseColorCanonical("#ff0000ff")` ; `"#f00f"` | `"#ff0000"` ; `"#ff0000"` (alpha opaque omis) |
| `parseColorCanonical("#ff000000")` | `"#ff000000"` (alpha 0 conservé) |
| `parseColorCanonical("nope")`, `"#ff"`, `"#12345"`, `"#gggggg"`, `"#1234567"`, `""`, `-1`, `0x1000000`, `1.5`, `null`, `{}` | `null` |
| `splitColor("#ff000080")` | `rgb 0xff0000`, `alpha` ≈ 0.502 (`toBeCloseTo(0.502, 3)`) |
| `splitColor("#00ff00")` ; `splitColor(0x9c9c9c)` | `{rgb:0x00ff00, alpha:1}` ; `{rgb:0x9c9c9c, alpha:1}` |
| `splitColor("nope")` ; `splitColor("red")` | lèvent (seules les chaînes canoniques et les entiers sont acceptés) |
| `colorFromRgba(255,0,0,1)` ; `(255,0,0,0.5)` ; `(255,0,0,0)` | `"#ff0000"` ; `"#ff000080"` ; `"#ff000000"` |
| `colorFromRgba(300,-5,0,2)` | `"#ff0000"` (clamps) |
| `lerpColorCanonical("#000000","#ffffff",0.5)` | `"#808080"` |
| `lerpColorCanonical("#ff0000","#0000ff",0)` ; `1` | `"#ff0000"` ; `"#0000ff"` |
| `lerpColorCanonical("#000000","#ffffff",1.5)` | `"#ffffff"` |
| `lerpColorCanonical("#ff000000","#ff0000ff",0.5)` | `"#ff000080"` |
| `lerpColorCanonical("#ff0000","#ff000000",1)` | `"#ff000000"` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/geom/color.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(geom): canonical string colour helpers (T157)`

## Suivante
`T158-model-get-colour`
