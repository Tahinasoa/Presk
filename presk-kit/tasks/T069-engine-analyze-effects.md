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
- modifier : `core/src/engine/testing.ts (paramètre `catalog` optionnel de `planForTest`)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T069.1 Modifie `planForTest` (T068) : ajoute un 3ᵉ paramètre optionnel `catalog: Catalog = createDefaultCatalog()` et utilise-le à la place du catalogue par défaut. Aucun autre changement de comportement (les tests de T068 doivent rester verts).
T069.2 Dans `effects.test.ts`, définis une classe de test **`drawable`** : `const DRAWABLE_DEF: ClassDef = { ...RECTANGLE_DEF, type: "drawable", effects: { reveal: revealWithDraw() }, create: (id, env) => new RectangleObject(id, DRAWABLE_DEF, env, { drawProgress: 1 }) };` puis `const cat = createDefaultCatalog(); cat.register(DRAWABLE_DEF);` et passe `cat` à `planForTest`. (Le catalogue par défaut n'a, à ce stade, aucune classe avec la variante `draw`.)
T069.3 Écris les tests (cas ci-dessous) avec `planForTest(steps, undefined, cat)` ; les entrées d'effet sont dans `init[i].entries` et `actions[i].entries`.
T069.4 `resolveEffectVariants(init: InitStep[], actions: PlannedAction[]): void` : **modifie en place** les `CompiledEffect` dont `on === false`.
T069.5 Algorithme : table `last: Map<"objet|effet", string>` (défaut `"default"`). Parcours d'abord `init` (dans l'ordre), puis les actions `set` et `animate` triées par `(start, index)`. Pour chaque `CompiledEffect` : si `on` → `last.set(clé, variant)` ; sinon → `variant = last.get(clé) ?? "default"` (la table ne change pas).

## Cas de test (à écrire AVANT le code)
(`rect` = type `rectangle` ; `dr` = type `drawable`)
| séquence (même objet, effet `reveal`) | variantes résolues des « faux » |
|---|---|
| `rect` : `set reveal:false` seul | `"default"` |
| `rect` : `set reveal:"draw"` | diagnostic `E_EFFECT_VALUE` (variante inconnue de `rectangle`) |
| `dr` : create `reveal:"draw"` ; `set reveal:false` | `"draw"` |
| `rect` : `animate reveal:true` ; `animate reveal:false` | `"default"` |
| `dr` : `animate reveal:"draw"` ; `animate reveal:false` ; `animate reveal:true` ; `animate reveal:false` | `"draw"`, puis `"default"` |
| `dr` : actions déclarées dans un autre ordre que leur `start` : `animate reveal:false` à start 5 **déclaré avant** `animate reveal:"draw"` à start 1 | le faux (start 5) obtient `"draw"` |
| deux objets `a`, `b` | historiques indépendants |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/analyze/effects.test.ts src/engine/plan/timeline.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): effect variant resolution (T069)`

## Suivante
`T070-engine-analyze-activity`
