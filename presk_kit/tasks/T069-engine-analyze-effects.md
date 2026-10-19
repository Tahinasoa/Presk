# T069-engine-analyze-effects
**Phase** P4 · **Dépend de** : T068-engine-plan-timeline, T064-engine-compile-properties · **Réf spec** : §5.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-012-effects-reveal-presence.md`
- `architecture/contracts/C-model-effects.md`

## Objectif
Résoudre `reveal: false` en « inverse de la dernière variante jouée », à la compilation.

## Fichiers
- créer : `core/src/engine/analyze/effects.ts`
- créer : `core/src/engine/analyze/effects.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T069.1 Écris les tests (cas ci-dessous) en utilisant `planForTest` (T068) ; les entrées d'effet sont dans `init[i].entries` et `actions[i].entries`.
T069.2 `resolveEffectVariants(init: InitStep[], actions: PlannedAction[]): void` : **modifie en place** les `CompiledEffect` dont `on === false`.
T069.3 Algorithme : table `last: Map<"objet|effet", string>` (défaut `"default"`). Parcours d'abord `init` (dans l'ordre), puis les actions `set` et `animate` triées par `(start, index)`. Pour chaque `CompiledEffect` : si `on` → `last.set(clé, variant)` ; sinon → `variant = last.get(clé) ?? "default"` (la table ne change pas).

## Cas de test (à écrire AVANT le code)
| séquence (même objet `a`, effet `reveal`) | variantes résolues des « faux » |
|---|---|
| `set reveal:false` seul | `"default"` |
| create `reveal:"draw"` ; `set reveal:false` | `"draw"` |
| `animate reveal:true` ; `animate reveal:false` | `"default"` |
| `animate reveal:"draw"` ; `animate reveal:false` ; `animate reveal:true` ; `animate reveal:false` | `"draw"`, puis `"default"` |
| actions déclarées dans un autre ordre que leur `start` | résolution selon `start` (déclare `animate reveal:false` à start 5 **avant** `animate reveal:"draw"` à start 1 → le faux (start 5) obtient `"draw"`) |
| deux objets `a`, `b` | historiques indépendants |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/analyze/effects.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): effect variant resolution (T069)`

## Suivante
`T070-engine-analyze-activity`
