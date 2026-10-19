# T068-engine-plan-timeline
**Phase** P4 · **Dépend de** : T067-engine-compile-steps, T066-engine-pass-progress · **Réf spec** : §6

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-compile.md (PlanHooks, DraftAction)`
- `architecture/decisions/ADR-009-timeline-planning.md`
- `architecture/contracts/C-lang-start.md`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
`planTimeline` : instants de début/fin, noms, durée de scène, erreurs de timing. Crée aussi l'aide de test `planForTest`.

## Fichiers
- créer : `core/src/engine/plan/timeline.ts`
- créer : `core/src/engine/plan/timeline.test.ts`
- créer : `core/src/engine/testing.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T068.1 Écris les tests (cas ci-dessous) en construisant les brouillons à la main avec un helper local `draft(partial)` qui complète les champs manquants (`action:"animate"`, `entries:[]`, `ease:"linear"`, `repeat:1`, `repeatMode:"restart"`, `startSpec:DEFAULT_START`, `target:"a"`, `index` croissant).
T068.2 Signature : `planTimeline(drafts: readonly DraftAction[], d: DiagnosticCollector, hooks?: PlanHooks): { actions: PlannedAction[]; duration: number }`.
T068.3 Pour chaque brouillon dans l'ordre, `prev` = dernière action planifiée (ou `null`) : **start** selon `startSpec` (ADR-009) : absolute → `time` ; prevStart → `(prev?.start ?? 0) + offset` ; prevEnd → `prev ? prev.end : 0` (si `prev.end` est `Infinity` : `E_START_REF_INFINITE_END`) `+ offset` ; labelStart/labelEnd via la table des noms (nom inconnu **ou déclaré plus bas** : `E_START_UNKNOWN_NAME` ; fin infinie référencée : `E_START_REF_INFINITE_END`). Arrondis chaque instant avec `Math.round(x*1e9)/1e9`. `start < −1e-9` → `E_START_NEGATIVE` (puis utilise 0 pour continuer).
T068.4 **duration** (une passe) : `set/bind/unbind/stop/ungroup` : 0 ; `animate` : `explicitDuration ?? effectDefaultDuration` ; `group` : `explicitDuration ?? 0`. `travel` : appelle `hooks.resolveTravel` (non fourni → `Error` interne). **end** : `start + duration × repeat` (nombre) ; `Infinity` si `repeat === "infinite"` (animate/travel seulement) ; sinon `start + duration`.
T068.5 Enregistre `name` (si présent) dans la table avec `{start,end}` après calcul. Appelle `hooks.onPlanned?.(action)` pour chaque action planifiée.
T068.6 Après la boucle : `duration` = max des `end` finis (0 si aucun). Toute action avec `end === Infinity` et `start >= duration − 1e-9` → `E_INFINITE_NEVER_PLAYED`.
T068.7 Crée `engine/testing.ts` : `planForTest(steps: unknown[], scene = {width:800,height:600})` qui enchaîne `validateDocument` → `compileCreates` → `compileSteps` → `planTimeline` avec `createDefaultCatalog()`, et renvoie `{ init, actions, duration, diagnostics }` (n'importe quelle erreur reste dans `diagnostics`, aucune exception). **Ce fichier n'est utilisé que par des tests.** Il sera réutilisé par T069, T070, T071.

## Cas de test (à écrire AVANT le code)
(durées en secondes, `d` = durée d'une passe)
| brouillons | starts / ends / durée de scène |
|---|---|
| A(d1), B(d2) | starts 0,1 ; ends 1,3 ; scène 3 |
| A(d1), B(d2,`"<"`) | starts 0,0 ; scène 2 |
| A(d1), B(d2,`">0.5"`) | B.start 1.5 |
| A(d1), B(d2,`"<0.5"`) | B.start 0.5 |
| A(d1), B(d2,absolu 5) | B.start 5 ; scène 7 |
| A(d2,name "a"), B(d1), C(d1,`"a<1"`), D(d1,`"a>-0.5"`) | C.start 1 ; D.start 1.5 |
| `start:"zzz"` | `E_START_UNKNOWN_NAME` |
| nom défini par une action **plus bas** | `E_START_UNKNOWN_NAME` |
| A(infinie), B(sans start) | `E_START_REF_INFINITE_END` |
| A(d1,`"<-1"`) | `E_START_NEGATIVE` |
| A(d1,repeat 3) / (repeat 3 yoyo) | end 3 / 3 |
| A(d1, repeat "infinite") seule | `E_INFINITE_NEVER_PLAYED` |
| A(infinie, absolu 0), B(d3, absolu 0) | pas d'erreur ; scène 3 ; A.end = Infinity |
| `set` à start absolu 2 | end 2, duration 0, scène 2 |
| animate effets seulement (`effectDefaultDuration` 0.5) | duration 0.5 |
| A(d0.1), B(d0.2), C(sans start) | C.start = 0.3 exactement (`toBe(0.3)`) |
| `planForTest` d'un doc `create`+`animate` valide | `diagnostics = []` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/plan/timeline.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): timeline planning (T068)`

## Suivante
`T069-engine-analyze-effects`
