# ADR-001-spec-is-truth-and-strangler-migration
**La spec est la vérité ; migration par étranglement** · Réf spec : §1, §12

## Contexte
Le code existant est une v0.1 du langage. Ses commentaires et README sont périmés. Les agents peuvent être coupés à tout moment.

## Décision
1. Autorité : spec v1.0 > fichiers du kit > code > tout autre `.md` / commentaire (jamais utilisés pour trancher).
2. Le nouveau pipeline est construit dans **de nouveaux dossiers** (`lang/ geom/ model/ engine/ view/ app/`). Le legacy (`primitives/ binding/ compiler/ timer/(sauf easing) renderer/ registry/ presk.ts main.ts`) est **gelé** : aucune tâche ne le modifie avant la bascule (P5), à part T002/T003.
3. Le dépôt reste **vert** (tsc + tests) à la fin de chaque tâche. La démo legacy fonctionne jusqu'à la bascule.
4. La bascule (P5) remplace `main.ts`, puis supprime le legacy en tâches séparées.
5. Un écart spec/code est toujours tranché dans une ADR ou une tâche, jamais laissé implicite. Spec silencieuse : voir `open-questions.md` (choix de l'architecte, à valider par l'humain).

## Alternatives écartées
- Refactor en place : casse les anciens tests en cascade, dépôt rouge pendant des dizaines de tâches ; trop risqué avec des agents interrompus.
- Réécriture totale hors dépôt : perd l'historique et les assets réutilisables.

## Conséquences
Duplication temporaire (acceptée). Les nouveaux modules n'importent **jamais** le legacy, sauf `@/timer/easing/easing`.
