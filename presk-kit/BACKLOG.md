# BACKLOG — source de vérité de l'avancement

> Seul fichier du kit que les agents modifient (avec la section « Contrôles humains » pour l'humain).
> Mets à jour ce fichier **avant** de passer à la tâche suivante, jamais après.
> Statuts : `TODO` · `IN_PROGRESS` · `DONE` · `FAILED` · `BLOCKED` · `CANCELLED`.

## Reprise
- Tâche courante : TERMINÉ
- Dernière étape terminée : T163 DONE (commit e7bf21e) ; plus aucune tâche TODO
- Prochaine action : contrôles humains P10 (voir « Contrôles humains ») ; rien à faire côté agent
- État du code : sain (tsc 0 erreur, arch 12/12, suite 736/736)
- Branche git : presk-v1 (dépôt initialisé depuis l'archive ; presk-kit/ exclu via .git/info/exclude)

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
| T078-engine-sim-instant-actions | P4 | DONE | T074, T075 | T079-engine-simulation | 8f36433 |
| T079-engine-simulation | P4 | DONE | T072, T073, T075, T076, T077, T078 | T080-engine-golden-core | 5731ec6 |
| T080-engine-golden-core | P4 | DONE | T079 | T090-view-pixi-host | 23547bd |
| T090-view-pixi-host | P5 | DONE | T080 | T091-view-object-view-registry | bb2d077 |
| T091-view-object-view-registry | P5 | DONE | T090 | T092-view-rectangle-view | e81accb |
| T092-view-rectangle-view | P5 | DONE | T091 | T093-view-text-view-and-measurer | d219b0f |
| T093-view-text-view-and-measurer | P5 | DONE | T091, T047 | T094-view-sync | c4a6b8d |
| T094-view-sync | P5 | DONE | T092, T093 | T095-app-presk-facade | 4649d5a |
| T095-app-presk-facade | P5 | DONE | T094, T079 | T096-app-main-and-examples | 8a2db49 |
| T096-app-main-and-examples | P5 | DONE | T095 | T097-delete-legacy-top-layers | 7276578 |
| T097-delete-legacy-top-layers | P5 | DONE | T096 | T098-delete-legacy-primitives-timer | 05e5e57 |
| T098-delete-legacy-primitives-timer | P5 | DONE | T097 | T099-mark-stale-docs | 05e5e57 |
| T099-mark-stale-docs | P5 | DONE | T098 | T110-model-circle | aa3d466 |
| T110-model-circle | P6 | DONE | T049 | T111-model-ellipse | cab6aee |
| T111-model-ellipse | P6 | DONE | T110 | T112-engine-expr-pathfn | 9c7ccb8 |
| T112-engine-expr-pathfn | P6 | DONE | T110, T062, T061 | T113-engine-compile-travel | ba59ff9 |
| T113-engine-compile-travel | P6 | DONE | T112, T067 | T114-engine-travel-resolver | 633f255 |
| T114-engine-travel-resolver | P6 | DONE | T113, T068, T070, T072 | T115-engine-mech-travel | fdc32c6 |
| T115-engine-mech-travel | P6 | DONE | T114, T079 | T116-engine-golden-travel | 8403a2c |
| T116-engine-golden-travel | P6 | DONE | T115 | T117-model-segment-arrow | 279b07c |
| T117-model-segment-arrow | P6 | DONE | T116 | T118-model-polygon-triangle | 5d3ad4c |
| T118-model-polygon-triangle | P6 | DONE | T117 | T119-model-polyline | dc771bb |
| T119-model-polyline | P6 | DONE | T118 | T120-model-arc | c0d3f02 |
| T120-model-arc | P6 | DONE | T119 | T121-model-point-ray-line | 41369c0 |
| T121-model-point-ray-line | P6 | DONE | T120 | T122-view-circle-ellipse | ec87bd9 |
| T122-view-circle-ellipse | P6 | DONE | T121, T094 | T123-view-path-views | dd47373 |
| T123-view-path-views | P6 | DONE | T122 | T124-view-polygon-views | e81dc9f |
| T124-view-polygon-views | P6 | DONE | T123 | T125-engine-golden-shapes | 729b2e7 |
| T125-engine-golden-shapes | P6 | DONE | T124, T116 | T130-model-group-object | 55ba488 |
| T130-model-group-object | P7 | DONE | T125 | T131-engine-compile-group | 5cb0311 |
| T131-engine-compile-group | P7 | DONE | T130, T114 | T132-engine-group-reparent | 93005b2 |
| T132-engine-group-reparent | P7 | DONE | T130 | T133-engine-group-layout | 171b18a |
| T133-engine-group-layout | P7 | DONE | T130 | T134-engine-sim-group-actions | 09e6cec |
| T134-engine-sim-group-actions | P7 | DONE | T131, T132, T133, T079 | T135-engine-golden-groups | 2dd5334 |
| T135-engine-golden-groups | P7 | DONE | T134 | T140-model-scene-view-state | 5318600 |
| T140-model-scene-view-state | P8 | DONE | T135 | T141-engine-compile-scene-view | 4af4e5a |
| T141-engine-compile-scene-view | P8 | DONE | T140, T064, T063 | T142-engine-scene-view-runtime | 7e858aa |
| T142-engine-scene-view-runtime | P8 | DONE | T141, T079 | T143-model-scene-view-refs | 859baa5 |
| T143-model-scene-view-refs | P8 | DONE | T142 | T144-view-viewport | e109e61 |
| T144-view-viewport | P8 | DONE | T143, T094 | T150-geom-curve-flatten | ebc0131 |
| T150-geom-curve-flatten | P9 | DONE | T144 | T151-model-curve | df80a14 |
| T151-model-curve | P9 | DONE | T150, T119 | T152-model-image | 50d355d |
| T152-model-image | P9 | DONE | T151, T095 | T153-view-curve | 693837b |
| T153-view-curve | P9 | DONE | T152, T123 | T154-engine-warning-speed-path | 8bbc61a |
| T154-engine-warning-speed-path | P9 | DONE | T153, T114 | T155-move-easing-to-lang | 4471b52 |
| T155-move-easing-to-lang | P9 | DONE | T154 | T156-final-audit | ab2364e |
| T156-final-audit | P9 | DONE | T155 | T157-geom-colour-canonical-helpers | 0d6fdb6 |
| T157-geom-colour-canonical-helpers | P10 | DONE | T156 | T158-model-get-colour | 2b5d6c0 |
| T158-model-get-colour | P10 | DONE | T157 | T159-view-colours-with-alpha | 8838852 |
| T159-view-colours-with-alpha | P10 | DONE | T158 | T160-model-colour-getters-and-interpolate | ee01876 |
| T160-model-colour-getters-and-interpolate | P10 | DONE | T159 | T161-engine-parse-colour-canonical | e9afbdb |
| T161-engine-parse-colour-canonical | P10 | DONE | T160 | T162-model-string-colour-defaults | c8ca112 |
| T162-model-string-colour-defaults | P10 | DONE | T161 | T163-colour-migration-audit | 38965b2 |
| T163-colour-migration-audit | P10 | DONE | T162 | — | e7bf21e |

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
- **P10** : couleurs avec alpha (extension)

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
2026-10-20 | T078 | DONE | commit 8f36433 | activateSet/Stop/Unbind; tests 8/8, tsc, arch 12/12, suite 630/3 skipped
2026-10-20 | T079 | DONE | commit 5731ec6 | Simulation seek/reset, mécanismes et exports; tests 9/9, tsc, arch 12/12, suite 639/3 skipped
2026-10-20 | T080 | DONE | commit 23547bd | G11 corrigé d'après JSON fiche, G12 attendu rectifié; golden 13/13, tsc, arch 12/12, suite 652/3 skipped
2026-10-20 | T090 | DONE | commit bb2d077 | PixiHost; tsc, arch 12/12, suite 652/3 skipped
2026-10-20 | T091 | DONE | commit e81accb | ObjectView, conversion de matrice et ViewRegistry; tsc, arch 12/12, suite 652/3 skipped
2026-10-20 | T092 | DONE | commit d219b0f | RectangleView; tsc, arch 12/12, suite 652/3 skipped
2026-10-20 | T093 | DONE | commit c4a6b8d | TextView et PixiTextMeasurer; tsc, arch 12/12, suite 652/3 skipped
2026-10-20 | T094 | DONE | commit 4649d5a | ViewSync et registre par défaut; tsc, arch 12/12, suite 652/3 skipped
2026-10-20 | T095 | DONE | commit 8a2db49 | Presk façade; tsc, arch 12/12, suite 652/3 skipped
2026-10-20 | T096 | DONE | commit 7276578 | démo HELLO v1 et CSS dans index; tsc, arch 12/12, suite 652/3 skipped; contrôle navigateur validé
2026-10-20 | T097 | DONE | commit 05e5e57 | tout legacy supprimé sauf `timer/easing/`; tsc propre, arch 12/12, suite 468/468
2026-10-20 | T098 | DONE | commit 05e5e57 | arborescence finale vérifiée; `timer/` ne contient que `easing/`; validations vertes
2026-10-20 | T099 | DONE | commit aa3d466 | bannière périmé ajoutée aux quatre documents présents; tsc, arch 12/12, suite 468/468
2026-10-20 | T110 | DONE | commit cab6aee | classe circle et enregistrement catalogue; tsc, arch 12/12, suite 476/476
2026-10-20 | T111 | DONE | commit 9c7ccb8 | classe ellipse et enregistrement catalogue; tsc, arch 12/12, suite 480/480
2026-10-20 | T112 | DONE | commit ba59ff9 | analyse/évaluation pathFn; tsc, arch 12/12, suite 492/492
2026-10-20 | T113 | DONE | commit 633f255 | compilateur travel en drafts provisoires; tsc, arch 12/12, suite 510/510
2026-10-20 | T114 | DONE | commit fdc32c6 | résolveur, suivi from current et ownership travel; tsc, arch 12/12, suite 523/523
2026-10-20 | T115 | DONE | commit 8403a2c | mécanisme travel activé dans Simulation; tsc, arch 12/12, suite 531/531
2026-10-20 | T116 | DONE | commit 279b07c | tests golden travel V1–V6; tsc, arch 12/12, suite 537/537
2026-10-20 | T117 | BLOCKED | sans commit | conflit entre test engine exigé et ADR-003; débloquée par autorisation d'un test d'intégration dans engine
2026-10-20 | T117 | DONE | commit 5d3ad4c | classes segment/arrow, catalogue et tests; tsc, arch 12/12, suite 548/548
2026-10-20 | T118 | BLOCKED | sans commit | conflit entre cas compile/validation et ADR-003; débloquée par autorisation d'un test d'intégration dans engine
2026-10-20 | T118 | DONE | commit dc771bb | classes polygon/triangle, ancres vertex indexées et catalogue; tsc, arch 12/12, suite 560/560
2026-10-20 | T119 | BLOCKED | sans commit | conflit résolu par autorisation architecte d'un test d'intégration dans engine
2026-10-20 | T119 | DONE | commit c0d3f02 | classe polyline ouverte/fermée et factories partagées; tsc, arch 12/12, suite 566/566
2026-10-20 | T120 | BLOCKED | sans commit | conflit résolu par autorisation limitée à T120 d'un test de compilation dans engine
2026-10-20 | T120 | DONE | commit 41369c0 | classe arc, ancres read-only, chemins et catalogue; tsc, arch 12/12, suite 573/573
2026-10-20 | T121 | BLOCKED | sans commit | conflit résolu par autorisation des tests engine et de la modification steps.test.ts
2026-10-20 | T121 | DONE | commit ec87bd9 | classes point/ray/line, origine normalisée et garde travel; tsc, arch 12/12, suite 580/580
2026-10-20 | T122 | DONE | commit dd47373 | vues Circle/Ellipse; tsc, arch 12/12, suite 580/580
2026-10-20 | T123 | BLOCKED | sans commit | conflit entre le calcul de drawProgress demandé dans la vue et ADR-017
2026-10-20 | T123 | DONE | commit e81dc9f | vues tracés, flèches, rayons et lignes; tsc, arch 12/12, suite 580/580
2026-10-20 | T124 | DONE | commit 729b2e7 | vues polygon/triangle avec progression draw; tsc, arch 12/12, suite 580/580
2026-10-20 | T125 | DONE | commit 55ba488 | dix tests golden shapes S1–S10; ciblés 10/10, tsc, arch 12/12, suite 590/590
2026-10-20 | T130 | DONE | commit 5cb0311 | GroupObject, bornes dérivées, ancres et catalogue; ciblés 21/21, tsc, arch 12/12, suite 602/602
2026-10-20 | T131 | DONE | commit 93005b2 | groupes implicites, group/ungroup, cycles, layouts et membership statique; ciblés 53/53, tsc, arch 12/12, suite 619/619
2026-10-20 | T132 | DONE | commit 171b18a | reparentage/détachement préservant l'apparence; ciblés 6/6, tsc, arch 12/12, suite 625/625
2026-10-20 | T133 | DONE | commit 09e6cec | calcul layout vertical/horizontal avec AABB; ciblés 7/7, tsc, arch 12/12, suite 632/632
2026-10-20 | T134 | DONE | commit 2dd5334 | activation group/ungroup et transition de layout; ciblés 17/17, tsc, arch 12/12, suite 640/640
2026-10-20 | T135 | DONE | commit 5318600 | golden groups H1–H7; ciblés 7/7, tsc, arch 12/12, suite 647/647
2026-10-21 | T140 | DONE | commit 4af4e5a | état viewport scène, propriétés focusOn/view/zoom et calculs région; ciblés 14/14, tsc, arch 12/12, suite 656/656
2026-10-21 | T141 | DONE | commit 7e858aa | compileurs zoom/view/focusOn, validation focusMargin et bind; ciblés 30/30, tsc, arch 12/12, suite 671/671
2026-10-21 | T142 | DONE | commit 859baa5 | interpolation géométrique zoom, cible figée animate, bind dynamique et conflits; ciblés 15/15, tsc, arch 12/12, suite 681/681
2026-10-21 | T143 | BLOCKED | sans commit | T143 demande un test bind engine↔model dans `refs.test.ts`; le garde-fou ADR-003 interdit les imports engine depuis model; ajout d’un fichier golden engine hors périmètre
2026-10-21 | T143 | DONE | commit e109e61 | refExtension scene.view, ancres/dimensions et golden bind W9; ciblés 20/20, tsc, arch 12/12, suite 684/684
2026-10-21 | T144 | DONE | commit ebc0131 | viewport appliqué dans ViewSync.syncAll; tsc, arch 12/12, suite 684/684; contrôle navigateur noté en Reprise (zoom 8 à t=1)
2026-10-21 | T150 | DONE | commit df80a14 | flattenSpline/flattenBezierChain; ciblés 7/7, tsc, arch 12/12, suite 691/691
2026-10-21 | T151 | BLOCKED | sans commit | T151.4 exige de modifier engine/compile/properties.ts et properties.test.ts, absents de « Fichiers »; les tests de compilation bézier/travel dans model/ violeraient ADR-003; aucun code écrit
2026-10-21 | T151 | DÉBLOQUÉE | sans commit | décision déléguée par l'humain : option (a), cohérente avec T117–T121; autorisés pour T151 : engine/compile/properties.ts, properties.test.ts et un test d'intégration dans engine/
2026-10-21 | T151 | DONE | commit 50d355d | classe curve, contrôle bézier 3n+1/3n dans compileProperties, test d'intégration engine; ciblés 26/26, tsc, arch 12/12, suite 707/707
2026-10-21 | T152 | DONE | commit 693837b | classe image, PixiImageInfo, ImageView, préchargement dans Presk.load; cas E_FIELD_REQUIRED/size unknown testés au niveau modèle (required + afterGeometry), sans dérogation ADR-003; ciblés 10/10, tsc, arch 12/12, suite 715/715
2026-10-21 | T153 | DONE | commit 8bbc61a | curve enregistrée avec PathStrokeView (index.ts inchangé : registerPathViews déjà appelé); tsc, arch 12/12, suite 715/715; contrôle humain draw en attente
2026-10-21 | T154 | DONE | commit 4471b52 | W_SPEED_PATH_MAY_CHANGE (règle littérale start < start du travel : un set au même instant ne déclenche pas); ciblés 15/15, tsc, arch 12/12, suite 720/720
2026-10-21 | T155 | DONE | commit ab2364e | easing déplacé en lang/easing, imports migrés, EASING_MODULE supprimé; timer/ disparu, grep timer vide; tsc, arch 12/12, suite 720/720
2026-10-21 | T156 | DONE | commit 0d6fdb6 | audit final : tsc 0 erreur; vitest 78 fichiers / 720 tests verts; arch 12/12; commit vide car BACKLOG.md n'est plus suivi par git
2026-10-21 | T156 | AUDIT | sans commit | grep LEGACY/TODO/FIXME/console.log hors tests : aucune occurrence
2026-10-23 | T163 | DONE | commit e7bf21e | getColor n'accepte plus que des chaînes canoniques (nombre dans l'état => erreur); ciblés 20/20, tsc 0, arch 12/12, suite 736/736
2026-10-23 | T163 | AUDIT | sans commit | résidus (grep getNumber fill/stroke/color, *Canonical, 0x9c9c9c, 0xffffff) tous légitimes : 0xffffff dans NAMED_COLORS (white) et bornes d'entier de geom/color.ts (parseColor, splitColor) ; cas d'entrée numériques dans color.test.ts, interpolate.test.ts, sceneObject.test.ts (fillNum doit lever) ; repli fill: 0xffffff de view/textView.ts ; aucun getNumber de couleur, aucun *Canonical
2026-10-23 | T163 | AUDIT | sans commit | 'as number' près d'une couleur : aucun ; restent 3 'value as number' sur strokeWidth (segment, curve, polyline), propriété numérique, hors sujet couleur
2026-10-23 | T163 | AUDIT | sans commit | git diff --stat cc48073 HEAD : 30 fichiers, tous dans le périmètre des fiches T158–T163 ; les modifications de T157 sont dans le commit de base cc48073 (dépôt réinitialisé depuis l'archive, pas de commit « avant T157 » disponible) donc non vérifiables ; sceneObject.ts et sceneObject.test.ts apparaissent comme créés car exclus du commit de base
2026-10-23 | T163 | AUDIT | sans commit | contrôles humains : « HELLO identique après T159 » existait déjà, « rectangle #ff000080 + opacity 0.5 » et « fill rouge → bleu » existaient déjà après T163 ; ajout d'un contrôle HELLO après T163
2026-10-23 | T162 | DONE | commit 38965b2 | défauts fill/stroke/color en chaînes canoniques dans 10 classes + test générique sur tout le catalogue; ciblés 10/10, tsc 0, arch 12/12, suite 736/736
2026-10-23 | T161 | DONE | commit c8ca112 | parseColor/lerpColor canoniques (anciennes versions numériques supprimées, plus de *Canonical), golden C1–C8; ciblés 31/31, tsc 0, arch 12/12, suite 734/734 (13 anciens tests numériques retirés, 8 dorés ajoutés)
2026-10-23 | T160 | DONE | commit e9afbdb | getters fill/stroke/color via getColor (segment, curve, polyline, text, rectangleStyleProps), interpolate en chaînes canoniques; ciblés 100/100, tsc 0, arch 12/12, suite 739/739; rectangle par défaut couvert via polygonObject.test (rectangleStyleProps partagé)
2026-10-23 | T159 | DONE | commit ee01876 | 5 vues lisent getColor+splitColor, rgb+alpha séparés vers Pixi; tsc 0, arch 12/12, suite 737/737; contrôle humain HELLO en attente
2026-10-23 | T158 | DONE | commit 8838852 | débloquée par l'humain : exemples-orbites.ts est un exemple jetable, constante NO_FILL inutilisée supprimée ; git init + baseline cc48073 ; tsc 0, arch 12/12, suite 737/737
2026-10-23 | T158 | BLOCKED | sans commit | getColor + tests faits (10/10, arch 12/12, suite 737/737) mais tsc : 1 erreur hors périmètre exemples-orbites.ts (NO_FILL inutilisé) ; pas de dépôt git dans l'archive
2026-10-21 | T156 | AUDIT | sans commit | core/src contient __arch__ app engine geom lang model view style.css + README.md (périmé, bannière T099, hors périmètre : non touché); dossier timer/ vide supprimé (reliquat de T155.1)

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

T158 | `tsc --noEmit` échoue (TS6133 `NO_FILL` déclaré mais jamais lu, core/src/app/exemples-orbites.ts ligne 24) alors que la Validation exige 0 erreur tsc ; ce fichier n'est dans aucune fiche du kit et n'est pas dans « Fichiers » de T158. Comment le traiter ? De plus l'archive n'a pas de dépôt git : faut-il en initialiser un (branche presk-v1) pour pouvoir commiter ? | fiche T158 (Fichiers, Validation, Ne pas toucher) ; agent.md §2, §5 ; exemples-orbites.ts l.18-24 (NO_FILL = "#00000000" jamais utilisé) ; grep : aucune autre référence au fichier | (a) autoriser la modification de exemples-orbites.ts pour T158 (supprimer ou utiliser NO_FILL) ; (b) l'humain corrige ou retire le fichier avant reprise ; (c) exclure ce fichier de tsc et accepter l'erreur ; pour git : (d) l'humain fournit le dépôt, ou (e) j'exécute `git init` + commit de base sur presk-v1

T155 | ADR-003 mentionne encore `@/timer/easing/easing` (et 00-overview / ADR-001 : `timer/easing`) alors que le module est maintenant `@/lang/easing/easing` ; mise à jour à ta charge (je ne modifie pas `architecture/**`) | fiche T155.4; ADR-003, ADR-001, 00-overview | mettre à jour ces trois documents

T151 | T151.4 demande un contrôle `E_VALUE_RANGE` (3n+1 / 3n points pour `bezier`) dans `compileProperties` (mode `create`) et un cas dans `properties.test.ts`, mais « Fichiers » ne liste ni `core/src/engine/compile/properties.ts` ni `properties.test.ts`; de plus les cas « bézier compile ok / E_VALUE_RANGE » et « travel → E_TRAVEL_RANGE » ne peuvent pas vivre dans `curveObject.test.ts` (model/ n'importe pas engine/, ADR-003). Autorises-tu la modification de ces deux fichiers engine et un test d'intégration dans engine/ pour cette tâche ? | fiche T151 (Fichiers, T151.4, Cas de test, Validation); ADR-020; contrat classes/curve.md; ADR-003; agent.md §4–§5; précédents T117–T121 et T143 | (a) autoriser properties.ts + properties.test.ts + un fichier de test d'intégration engine pour T151 (comme T117–T121) ; (b) retirer le contrôle bézier de T151 et le déplacer dans une tâche engine dédiée


T001 | La baseline correspond à T001.4 (184 passés, 3 échoués, 2 erreurs tsc), mais la section Validation exige zéro échec et zéro erreur; `vitest run src/__arch__` ne trouve aucun test. La tâche doit-elle être DONE avec la baseline attendue malgré ces critères, ou BLOCKED jusqu’à clarification ? | fiche T001 : résultats attendus aux étapes T001.3–T001.4; section Validation : tsc et tous les tests doivent passer, dont `src/__arch__`; exécution : chiffres attendus reproduits et aucun test arch détecté | considérer les échecs/types annoncés comme base acceptée et l’arch guard absent comme non applicable, ou exiger une validation verte avant DONE

T001 | Quel est l’état attendu des suppressions de agent/ et de l’ajout de presk_kit/ visibles dans git status, et peux-tu fournir un arbre propre pour reprendre T001.1 ? | agent.md et T001 exigent git status propre avant branche/tests; status montre de nombreux D agent/** et ?? presk_kit/; essai git switch -c presk-v1 a échoué avec Permission denied sur .git/refs/heads/presk-v1.lock | conserver ces changements et les committer, ou restaurer la suppression/annuler le déplacement puis retenter

## Contrôles humains
(à faire par l'humain, jamais par l'agent)
- [ ] Après T096 : `pnpm dev`, la démo HELLO s'affiche et se contrôle (play/pause/curseur).
- [ ] Après P6 : un `travel` sur un cercle donne un mouvement circulaire régulier.
- [ ] Après T144 : `focusOn` zoome bien sur l'objet.
- [ ] Après T153 : `reveal:"draw"` sur une `curve` se trace progressivement.
- [ ] Relire `architecture/open-questions.md` (Q1–Q23) et valider ou corriger les choix.
- [ ] Après T159 : `pnpm dev`, la démo `HELLO` s'affiche comme avant.
- [ ] Après T163 : `pnpm dev`, la démo `HELLO` est identique à avant.
- [ ] Après T163 : un rectangle `fill:"#ff000080"` avec `opacity:0.5` apparaît à environ 25 % d'opacité (Q26).
- [ ] Après T163 : une animation `fill` rouge → bleu est un fondu continu.

### Liste finale à faire par l'humain (T156)
- [ ] (1) `pnpm dev`, jouer la démo `HELLO` (play / pause / curseur).
- [ ] (2) Zoom `focusOn` : `animate scene {focusOn:"box"} duration 1` zoome bien sur l'objet.
- [ ] (3) `reveal:"draw"` sur une `curve` : le tracé se fait progressivement.
- [ ] (4) Un document volontairement faux affiche bien les diagnostics.
- [ ] (5) Relire `architecture/open-questions.md` (Q1–Q23) et valider ou corriger les choix.
- [ ] (6) Mettre à jour ADR-003 / ADR-001 / 00-overview (mentions de `@/timer/easing/easing`, voir Questions pour l'architecte, T155).
