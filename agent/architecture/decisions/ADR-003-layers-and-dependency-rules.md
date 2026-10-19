# ADR-003-layers-and-dependency-rules
**Couches et règles de dépendance** · Réf spec : —

## Contexte
Garder le modèle testable sans navigateur ; empêcher le rendu de muter le modèle.

## Décision
Dépendances autorisées (imports `@/...`) pour les **nouveaux** dossiers :

| Dossier | Peut importer |
|---|---|
| `lang/` | `lang/` uniquement (+ `@/timer/easing/easing` pour les noms d'easing, T012) |
| `geom/` | `geom/` + librairie `transformation-matrix` (dans `geom/matrix.ts` seulement) |
| `model/` | `lang/`, `geom/`, `model/` |
| `engine/` | `lang/`, `geom/`, `model/`, `engine/`, `@/timer/easing/easing` |
| `view/` | `model/`, `geom/`, `view/`, `pixi.js` |
| `app/` | tout, `pixi.js` |

Interdits : un module de couche basse important une couche haute ; `pixi.js` hors `view/ app/` ; tout import du legacy (hors easing) ; `document`/`window` hors `view/ app/`.
Un test `src/__arch__/layers.test.ts` (T004) lit les imports de tous les fichiers et échoue si une règle est violée.

## Alternatives écartées
Conventions seulement documentées : jamais respectées avec des agents faibles. On les automatise.

## Conséquences
Toute violation fait échouer la validation de la tâche. Une tâche ne doit jamais « contourner » le test ; en cas de besoin légitime, `BLOCKED` + question.
