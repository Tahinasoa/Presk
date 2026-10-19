# T004-arch-lint-layers
**Phase** P0 · **Dépend de** : T003-types-node-for-tsc · **Réf spec** : ADR-003

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-003-layers-and-dependency-rules.md`
- `tasks/assets/T004/ (3 fichiers prêts à copier)`

## Objectif
Installer le test qui échoue si un fichier des nouveaux dossiers viole les règles de dépendance.

## Fichiers
- créer : `core/src/__arch__/rules.ts`
- créer : `core/src/__arch__/rules.test.ts`
- créer : `core/src/__arch__/layers.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T004.1 Copie **exactement** les 3 fichiers de `tasks/assets/T004/` du kit vers `core/src/__arch__/` (mêmes noms). Ne les modifie pas.
T004.2 Lance `pnpm exec vitest run src/__arch__` : 2 fichiers, 12 tests passés.
T004.3 À partir de maintenant, cette commande fait partie de la validation de **toutes** les tâches.

## Cas de test (à écrire AVANT le code)
`rules.test.ts` : 11 tests ; `layers.test.ts` : 1 test (aucun fichier des nouvelles couches n'existe encore, il passe).

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`test(arch): enforce layer dependency rules (T004)`

## Suivante
`T010-lang-diagnostics`
