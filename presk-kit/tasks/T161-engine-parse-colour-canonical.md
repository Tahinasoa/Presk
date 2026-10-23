# T161-engine-parse-colour-canonical
**Phase** P10 · **Dépend de** : T160-model-colour-getters-and-interpolate · **Réf spec** : §11.3 (extension : alpha, Q24)

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-021-colours-canonical-strings-with-alpha.md`
- `architecture/contracts/C-geom-color-v2.md`
- `architecture/decisions/ADR-018-testing-strategy.md`

## Objectif
Basculer `parseColor`/`lerpColor` sur le format canonique et verrouiller le comportement de bout en bout (animation d'une couleur, alpha).

## Fichiers
- modifier : `core/src/geom/color.ts`
- modifier : `core/src/geom/color.test.ts`
- modifier : `core/src/model/sceneObject.ts`
- modifier : `core/src/engine/sim/interpolate.ts`
- modifier : `core/src/engine/compile/value.ts (seulement si un type ou un cast l'exige)`
- modifier : `core/src/engine/compile/value.test.ts`
- créer : `core/src/engine/golden/colors.golden.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T161.1 Écris d'abord le test doré `colors.golden.test.ts` (cas ci-dessous) : même helper `run(doc, t)` que dans `core.golden.test.ts`.
T161.2 Dans `color.ts` : **supprime** l'ancienne `parseColor` (numérique) et l'ancienne `lerpColor` ; **renomme** `parseColorCanonical` → `parseColor` et `lerpColorCanonical` → `lerpColor`. Signatures finales : `parseColor(input: unknown): string | null` et `lerpColor(a: string, b: string, t: number): string`. `parseColor` **accepte toujours en entrée un entier JSON 0..0xFFFFFF** (une couleur donnée en nombre dans un document), mais renvoie toujours une chaîne.
T161.3 Mets à jour **tous les appelants** : `sceneObject.ts` (`getColor`), `interpolate.ts`, `value.ts`. Dans `value.ts`, la branche `color` renvoie la **chaîne** produite par `parseColor` (le type `StateValue` contient déjà `string` : normalement aucune modification de type n'est nécessaire ; vérifie qu'aucun cast `as number` ne subsiste).
T161.4 Adapte les attendus de `color.test.ts` (anciens attendus numériques → chaînes canoniques ; garde **tous** les cas d'entrée) et de `value.test.ts` (`fill`, `"#f00"` → `"#ff0000"`, `"blue"` → `"#0000ff"`, `65280` → `"#00ff00"`).
T161.5 Lance toute la validation : l'état par défaut des classes est encore un nombre ; `getColor` le convertit, donc tout doit rester vert.

## Cas de test (à écrire AVANT le code)
Tests dorés (`colors.golden.test.ts`) :
| # | document | instant | attendu |
|---|---|---|---|
| C1 | `rectangle a {}` ; `animate a {fill:"#ff0000"} duration 1 ease linear` | 0 ; 0.5 ; 1 | `readProp("fill")` : `"#9c9c9c"` ; `"#ce4e4e"` ; `"#ff0000"` |
| C2 | `rectangle a {fill:"#ff000080"}` | 0 | `readProp("fill")` = `"#ff000080"` |
| C3 | `rectangle a {}` ; `animate a {fill:"#ff000000"} duration 1 linear` | 0.5 | `"#ce4e4e80"` (alpha 255 → 0 à mi-course = 128) |
| C4 | `rectangle a {fill:"nope"}` | compilation | `E_COLOR_INVALID` |
| C5 | `rectangle a {fill:"blue"}` ; `set a {fill:"#F00"}` à start 1 | 1 | `"#ff0000"` (normalisé) |
| C6 | `text t {color:"red"}` | 0 | `readProp("color")` = `"#ff0000"` |
| C7 | `rectangle a {fill:65280}` (entier JSON) | 0 | `"#00ff00"` |
| C8 | `animate` d'une couleur : aucune valeur ne contient `NaN` ni `undefined` à 0,25 ; 0,5 ; 0,75 | | chaînes valides (`COLOR_STRING_RE`) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/geom/color.test.ts src/engine/compile/value.test.ts src/engine/golden/colors.golden.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat: canonical string colours with alpha (T161)`

## Suivante
`T162-model-string-colour-defaults`
