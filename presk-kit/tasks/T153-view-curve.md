# T153-view-curve
**Phase** P9 · **Dépend de** : T152-model-image, T123-view-path-views · **Réf spec** : §11.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md`
- `architecture/decisions/ADR-017-view-layer-contract.md`

## Objectif
Dessiner `curve` avec la variante `draw`.

## Fichiers
- modifier : `core/src/view/pathViews.ts`
- modifier : `core/src/view/index.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T153.1 Enregistre `"curve"` avec `PathStrokeView` (T123) : il utilise déjà `object.def.paths.main.build(object)`, donc aucun code de dessin nouveau n'est nécessaire.
T153.2 Vérifie par `tsc`. **Contrôle humain** (BACKLOG) : une `curve` spline, puis `animate … reveal:"draw"`, se trace progressivement.

## Cas de test (à écrire AVANT le code)
Aucun test unitaire. Validation = `tsc` + test d'architecture.

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(view): curve view (T153)`

## Suivante
`T154-engine-warning-speed-path`
