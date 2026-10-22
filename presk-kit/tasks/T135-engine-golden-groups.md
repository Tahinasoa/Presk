# T135-engine-golden-groups
**Phase** P7 · **Dépend de** : T134-engine-sim-group-actions · **Réf spec** : §10

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-018-testing-strategy.md`
- `architecture/decisions/ADR-015-groups-hierarchy-layout.md`

## Objectif
Verrouiller les groupes de bout en bout (dont opacité composée et non-propagation de `reveal`).

## Fichiers
- créer : `core/src/engine/golden/groups.golden.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T135.1 Même helper `run` ; un `it` par ligne.

## Cas de test (à écrire AVANT le code)
| # | steps | instant | attendu |
|---|---|---|---|
| H1 | `rectangle a {width:100,height:50}` ; `rectangle b {x:200,y:100,width:50,height:50}` ; `group g {children:["a","b"]}` ; `animate g {x:100} duration 1 linear` | 1 | `a.topLeft` (100,0) ; `b.topLeft` (300,100) (le groupe déplace ses enfants) |
| H2 | idem H1 sans le déplacement : `animate g {rotation:90} duration 1 linear` | 1 | `a.rotation` (état local) = 0 ; `a.topLeft` (monde) = (200,−50) (rotation de 90° horaire autour du centre de la boîte du groupe (125,75)) |
| H3 | `rectangle a {reveal:true}` ; `group g {children:["a"]}` ; `animate g {opacity:0.5} duration 1` | 1 | `a.effectiveAlpha()` = 0.5 (groupe créé visible ; opacité composée) |
| H4 | `rectangle a {}` (non révélé) ; `group g {children:["a"]}` | 0 | `a.effectiveAlpha()` = 0 (un enfant non révélé reste invisible) |
| H5 | `animate g {reveal:true}` d'un groupe dont l'enfant est non révélé | fin | `g.effectiveAlpha()` 1 ; `a.effectiveAlpha()` 0 (`reveal` ne se propage pas) |
| H6 | `group g {children:["zzz"]}` | compilation | `E_GROUP_CHILD_UNKNOWN` |
| H7 | `group g {children:["a"],layout:"vertical",gap:10}` avec `a`,`b` (50×50) ; `group g {children:["b"]}` ensuite | 0 | `b.topLeft.y` = 60 après le 2ᵉ `group` (le layout se réapplique à tous les enfants) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/golden/groups.golden.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`test(engine): groups golden tests (T135)`

## Suivante
`T140-model-scene-view-state`
