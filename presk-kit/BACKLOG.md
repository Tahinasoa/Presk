# BACKLOG — source de vérité de l'avancement

> Seul fichier du kit que les agents modifient (avec la section « Contrôles humains » pour l'humain).
> Mets à jour ce fichier **avant** de passer à la tâche suivante, jamais après.
> Statuts : `TODO` · `IN_PROGRESS` · `DONE` · `FAILED` · `BLOCKED` · `CANCELLED`.

## Reprise
- Tâche courante : T002-skip-obsolete-legacy-tests (DONE)
- Dernière étape terminée : T002.1–T002.4, validations propres à la tâche et commit `a81af28` terminés
- Prochaine action : démarrer T003 (dépendance T002 satisfaite)
- État du code : suite complète 184 passés/3 skipped/0 échec; tsc garde l’erreur `process` prévue pour T003; garde-fou arch prévu pour T004
- Branche git : presk-v1

## État des tâches
| ID | Phase | Statut | Dépend de | Suivante | Dernier commit |
|----|-------|--------|-----------|----------|----------------|
| T001-baseline-report-environment | P0 | DONE | — | T002-skip-obsolete-legacy-tests | - |
| T002-skip-obsolete-legacy-tests | P0 | DONE | T001 | T003-types-node-for-tsc | a81af28 |
| T003-types-node-for-tsc | P0 | TODO | T002 | T004-arch-lint-layers | - |
| T004-arch-lint-layers | P0 | TODO | T003 | T010-lang-diagnostics | - |
| T010-lang-diagnostics | P1 | TODO | T004 | T011-lang-dsl-types | - |
| T011-lang-dsl-types | P1 | TODO | T010 | T012-lang-ease-names | - |
| T012-lang-ease-names | P1 | TODO | T011 | T013-lang-start-parse | - |
| T013-lang-start-parse | P1 | TODO | T010 | T014-lang-expr-tokenizer | - |
| T014-lang-expr-tokenizer | P1 | TODO | T010 | T015-lang-expr-parser-arithmetic | - |
| T015-lang-expr-parser-arithmetic | P1 | TODO | T014 | T016-lang-expr-parser-references | - |
| T016-lang-expr-parser-references | P1 | TODO | T015 | T017-lang-validate-shell | - |
| T017-lang-validate-shell | P1 | TODO | T010, T011 | T018-lang-validate-step-fields | - |
| T018-lang-validate-step-fields | P1 | TODO | T017 | T019-lang-validate-timing-values | - |
| T019-lang-validate-timing-values | P1 | TODO | T018, T012, T013 | T020-lang-validate-properties-shape | - |
| T020-lang-validate-properties-shape | P1 | TODO | T018 | T021-lang-validate-document | - |
| T021-lang-validate-document | P1 | TODO | T017, T018, T019, T020 | T030-geom-vec | - |
| T030-geom-vec | P2 | TODO | T004 | T031-geom-matrix | - |
| T031-geom-matrix | P2 | TODO | T030 | T032-geom-bounds | - |
| T032-geom-bounds | P2 | TODO | T031 | T033-geom-color | - |
| T033-geom-color | P2 | TODO | T030 | T034-geom-flat-path | - |
| T034-geom-flat-path | P2 | TODO | T030 | T035-geom-flatten-shapes | - |
| T035-geom-flatten-shapes | P2 | TODO | T034 | T040-model-values-ports-effect-types | - |
| T040-model-values-ports-effect-types | P3 | TODO | T034, T010 | T041-model-scene-object | - |
| T041-model-scene-object | P3 | TODO | T040, T031, T032 | T042-model-base-props | - |
| T042-model-base-props | P3 | TODO | T041 | T043-model-world | - |
| T043-model-world | P3 | TODO | T041 | T044-model-effects-reveal | - |
| T044-model-effects-reveal | P3 | TODO | T041, T040 | T045-model-rectangle-object | - |
| T045-model-rectangle-object | P3 | TODO | T042, T044, T043 | T046-model-refs | - |
| T046-model-refs | P3 | TODO | T045 | T047-model-text-object | - |
| T047-model-text-object | P3 | TODO | T045 | T048-model-scene-root | - |
| T048-model-scene-root | P3 | TODO | T045 | T049-model-catalog | - |
| T049-model-catalog | P3 | TODO | T047, T048 | T060-engine-program-types | - |
| T060-engine-program-types | P4 | TODO | T049, T021 | T061-engine-analyze-expr | - |
| T061-engine-analyze-expr | P4 | TODO | T060, T046, T016 | T062-engine-compile-expr | - |
| T062-engine-compile-expr | P4 | TODO | T061 | T063-engine-compile-value | - |
| T063-engine-compile-value | P4 | TODO | T062, T033 | T064-engine-compile-properties | - |
| T064-engine-compile-properties | P4 | TODO | T063, T044 | T065-engine-compile-create | - |
| T065-engine-compile-create | P4 | TODO | T064, T049 | T066-engine-pass-progress | - |
| T066-engine-pass-progress | P4 | TODO | T012, T010 | T067-engine-compile-steps | - |
| T067-engine-compile-steps | P4 | TODO | T065, T013, T066 | T068-engine-plan-timeline | - |
| T068-engine-plan-timeline | P4 | TODO | T067, T066 | T069-engine-analyze-effects | - |
| T069-engine-analyze-effects | P4 | TODO | T068, T064 | T070-engine-analyze-activity | - |
| T070-engine-analyze-activity | P4 | TODO | T068, T069 | T071-engine-compile-program | - |
| T071-engine-compile-program | P4 | TODO | T065, T067, T068, T069, T070, T021 | T072-engine-sim-build-world | - |
| T072-engine-sim-build-world | P4 | TODO | T071 | T073-engine-sim-ticks | - |
| T073-engine-sim-ticks | P4 | TODO | T071 | T074-engine-sim-context-ownership | - |
| T074-engine-sim-context-ownership | P4 | TODO | T071 | T075-engine-mech-animate | - |
| T075-engine-mech-animate | P4 | TODO | T074, T066, T033 | T076-engine-mech-bind | - |
| T076-engine-mech-bind | P4 | TODO | T075 | T077-engine-mech-effect | - |
| T077-engine-mech-effect | P4 | TODO | T075, T044 | T078-engine-sim-instant-actions | - |
| T078-engine-sim-instant-actions | P4 | TODO | T074, T075 | T079-engine-simulation | - |
| T079-engine-simulation | P4 | TODO | T072, T073, T075, T076, T077, T078 | T080-engine-golden-core | - |
| T080-engine-golden-core | P4 | TODO | T079 | T090-view-pixi-host | - |
| T090-view-pixi-host | P5 | TODO | T080 | T091-view-object-view-registry | - |
| T091-view-object-view-registry | P5 | TODO | T090 | T092-view-rectangle-view | - |
| T092-view-rectangle-view | P5 | TODO | T091 | T093-view-text-view-and-measurer | - |
| T093-view-text-view-and-measurer | P5 | TODO | T091, T047 | T094-view-sync | - |
| T094-view-sync | P5 | TODO | T092, T093 | T095-app-presk-facade | - |
| T095-app-presk-facade | P5 | TODO | T094, T079 | T096-app-main-and-examples | - |
| T096-app-main-and-examples | P5 | TODO | T095 | T097-delete-legacy-top-layers | - |
| T097-delete-legacy-top-layers | P5 | TODO | T096 | T098-delete-legacy-primitives-timer | - |
| T098-delete-legacy-primitives-timer | P5 | TODO | T097 | T099-mark-stale-docs | - |
| T099-mark-stale-docs | P5 | TODO | T098 | T110-model-circle | - |
| T110-model-circle | P6 | TODO | T049 | T111-model-ellipse | - |
| T111-model-ellipse | P6 | TODO | T110 | T112-engine-expr-pathfn | - |
| T112-engine-expr-pathfn | P6 | TODO | T110, T062, T061 | T113-engine-compile-travel | - |
| T113-engine-compile-travel | P6 | TODO | T112, T067 | T114-engine-travel-resolver | - |
| T114-engine-travel-resolver | P6 | TODO | T113, T068, T070, T072 | T115-engine-mech-travel | - |
| T115-engine-mech-travel | P6 | TODO | T114, T079 | T116-engine-golden-travel | - |
| T116-engine-golden-travel | P6 | TODO | T115 | T117-model-segment-arrow | - |
| T117-model-segment-arrow | P6 | TODO | T116 | T118-model-polygon-triangle | - |
| T118-model-polygon-triangle | P6 | TODO | T117 | T119-model-polyline | - |
| T119-model-polyline | P6 | TODO | T118 | T120-model-arc | - |
| T120-model-arc | P6 | TODO | T119 | T121-model-point-ray-line | - |
| T121-model-point-ray-line | P6 | TODO | T120 | T122-view-circle-ellipse | - |
| T122-view-circle-ellipse | P6 | TODO | T121, T094 | T123-view-path-views | - |
| T123-view-path-views | P6 | TODO | T122 | T124-view-polygon-views | - |
| T124-view-polygon-views | P6 | TODO | T123 | T125-engine-golden-shapes | - |
| T125-engine-golden-shapes | P6 | TODO | T124, T116 | T130-model-group-object | - |
| T130-model-group-object | P7 | TODO | T125 | T131-engine-compile-group | - |
| T131-engine-compile-group | P7 | TODO | T130, T114 | T132-engine-group-reparent | - |
| T132-engine-group-reparent | P7 | TODO | T130 | T133-engine-group-layout | - |
| T133-engine-group-layout | P7 | TODO | T130 | T134-engine-sim-group-actions | - |
| T134-engine-sim-group-actions | P7 | TODO | T131, T132, T133, T079 | T135-engine-golden-groups | - |
| T135-engine-golden-groups | P7 | TODO | T134 | T140-model-scene-view-state | - |
| T140-model-scene-view-state | P8 | TODO | T135 | T141-engine-compile-scene-view | - |
| T141-engine-compile-scene-view | P8 | TODO | T140, T064, T063 | T142-engine-scene-view-runtime | - |
| T142-engine-scene-view-runtime | P8 | TODO | T141, T079 | T143-model-scene-view-refs | - |
| T143-model-scene-view-refs | P8 | TODO | T142 | T144-view-viewport | - |
| T144-view-viewport | P8 | TODO | T143, T094 | T150-geom-curve-flatten | - |
| T150-geom-curve-flatten | P9 | TODO | T144 | T151-model-curve | - |
| T151-model-curve | P9 | TODO | T150, T119 | T152-model-image | - |
| T152-model-image | P9 | TODO | T151, T095 | T153-view-curve | - |
| T153-view-curve | P9 | TODO | T152, T123 | T154-engine-warning-speed-path | - |
| T154-engine-warning-speed-path | P9 | TODO | T153, T114 | T155-move-easing-to-lang | - |
| T155-move-easing-to-lang | P9 | TODO | T154 | T156-final-audit | - |
| T156-final-audit | P9 | TODO | T155 | — | - |

## Phases
- **P0** : Base verte + garde-fou
- **P1** : lang/
- **P2** : geom/
- **P3** : model/
- **P4** : engine/ (compilation + simulation)
- **P5** : view/ + app/ + bascule + suppression du legacy
- **P6** : chemins, travel, formes
- **P7** : groupes et layouts
- **P8** : vue de la scène
- **P9** : curve, image, finitions

## Journal
(une ligne par événement : `AAAA-MM-JJ | Txxx | DONE/FAILED/BLOCKED | commit abc1234 | remarque`)

2026-10-19 | T001 | BLOCKED | sans commit | git status contient des suppressions suivies dans agent/ et presk_kit/ non suivi; arrêt avant baseline
2026-10-19 | T001 | BLOCKED | sans commit | baseline conforme : 184 tests passés, 3 échoués (compiler.test.ts ×2, kobject.test.ts ×1); tsc : 2 erreurs (kobject.test.ts `create`, ktimer.live.ts `process`); `vitest run src/__arch__` : aucun test trouvé
2026-10-19 | T001 | DONE | sans commit | baseline acceptée selon T001.4 : 184 passés, 3 échoués; tsc 2 erreurs attendues; aucun code modifié
2026-10-19 | T002 | DONE | commit a81af28 | 184 tests passés, 3 skipped, 0 échec; `tsc` erreur `process` restante (T003); aucun test `src/__arch__` trouvé (T004)

## Questions pour l'architecte
(format : `Txxx | question précise | ce que tu as lu | options que tu vois`)

T001 | La baseline correspond à T001.4 (184 passés, 3 échoués, 2 erreurs tsc), mais la section Validation exige zéro échec et zéro erreur; `vitest run src/__arch__` ne trouve aucun test. La tâche doit-elle être DONE avec la baseline attendue malgré ces critères, ou BLOCKED jusqu’à clarification ? | fiche T001 : résultats attendus aux étapes T001.3–T001.4; section Validation : tsc et tous les tests doivent passer, dont `src/__arch__`; exécution : chiffres attendus reproduits et aucun test arch détecté | considérer les échecs/types annoncés comme base acceptée et l’arch guard absent comme non applicable, ou exiger une validation verte avant DONE

T001 | Quel est l’état attendu des suppressions de agent/ et de l’ajout de presk_kit/ visibles dans git status, et peux-tu fournir un arbre propre pour reprendre T001.1 ? | agent.md et T001 exigent git status propre avant branche/tests; status montre de nombreux D agent/** et ?? presk_kit/; essai git switch -c presk-v1 a échoué avec Permission denied sur .git/refs/heads/presk-v1.lock | conserver ces changements et les committer, ou restaurer la suppression/annuler le déplacement puis retenter

## Contrôles humains
(à faire par l'humain, jamais par l'agent)
- [ ] Après T096 : `pnpm dev`, la démo HELLO s'affiche et se contrôle (play/pause/curseur).
- [ ] Après P6 : un `travel` sur un cercle donne un mouvement circulaire régulier.
- [ ] Après T144 : `focusOn` zoome bien sur l'objet.
- [ ] Après T153 : `reveal:"draw"` sur une `curve` se trace progressivement.
- [ ] Relire `architecture/open-questions.md` (Q1–Q23) et valider ou corriger les choix.
