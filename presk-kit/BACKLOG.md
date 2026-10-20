# BACKLOG — source de vérité de l'avancement

> Seul fichier du kit que les agents modifient (avec la section « Contrôles humains » pour l'humain).
> Mets à jour ce fichier **avant** de passer à la tâche suivante, jamais après.
> Statuts : `TODO` · `IN_PROGRESS` · `DONE` · `FAILED` · `BLOCKED` · `CANCELLED`.

## Reprise
- Tâche courante : T078-engine-sim-instant-actions (IN_PROGRESS)
- Dernière étape terminée : T078.5 — validation complète verte; tests ciblés 8/8, tsc propre, arch 12/12, suite 630/3 skipped
- Prochaine action : créer le commit exact de T078, puis noter son hash et marquer DONE
- État du code : T076/T077 validées; T078 implémentée et entièrement validée
- État du code : T075 validée; tests 11/11, tsc propre, arch 12/12, suite 612 passés et 3 skipped
- État du code : T074 validée; tests 8/8, tsc propre, arch 12/12, suite 601 passés et 3 skipped
- État du code : T073 validée; tests 7/7, tsc propre, arch 12/12, suite 593 passés et 3 skipped
- État du code : T072 validée; tests 7/7, tsc propre, arch 12/12, suite 586 passés et 3 skipped
- État du code : T071 validée; tests 7/7, tsc propre, arch 12/12, suite 579 passés et 3 skipped
- État du code : T070 validée; tests 13/13, tsc propre, arch 12/12, suite 572 passés et 3 skipped
- Branche git : presk-v1

## État des tâches
| ID | Phase | Statut | Dépend de | Suivante | Dernier commit |
|----|-------|--------|-----------|----------|----------------|
| T001-baseline-report-environment | P0 | DONE | — | T002-skip-obsolete-legacy-tests | - |
| T002-skip-obsolete-legacy-tests | P0 | DONE | T001 | T003-types-node-for-tsc | abc0470 |
| T003-types-node-for-tsc | P0 | DONE | T002 | T004-arch-lint-layers | 04488f9 |
| T004-arch-lint-layers | P0 | DONE | T003 | T010-lang-diagnostics | 0bfb04b |
| T010-lang-diagnostics | P1 | DONE | T004 | T011-lang-dsl-types | 2e7bb50 |
| T011-lang-dsl-types | P1 | DONE | T010 | T012-lang-ease-names | e742eb0 |
| T012-lang-ease-names | P1 | DONE | T011 | T013-lang-start-parse | ecd1d8d |
| T013-lang-start-parse | P1 | DONE | T010 | T014-lang-expr-tokenizer | afb9d64 |
| T014-lang-expr-tokenizer | P1 | DONE | T010 | T015-lang-expr-parser-arithmetic | a1054a2 |
| T015-lang-expr-parser-arithmetic | P1 | DONE | T014 | T016-lang-expr-parser-references | 2f44ece |
| T016-lang-expr-parser-references | P1 | DONE | T015 | T017-lang-validate-shell | 974dd36 |
| T017-lang-validate-shell | P1 | DONE | T010, T011 | T018-lang-validate-step-fields | 7f0f6c3 |
| T018-lang-validate-step-fields | P1 | DONE | T017 | T019-lang-validate-timing-values | de210c5 |
| T019-lang-validate-timing-values | P1 | DONE | T018, T012, T013 | T020-lang-validate-properties-shape | 10611c5 |
| T020-lang-validate-properties-shape | P1 | DONE | T018 | T021-lang-validate-document | 78ff38c |
| T021-lang-validate-document | P1 | DONE | T017, T018, T019, T020 | T030-geom-vec | 7cb6cfc |
| T030-geom-vec | P2 | DONE | T004 | T031-geom-matrix | cccb18d |
| T031-geom-matrix | P2 | DONE | T030 | T032-geom-bounds | 8864c30 |
| T032-geom-bounds | P2 | DONE | T031 | T033-geom-color | c1c64a4 |
| T033-geom-color | P2 | DONE | T030 | T034-geom-flat-path | 2231000 |
| T034-geom-flat-path | P2 | DONE | T030 | T035-geom-flatten-shapes | 1118c2e |
| T035-geom-flatten-shapes | P2 | DONE | T034 | T040-model-values-ports-effect-types | 941f738 |
| T040-model-values-ports-effect-types | P3 | DONE | T034, T010 | T041-model-scene-object | 9299d44 |
| T041-model-scene-object | P3 | DONE | T040, T031, T032 | T042-model-base-props | 3e165f0 |
| T042-model-base-props | P3 | DONE | T041 | T043-model-world | 03df63d |
| T043-model-world | P3 | DONE | T041 | T044-model-effects-reveal | 379e04c |
| T044-model-effects-reveal | P3 | DONE | T041, T040 | T045-model-rectangle-object | d022178 |
| T045-model-rectangle-object | P3 | DONE | T042, T044, T043 | T046-model-refs | 7d12a75 |
| T046-model-refs | P3 | DONE | T045 | T047-model-text-object | 57eab34 |
| T047-model-text-object | P3 | DONE | T045 | T048-model-scene-root | 495cf0d |
| T048-model-scene-root | P3 | DONE | T045 | T049-model-catalog | 2ed98d6 |
| T049-model-catalog | P3 | DONE | T047, T048 | T060-engine-program-types | eed9b05 |
| T060-engine-program-types | P4 | DONE | T049, T021 | T061-engine-analyze-expr | 4c609ab |
| T061-engine-analyze-expr | P4 | DONE | T060, T046, T016 | T062-engine-compile-expr | 18e898b |
| T062-engine-compile-expr | P4 | DONE | T061 | T063-engine-compile-value | 27548c4 |
| T063-engine-compile-value | P4 | DONE | T062, T033 | T064-engine-compile-properties | 9207b49 |
| T064-engine-compile-properties | P4 | DONE | T063, T044 | T065-engine-compile-create | 2a2e564 |
| T065-engine-compile-create | P4 | DONE | T064, T049 | T066-engine-pass-progress | ba5aaa5 |
| T066-engine-pass-progress | P4 | DONE | T012, T010 | T067-engine-compile-steps | c424625 |
| T067-engine-compile-steps | P4 | DONE | T065, T013, T066 | T068-engine-plan-timeline | bb5fdac |
| T068-engine-plan-timeline | P4 | DONE | T067, T066 | T069-engine-analyze-effects | 2e2fbc8 |
| T069-engine-analyze-effects | P4 | DONE | T068, T064 | T070-engine-analyze-activity | c83672d |
| T070-engine-analyze-activity | P4 | DONE | T068, T069 | T071-engine-compile-program | 1a95d32 |
| T071-engine-compile-program | P4 | DONE | T065, T067, T068, T069, T070, T021 | T072-engine-sim-build-world | c1ff049 |
| T072-engine-sim-build-world | P4 | DONE | T071 | T073-engine-sim-ticks | b54e54d |
| T073-engine-sim-ticks | P4 | DONE | T071 | T074-engine-sim-context-ownership | fbd1f60 |
| T074-engine-sim-context-ownership | P4 | DONE | T071 | T075-engine-mech-animate | 062b968 |
| T075-engine-mech-animate | P4 | DONE | T074, T066, T033 | T076-engine-mech-bind | 9a32bd4 |
| T076-engine-mech-bind | P4 | DONE | T075 | T077-engine-mech-effect | 7c28cb0 |
| T077-engine-mech-effect | P4 | DONE | T075, T044 | T078-engine-sim-instant-actions | 34c61bd |
| T078-engine-sim-instant-actions | P4 | IN_PROGRESS | T074, T075 | T079-engine-simulation | - |
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

2026-10-19 | T068 | DONE | commit 2e2fbc8 | planificateur et pipeline de test validés; commit présent dans l’historique Git
2026-10-19 | T069 | DONE | commit c83672d | résolution des variantes d’effet; tsc, architecture et suite complète validés
2026-10-19 | T070 | BLOCKED | sans commit | cas de test contradictoire avec le start séquentiel de T068; 12/13 tests passent
2026-10-19 | T070 | DONE | commit 1a95d32 | analyse stop/unbind; tests 13/13, tsc, arch 12/12, suite 572/3 skipped
2026-10-19 | T071 | DONE | commit c1ff049 | orchestrateur; tests 7/7, tsc, arch 12/12, suite 579/3 skipped
2026-10-19 | T072 | DONE | commit b54e54d | buildWorld; tests 7/7, tsc, arch 12/12, suite 586/3 skipped
2026-10-19 | T073 | DONE | commit fbd1f60 | tickTimes; tests 7/7, tsc, arch 12/12, suite 593/3 skipped
2026-10-19 | T074 | DONE | commit 062b968 | Ownership/SimContext; tests 8/8, tsc, arch 12/12, suite 601/3 skipped
2026-10-19 | T075 | DONE | commit 9a32bd4 | animate/interpolation; tests 11/11, tsc, arch 12/12, suite 612/3 skipped
2026-10-20 | T076 | DONE | commit 7c28cb0 | revalidation après interruption; bind tests 6/6, tsc propre, arch 12/12, suite 618/3 skipped
2026-10-20 | T077 | DONE | commit 34c61bd | mécanisme d’effet et propriété `@effect`; tests 4/4, tsc, arch 12/12, suite 622/3 skipped

2026-10-19 | T001 | BLOCKED | sans commit | git status contient des suppressions suivies dans agent/ et presk_kit/ non suivi; arrêt avant baseline
2026-10-19 | T001 | BLOCKED | sans commit | baseline conforme : 184 tests passés, 3 échoués (compiler.test.ts ×2, kobject.test.ts ×1); tsc : 2 erreurs (kobject.test.ts `create`, ktimer.live.ts `process`); `vitest run src/__arch__` : aucun test trouvé
2026-10-19 | T001 | DONE | sans commit | baseline acceptée selon T001.4 : 184 passés, 3 échoués; tsc 2 erreurs attendues; aucun code modifié
2026-10-19 | T002 | DONE | commit abc0470 | 184 tests passés, 3 skipped, 0 échec; `tsc` erreur `process` restante (T003); aucun test `src/__arch__` trouvé (T004)
2026-10-19 | T003 | DONE | commit 04488f9 | tsc 0 erreur; suite 184 passés, 3 skipped; arch guard non présent avant T004
2026-10-19 | T004 | DONE | commit 0bfb04b | tests arch 12/12; tsc propre; suite 196 passés, 3 skipped
2026-10-19 | T010 | DONE | commit 2e7bb50 | diagnostics 7/7; arch 12/12; tsc propre; suite 203 passés, 3 skipped
2026-10-19 | T011 | DONE | commit e742eb0 | tests types 2/2; arch 12/12; tsc propre; suite 205 passés, 3 skipped
2026-10-19 | T012 | DONE | commit ecd1d8d | easing tests 3/3; arch 12/12; tsc propre; suite 208 passés, 3 skipped
2026-10-19 | T013 | DONE | commit afb9d64 | start tests 32/32; arch 12/12; tsc propre; suite 240 passés, 3 skipped
2026-10-19 | T014 | DONE | commit a1054a2 | tokenizer tests 8/8; arch 12/12; tsc propre; suite 248 passés, 3 skipped
2026-10-19 | T015 | DONE | commit 2f44ece | parser tests 13/13; arch 12/12; tsc propre; suite 261 passés, 3 skipped
2026-10-19 | T016 | DONE | commit 974dd36 | parser tests 30/30; arch 12/12; tsc propre; suite 278 passés, 3 skipped
2026-10-19 | T017 | DONE | commit 7f0f6c3 | shell tests 16/16; arch 12/12; tsc propre; suite 294 passés, 3 skipped
2026-10-19 | T018 | DONE | commit de210c5 | step fields tests 24/24; arch 12/12; tsc propre; suite 318 passés, 3 skipped
2026-10-19 | T019 | DONE | commit 10611c5 | timing tests 21/21; arch 12/12; tsc propre; suite 339 passés, 3 skipped
2026-10-19 | T020 | DONE | commit 78ff38c | properties tests 21/21; arch 12/12; tsc propre; suite 360 passés, 3 skipped
2026-10-19 | T021 | DONE | commit 7cb6cfc | document tests 7/7; arch 12/12; tsc propre; suite 367 passés, 3 skipped
2026-10-19 | T030 | DONE | commit cccb18d | vec tests 7/7; arch 12/12; tsc propre; suite 374 passés, 3 skipped
2026-10-19 | T031 | DONE | commit 8864c30 | matrix tests 10/10; arch 12/12; tsc propre; suite 384 passés, 3 skipped
2026-10-19 | T032 | DONE | commit c1c64a4 | bounds tests 5/5; arch 12/12; tsc propre; suite 389 passés, 3 skipped
2026-10-19 | T033 | DONE | commit 2231000 | color tests 13/13; arch 12/12; tsc propre; suite 402 passés, 3 skipped
2026-10-19 | T034 | DONE | commit 1118c2e | FlatPath tests 6/6; arch 12/12; tsc propre; suite 408 passés, 3 skipped
2026-10-19 | T035 | DONE | commit 941f738 | flatten tests 9/9; arch 12/12; tsc propre; suite 411 passés, 3 skipped
2026-10-19 | T040 | BLOCKED | sans commit | `ClassDef.refExtension` référence `RefSegment` et `RefDescription` sans définition ni import indiqué; arrêt selon §4
2026-10-19 | T040 | DONE | commit 9299d44 | ports 3/3; arch 12/12; tsc propre; suite 414 passés, 3 skipped
2026-10-19 | T041 | DONE | commit 3e165f0 | SceneObject tests 9/9; arch 12/12; tsc propre; suite 423 passés, 3 skipped
2026-10-19 | T042 | DONE | commit 03df63d | baseProps tests 4/4; arch 12/12; tsc propre; suite 427 passés, 3 skipped
2026-10-19 | T043 | BLOCKED | sans commit | T043.1 exige `model/testing.ts`, absent de la liste autorisée « Fichiers »; arrêt selon §4
2026-10-19 | T043 | DONE | commit 379e04c | World tests 7/7; arch 12/12; tsc propre; suite 434 passés, 3 skipped
2026-10-19 | T044 | DONE | commit d022178 | effects tests 3/3; arch 12/12; tsc propre; suite 437 passés, 3 skipped
2026-10-19 | T045 | DONE | commit 7d12a75 | rectangle tests 5/5; arch 12/12; tsc propre; suite 442 passés, 3 skipped
2026-10-19 | T046 | DONE | commit 57eab34 | refs tests 9/9; arch 12/12; tsc propre; suite 451 passés, 3 skipped
2026-10-19 | T047 | DONE | commit 495cf0d | TextObject tests 3/3; arch 12/12; tsc propre; suite 454 passés, 3 skipped
2026-10-19 | T048 | BLOCKED | sans commit | la fiche demande `classes/sceneRoot.ts`, le contrat `classes/scene.md` indique `classes/sceneObject.ts`; arrêt selon §4
2026-10-19 | T048 | DONE | commit 2ed98d6 | scene root tests 5/5; arch 12/12; tsc propre; suite 459 passés, 3 skipped
2026-10-19 | T049 | DONE | commit eed9b05 | catalog tests 2/2; arch 12/12; tsc propre; suite 461 passés, 3 skipped
2026-10-19 | T060 | DONE | commit 4c609ab | program/scope tests 3/3; arch 12/12; tsc propre; suite 464 passés, 3 skipped
2026-10-19 | T061 | DONE | commit 18e898b | expression analysis tests 15/15; arch 12/12; tsc propre; suite 479 passés, 3 skipped
2026-10-19 | T062 | DONE | commit 27548c4 | expression evaluation tests 11/11; arch 12/12; tsc propre; suite 490 passés, 3 skipped
2026-10-19 | T063 | DONE | commit 9207b49 | value compilation tests 7/7; arch 12/12; tsc propre; suite 497 passés, 3 skipped
2026-10-19 | T064 | DONE | commit 2a2e564 | properties tests 8/8; arch 12/12; tsc propre; suite 505 passés, 3 skipped
2026-10-19 | T065 | DONE | commit ba5aaa5 | create compilation tests 9/9; arch 12/12; tsc propre; suite 514 passés, 3 skipped
2026-10-19 | T066 | DONE | commit c424625 | passProgress tests 17/17; arch 12/12; tsc propre; suite 531 passés, 3 skipped
2026-10-19 | T067 | DONE | commit bb5fdac | steps compilation tests 8/8; arch 12/12; tsc propre; suite 539 passés, 3 skipped

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
