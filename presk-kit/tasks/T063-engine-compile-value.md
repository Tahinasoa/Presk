# T063-engine-compile-value
**Phase** P4 · **Dépend de** : T062-engine-compile-expr, T033-geom-color · **Réf spec** : §7.1, §11.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-compile.md`
- `architecture/contracts/C-model-core.md (PropSpec)`
- `architecture/decisions/ADR-019-colors-and-literals.md`
- `architecture/decisions/ADR-007-expression-pipeline-parse-analyze-evaluate.md`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
`compileValue(spec, raw, ctx)` : transforme la valeur JSON d'une propriété en `Evaluator`, selon le **kind** de la propriété (jamais par heuristique).

## Fichiers
- créer : `core/src/engine/compile/value.ts`
- créer : `core/src/engine/compile/value.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T063.1 Écris les tests (cas ci-dessous).
T063.2 Signature : `compileValue(spec: PropSpec, raw: JsonValue, ctx: { scope: AnalyzeScope; d: DiagnosticCollector; where: DiagnosticWhere }): { value: Evaluator; reads: string[] } | null`.
T063.3 kind `number` : nombre fini → constante (puis bornes `min`/`max`/`minExclusive` → `E_VALUE_RANGE`). Chaîne → `parseExpression` (échec → `E_EXPR_SYNTAX`), `analyzeExpr` ; le type doit être `scalar` sinon `E_EXPR_TYPE_MISMATCH` ; évaluateur = `compileExpr`. Autre type JSON → `E_VALUE_TYPE`.
T063.4 kind `point` : chaîne → expression de type `point` (sinon `E_EXPR_TYPE_MISMATCH`). Objet `{x,y}` (exactement ces 2 clés) → chaque composante nombre fini ou chaîne scalaire (mêmes règles) → évaluateur renvoie `{x,y}`. Autre → `E_VALUE_TYPE`.
T063.5 kind `color` : `parseColor(raw)` ; `null` → `E_COLOR_INVALID`. kind `string` : chaîne sinon `E_VALUE_TYPE`. kind `boolean` : booléen sinon `E_VALUE_TYPE`. kind `enum` : chaîne ∈ `spec.values` sinon `E_VALUE_RANGE` (non chaîne : `E_VALUE_TYPE`).
T063.6 kind `pointList` : tableau dont chaque élément est `{x:nombre fini, y:nombre fini}` sinon `E_VALUE_TYPE` ; puis `minItems`/`maxItems` de la spec (si définis) → `E_VALUE_RANGE` ; copie profonde.
T063.7 Si `spec.customKind` est défini : renvoie `E_VALUE_TYPE` « custom compiler not registered » **sauf** si un compilateur est enregistré dans la table exportée `CUSTOM_COMPILERS: Record<string, (spec, raw, ctx) => {value:Evaluator; reads:string[]} | null>` (vide pour l'instant, remplie en T141) ; si présent, délègue.
T063.8 kinds `objectRef`, `objectRefList`, `region` : `E_VALUE_TYPE` avec message « not supported yet » (ajoutés en P7/P8).
T063.9 Les évaluateurs constants ignorent le `world`. Le résultat `reads` est la liste des objets lus (vide pour une constante).

## Cas de test (à écrire AVANT le code)
Specs : `width` (number, min 0), `scale` (number, min 0 exclusif), `pos` (point), `fill` (color), `text` (string), `pivot` (enum), `points` (pointList).
| spec, raw | résultat |
|---|---|
| width, `100` | constante 100 |
| width, `-1` | `E_VALUE_RANGE` ; width, `"x"` (expression invalide) → `E_EXPR_SYNTAX` ; width, `true` → `E_VALUE_TYPE` |
| scale, `0` | `E_VALUE_RANGE` ; scale, `0.5` ok |
| width, `"a.height / 2"` (a existe, h 50) | évalue 25 ; reads [a] |
| width, `"a.center"` | `E_EXPR_TYPE_MISMATCH` |
| pos, `"scene.center"` | évalue `{x:400,y:300}` (scène 800×600) |
| pos, `"a.width"` | `E_EXPR_TYPE_MISMATCH` |
| pos, `{x:10,y:"a.width"}` | `{x:10,y:100}` |
| pos, `{x:1}` / `{x:1,y:2,z:3}` / `[1,2]` | `E_VALUE_TYPE` |
| fill, `"#f00"` / `"blue"` / `65280` | `0xff0000` / `0x0000ff` / `65280` |
| fill, `"nope"` | `E_COLOR_INVALID` |
| text, `"Hi"` ; text, `3` | `"Hi"` ; `E_VALUE_TYPE` |
| pivot (values `["center","pos"]`), `"pos"` ; `"left"` | ok ; `E_VALUE_RANGE` |
| points, `[{x:0,y:0},{x:1,y:1}]` ; `[[0,0]]` ; `[{x:"a",y:0}]` | ok ; `E_VALUE_TYPE` ; `E_VALUE_TYPE` |
| points avec `minItems:3`, 2 points | `E_VALUE_RANGE` |
| spec avec `customKind:"x.y"` non enregistré | `E_VALUE_TYPE` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/compile/value.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): property value compilation (T063)`

## Suivante
`T064-engine-compile-properties`
