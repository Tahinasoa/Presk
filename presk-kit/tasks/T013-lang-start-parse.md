# T013-lang-start-parse
**Phase** P1 · **Dépend de** : T010-lang-diagnostics · **Réf spec** : §6.1

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-lang-start.md`
- `architecture/decisions/ADR-009-timeline-planning.md`

## Objectif
Implémenter `parseStart` qui transforme la valeur du champ `start` en `StartSpec`.

## Fichiers
- créer : `core/src/lang/start.ts`
- créer : `core/src/lang/start.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T013.1 Écris `start.test.ts` : **une ligne de test par ligne** de la table de vérité de `C-lang-start.md` (utilise `it.each`).
T013.2 Crée `start.ts` avec `StartSpec`, `DEFAULT_START`, `parseStart`. Algorithme : si `typeof value === "number"` → absolute si `Number.isFinite`, sinon `null`. Si ce n'est pas une chaîne → `null`. Sinon essaie dans l'ordre les regex : `^-?\d+(\.\d+)?$` (absolute) ; `^([<>])(-?\d+(\.\d+)?)?$` (prevStart/prevEnd, offset 0 si absent) ; `^([A-Za-z_][A-Za-z0-9_]*)(?:([<>])(-?\d+(\.\d+)?))?$` (labelStart si pas d'opérateur ou `<`, labelEnd si `>`). Aucune correspondance → `null`.

## Cas de test (à écrire AVANT le code)
Table de `C-lang-start.md` (toutes les lignes). Cas piège : `"3."` et `".5"` → `null` ; `"-1"` → absolute −1 ; `"a<"` → `null` ; `"<<"` → `null`.

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/start.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): parseStart (T013)`

## Suivante
`T014-lang-expr-tokenizer`
