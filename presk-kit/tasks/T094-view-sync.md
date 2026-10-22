# T094-view-sync
**Phase** P5 · **Dépend de** : T092-view-rectangle-view, T093-view-text-view-and-measurer · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md`
- `architecture/decisions/ADR-017-view-layer-contract.md`

## Objectif
Synchroniser les vues avec le `World` après chaque `seek`.

## Fichiers
- créer : `core/src/view/viewSync.ts`
- créer : `core/src/view/index.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T094.1 `class ViewSync` : `constructor(world: World, registry: ViewRegistry, host: PixiHost)`. Champ `views: Map<string, ObjectView>`.
T094.2 `syncAll()` : pour chaque `o` de `world.all()` (ordre de création) : s'il n'a pas de vue, `registry.create(o, host)` ; si non nul, mémorise. Puis `update()` sur toutes les vues. Les vues sont ajoutées au host dans l'ordre de première création → l'ordre d'affichage suit l'ordre de création (Q1).
T094.3 `destroy()` : détruit toutes les vues et vide la table.
T094.4 `view/index.ts` : fonction `createDefaultViewRegistry(): ViewRegistry` qui enregistre les vues existantes (`registerRectangleView`, `registerTextView`) — chaque nouvelle vue ajoutera sa ligne.

## Cas de test (à écrire AVANT le code)
Pas de test unitaire (PixiJS a besoin d'un canvas). Validation = `tsc` + test d'architecture.

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
`feat(view): ViewSync and default registry (T094)`

## Suivante
`T095-app-presk-facade`
