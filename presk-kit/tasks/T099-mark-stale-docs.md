# T099-mark-stale-docs
**Phase** P5 · **Dépend de** : T098-delete-legacy-primitives-timer · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-001-spec-is-truth-and-strangler-migration.md`

## Objectif
Ajouter une bannière d'avertissement en tête des anciens `.md` (ils décrivent la v0.1).

## Fichiers
- modifier : `ARCHITECTURE.md`
- modifier : `architecture-guide.md`
- modifier : `core/architecture.md`
- modifier : `core/src/README.md`
- modifier : `core/src/compiler/README.md si présent (il a normalement été supprimé en T097)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T099.1 Pour chaque fichier **existant** de la liste, insère tout en haut (avant le titre) : `> ⚠️ PÉRIMÉ — décrit la v0.1 du moteur. Source de vérité : `language/Presk — Spécification v1.0.md`. Ne pas utiliser pour décider.` suivi d'une ligne vide.
T099.2 Ne modifie rien d'autre dans ces fichiers.

## Cas de test (à écrire AVANT le code)
`git diff --stat` : seulement des ajouts de 2 lignes par fichier.

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`docs: flag legacy documents as stale (T099)`

## Suivante
`T110-model-circle`
