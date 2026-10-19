# T042-model-base-props
**Phase** P3 · **Dépend de** : T041-model-scene-object · **Réf spec** : §3.1, §9.4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-model-core.md (section baseProps.ts)`
- `architecture/decisions/ADR-008-class-catalog-and-prop-specs.md`

## Objectif
Créer `baseProps(opts)` : les `PropSpec` communes à tous les objets.

## Fichiers
- créer : `core/src/model/baseProps.ts`
- créer : `core/src/model/baseProps.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T042.1 Écris les tests (cas ci-dessous), puis la fonction. Chaque `get`/`set` lit/écrit l'état via `o.getState`/`o.setState`.
T042.2 `pos` : `get` → `{x: o.getNumber("x"), y: o.getNumber("y")}` ; `set(o, v)` → écrit `x` et `y` depuis le `Pt`.
T042.3 Tableau exact de `C-model-core.md § baseProps.ts` (nom, kind, writes, mode, animatable, order, bornes). `scale` : `min: 0, minExclusive: true`. `opacity` : `min:0,max:1`. `pivot` : `kind:"enum", mode:"init", animatable:false, values: opts.pivotValues`.

## Cas de test (à écrire AVANT le code)
Avec un `TestObject` (cf. T041) :
| appel | attendu |
|---|---|
| `Object.keys(baseProps({pivotValues:["center","pos"]}))` | `["x","y","pos","rotation","scale","opacity","pivot"]` |
| `p.pos.writes` | `["x","y"]` ; `p.pos.kind` `"point"` ; `p.pos.order` 2 |
| `p.rotation.order` / `p.scale.order` / `p.opacity.order` | 1 / 1 / 3 |
| `p.pivot.mode` / `.animatable` / `.values` | `"init"` / `false` / `["center","pos"]` |
| `p.scale.min` / `.minExclusive` | 0 / true |
| `p.pos.set!(o,{x:5,y:6})` puis `p.pos.get(o)` | `{x:5,y:6}` |
| `p.x.set!(o, 7)` puis `o.getState("x")` | 7 |
| tous les props sauf `pivot` | `animatable: true` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/baseProps.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): base property specs (T042)`

## Suivante
`T043-model-world`
