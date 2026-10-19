# T012-lang-ease-names
**Phase** P1 · **Dépend de** : T011-lang-dsl-types · **Réf spec** : §6.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-lang-diagnostics.md (pour le code E_EASE_UNKNOWN)`

## Objectif
Exposer la liste des 31 noms d'easing et vérifier qu'elle est identique aux fonctions du dossier existant `timer/easing`.

## Fichiers
- créer : `core/src/lang/ease.ts`
- créer : `core/src/lang/ease.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T012.1 Écris `ease.test.ts` : importe `easings` depuis `@/timer/easing/easing` (seul import legacy autorisé) et vérifie `new Set(EASE_NAMES)` égal à `new Set(Object.keys(easings))`, `EASE_NAMES.length === 31`, et que chaque fonction vaut 0 en 0 et 1 en 1 (sauf `elastic*`/`back*`/`bounce*` : seulement 0 en 0 pour `*In`, 1 en 1 pour `*Out`, tolérance 1e-6).
T012.2 Crée `ease.ts` : `export const EASE_NAMES: readonly string[] = [...]` avec les 31 noms : `linear` + pour chaque famille `sine quad cubic quart quint expo circ back elastic bounce` les trois variantes `In`, `Out`, `InOut` (ex. `sineIn`, `sineOut`, `sineInOut`).
T012.3 Ajoute `export function isEaseName(s: unknown): s is string` (vrai si `s` est dans `EASE_NAMES`, comparaison exacte, sensible à la casse).

## Cas de test (à écrire AVANT le code)
`isEaseName("cubicInOut")` vrai ; `"CubicInOut"`, `"cubic"`, `""`, `3`, `"alternate"` faux.

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/ease.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): ease names guarded against timer/easing (T012)`

## Suivante
`T013-lang-start-parse`
