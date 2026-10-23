# T133-engine-group-layout
**Phase** P7 · **Dépend de** : T130-model-group-object · **Réf spec** : §10.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-015-groups-hierarchy-layout.md (addendum : algorithme de layout)`

## Objectif
Fonction pure `computeLayout` : positions cibles des enfants.

## Fichiers
- créer : `core/src/engine/sim/layout.ts`
- créer : `core/src/engine/sim/layout.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T133.1 Écris les tests (cas ci-dessous).
T133.2 `computeLayout(group: GroupObject): Map<string, {x:number; y:number}>` : renvoie, pour chaque enfant **borné**, ses nouvelles valeurs `x`,`y` (état local). Algorithme exact de l'ADR-015 (addendum) : `layout` lu dans l'état ; `none` → map vide ; `margin`, `gap` lus dans l'état.
T133.3 Boîte d'un enfant `B = transformBounds(child.localBounds(), child.localMatrix())` (repère du groupe). Vertical : `cy = margin` ; pour chaque enfant : `dx = margin − B.minX`, `dy = cy − B.minY` ; cible = `{x: child.x + dx, y: child.y + dy}` ; `cy += (B.maxY − B.minY) + gap`. Horizontal : `cx = margin` ; `dx = cx − B.minX`, `dy = margin − B.minY` ; `cx += largeur + gap`.
T133.4 Les enfants non bornés sont ignorés (ils gardent leur état).

## Cas de test (à écrire AVANT le code)
Groupe `g` ; enfants dans cet ordre : `a` (0,0,100×50), `b` (500,300,60×40), `c` (7,7,20×20) :
| layout, gap, margin | cibles `{x,y}` |
|---|---|
| `none` | map vide |
| vertical, gap 10, margin 0 | a (0,0) ; b (0,60) ; c (0,110) |
| vertical, gap 0, margin 5 | a (5,5) ; b (5,55) ; c (5,95) |
| horizontal, gap 10, margin 0 | a (0,0) ; b (110,0) ; c (180,0) |
| `a` avec `scale 2` (pivot centre (50,25) → boîte (−50,−25)-(150,75)), vertical, gap 0, margin 0 ; `b` (500,300,60×40) | `a` → `{x:50,y:25}` ; `b` → `{x:0,y:100}` (la boîte de `a` démarre à (0,0), celle de `b` à y=100) |
| enfant `rotation 90` | la boîte (AABB) est utilisée |
| enfant non borné (classe de test `localBounds` null) | absent de la map |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/layout.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): group layout computation (T133)`

## Suivante
`T134-engine-sim-group-actions`
