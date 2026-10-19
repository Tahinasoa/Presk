# T097-delete-legacy-top-layers
**Phase** P5 · **Dépend de** : T096-app-main-and-examples · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-001-spec-is-truth-and-strangler-migration.md`
- `architecture/00-overview.md (§4 carte legacy → nouveau)`

## Objectif
Supprimer le point d'entrée, la façade, le registre, le rendu, le compilateur et le moteur de liaison legacy.

## Fichiers
- supprimer : `core/src/main.ts`
- supprimer : `core/src/presk.ts`
- supprimer : `core/src/registry/ (dossier)`
- supprimer : `core/src/renderer/ (dossier)`
- supprimer : `core/src/compiler/ (dossier)`
- supprimer : `core/src/binding/ (dossier)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T097.1 Vérifie d'abord qu'**aucun fichier hors de ces dossiers** n'importe l'un d'eux : `grep -rn "@/registry\|@/renderer\|@/compiler\|@/binding\|@/presk\|\./presk\|\./main" core/src --include=*.ts` en excluant les dossiers à supprimer. Si un fichier non legacy apparaît : `BLOCKED`.
T097.2 `git rm -r` des 6 éléments. Ne supprime **pas** `primitives/` ni `timer/` (T098).
T097.3 Lance `tsc --noEmit` : aucune erreur attendue.

## Cas de test (à écrire AVANT le code)
`vitest run` : le nombre de tests baisse (les tests legacy supprimés disparaissent) ; **aucun échec**. Note le nouveau total dans BACKLOG › Journal.

## Ne pas toucher
`core/src/primitives/`, `core/src/timer/`, `core/src/app/`, `core/src/model/`, etc.

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`chore(legacy): remove old compiler, binding, renderer, registry and entry (T097)`

## Suivante
`T098-delete-legacy-primitives-timer`
