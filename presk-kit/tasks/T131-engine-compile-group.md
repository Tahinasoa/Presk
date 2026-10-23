# T131-engine-compile-group
**Phase** P7 · **Dépend de** : T130-model-group-object, T114-engine-travel-resolver · **Réf spec** : §10

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-015-groups-hierarchy-layout.md`
- `architecture/contracts/C-engine-compile.md (GroupAction.children)`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
Compiler `group` et `ungroup`, déduire les groupes implicites, valider enfants, cycles et layouts.

## Fichiers
- modifier : `core/src/engine/compile/create.ts`
- créer : `core/src/engine/compile/groups.ts`
- créer : `core/src/engine/compile/groups.test.ts`
- modifier : `core/src/engine/compile/steps.ts`
- modifier : `core/src/engine/compileProgram.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T131.1 Écris les tests (cas ci-dessous).
T131.2 `groups.ts` : `addImplicitGroups(steps: readonly Step[], init: InitStep[], types: Map<string,string>): void` : pour chaque étape `group` (ordre des steps) dont la cible n'est pas dans `types` : ajoute `{id, type:"group", entries:[]}` à `init` (après tous les `create` explicites, ordre de première apparition) et `types.set(id,"group")`. Appelée par `compileProgram` après `compileCreates` et **avant** `compileSteps`.
T131.3 Dans `compileSteps` : `group` → cible existante mais `types.get(target) !== "group"` → `E_GROUP_TARGET_NOT_GROUP`. `children` = `properties.children` normalisé en tableau ; chacun doit être dans `types` (et ≠ `"scene"`) sinon `E_GROUP_CHILD_UNKNOWN` ; un enfant égal à la cible ou **ancêtre** de la cible (table `staticParent: Map<enfant, groupe>` mise à jour dans l'ordre des steps) → `E_GROUP_CYCLE`. Les autres clés de `properties` : `compileProperties(sans children, "set", GROUP_DEF, …)` → `props`.
T131.4 Layout : si `properties.layout` (brut) est `"vertical"` ou `"horizontal"` (ou si le groupe en a déjà un dans un `group`/`create` antérieur) et qu'un enfant est de famille `unbounded` ou `point` → `E_GROUP_LAYOUT`. `layout`/`gap`/`margin` de mauvaise valeur sont déjà couverts par `compileValue`.
T131.5 Après validation, `staticParent.set(enfant, cible)` pour chaque enfant. `ease` défaut `"linear"` ; `explicitDuration` = `duration`.
T131.6 `ungroup` : cible doit être un groupe (`E_GROUP_TARGET_NOT_GROUP`) ; `children` (optionnel, normalisé) : chacun doit avoir `staticParent === target` sinon `E_UNGROUP_NOT_MEMBER` ; `children:null` = tous. Met à jour `staticParent`.
T131.7 Remplace l'erreur « not implemented » de `group`/`ungroup` dans `compileSteps`.

## Cas de test (à écrire AVANT le code)
| steps | résultat |
|---|---|
| `rectangle a`, `rectangle b` ; `group menu {children:["a","b"]}` | `init` : a, b, **menu** (groupe implicite, dernier) ; `types.menu = "group"` |
| même, mais `create menu type group` déjà fait | pas de doublon |
| `group a {children:["b"]}` (a est un rectangle) | `E_GROUP_TARGET_NOT_GROUP` |
| `group g {children:["zzz"]}` / `["scene"]` | `E_GROUP_CHILD_UNKNOWN` |
| `group g {children:["g"]}` | `E_GROUP_CYCLE` |
| `group g {children:["h"]}` puis `group h {children:["g"]}` | `E_GROUP_CYCLE` |
| `group g {children:["r"],layout:"vertical"}` avec `r` un `ray` | `E_GROUP_LAYOUT` |
| `group g {children:"a"}` | ok (chaîne normalisée en tableau) |
| `group g {children:["a"],gap:5,layout:"horizontal"}` | `props` : `layout`, `gap` |
| `ungroup g {children:["b"]}` quand `b` n'est pas dans `g` | `E_UNGROUP_NOT_MEMBER` |
| `ungroup g` (tous) après `group g {children:["a"]}` | ok |
| `ungroup a` (rectangle) | `E_GROUP_TARGET_NOT_GROUP` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/compile/groups.test.ts src/engine/compile/create.test.ts src/engine/compile/steps.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): group and ungroup compilation (T131)`

## Suivante
`T132-engine-group-reparent`
