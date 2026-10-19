# T040-model-values-ports-effect-types
**Phase** P3 · **Dépend de** : T034-geom-flat-path, T010-lang-diagnostics · **Réf spec** : §3, §5

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/conventions.md`
- `architecture/contracts/C-model-core.md (sections values.ts et ports.ts)`
- `architecture/contracts/C-model-effects.md`
- `architecture/decisions/ADR-008-class-catalog-and-prop-specs.md`
- `architecture/decisions/ADR-014-ports-text-measurer-and-images.md`

## Objectif
Créer les types partagés du modèle (`PropSpec`, `ClassDef`…), les ports (`TextMeasurer`, `ImageInfoProvider`) avec leurs faux de test, et le **type** `EffectDef`.

## Fichiers
- créer : `core/src/model/values.ts`
- créer : `core/src/model/effects.ts`
- créer : `core/src/model/ports.ts`
- créer : `core/src/model/ports.test.ts`
- créer : `core/src/model/sceneObject.ts (squelette vide)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T040.1 Écris `ports.test.ts` (cas ci-dessous).
T040.2 Crée `ports.ts` : interfaces + `FakeTextMeasurer`, `FakeImageInfo`, `createTestEnv()` exactement comme `C-model-core.md § ports.ts`.
T040.3 Crée `effects.ts` avec **seulement** l'interface `EffectDef` et la constante `EFFECT_DEFAULT_VARIANT = "default"` (les effets concrets viennent en T044). `apply` reçoit un `SceneObject` : `import type`.
T040.4 Crée `sceneObject.ts` avec un squelette **volontairement vide** : `// Filled in by T041.` puis `export abstract class SceneObject {}`.
T040.5 Crée `values.ts` : recopie les types de `C-model-core.md § values.ts` (y compris le hook optionnel `afterGeometry`). Importe en `import type` : `Pt` depuis `@/geom/vec`, `FlatPath` depuis `@/geom/flatPath`, `DiagnosticCode` depuis `@/lang/diagnostics`, `Bounds`/`Mat` si utilisés, `EffectDef` depuis `./effects`, `ObjectEnv` depuis `./ports`, `SceneObject` depuis `./sceneObject`. Réexporte `Pt`.

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| `new FakeTextMeasurer().measure("Hello",{fontSize:10,fontFamily:"x",fontWeight:"bold"})` | `{width:30,height:12}` |
| idem avec `""` | `{width:0,height:12}` |
| `new FakeImageInfo({"a.png":{width:4,height:3}}).sizeOf("a.png")` | `{width:4,height:3}` |
| `.sizeOf("zzz")` | `undefined` |
| `createTestEnv().measurer` instance de `FakeTextMeasurer` | vrai |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/ports.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): shared types, ports and effect type (T040)`

## Suivante
`T041-model-scene-object`
