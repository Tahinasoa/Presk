# T144-view-viewport
**Phase** P8 · **Dépend de** : T143-model-scene-view-refs, T094-view-sync · **Réf spec** : §3.5

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-016-scene-view-viewport.md`
- `architecture/decisions/ADR-017-view-layer-contract.md`
- `architecture/contracts/C-view-app.md`

## Objectif
Appliquer l'état de vue de `scene` au conteneur monde.

## Fichiers
- modifier : `core/src/view/viewSync.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T144.1 Dans `ViewSync.syncAll()` : après la mise à jour des vues, lit `root = world.root` ; `host.setViewport(root.getNumber("viewCx"), root.getNumber("viewCy"), root.getNumber("viewZoom"), root.getNumber("width"), root.getNumber("height"))`.
T144.2 Vérifie à la main (contrôle humain, à noter dans BACKLOG) : un document avec `animate scene {focusOn:"box"} duration 1` zoome sur l'objet.

## Cas de test (à écrire AVANT le code)
Aucun test unitaire. Validation = `tsc` + test d'architecture. Contrôle humain en BACKLOG.

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
`feat(view): apply scene viewport (T144)`

## Suivante
`T150-geom-curve-flatten`
