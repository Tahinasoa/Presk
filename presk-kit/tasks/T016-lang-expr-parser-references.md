# T016-lang-expr-parser-references
**Phase** P1 · **Dépend de** : T015-lang-expr-parser-arithmetic · **Réf spec** : §7.1, §7.4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-lang-expr.md`

## Objectif
Ajouter au parseur les références (`obj.seg.seg`, `vertex[1]`) et `pathX/pathY/pathAngle`.

## Fichiers
- modifier : `core/src/lang/expr/parser.ts`
- modifier : `core/src/lang/expr/parser.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T016.1 Ajoute les cas ci-dessous au test (garde ceux de T015).
T016.2 Dans `parseAtom` : sur `ident`, lis `('.' segment)*`. Un `segment` est un ident, éventuellement suivi de `[` nombre entier `]` → `RefSegment{name,index}`. Moins d'un segment → erreur `"reference needs a property"`.
T016.3 Si le **dernier** segment lu est `pathX`, `pathY` ou `pathAngle` **et** est suivi de `(` : c'est un `pathFn`. Il doit avoir exactement 1 segment avant (`obj.pathX(...)`), puis `(` ident `,` [`-`] nombre `)`. `t` négatif autorisé. Sinon erreur.
T016.4 Un indice doit être un entier ≥ 0 (pas de `1.5`, pas de `-1`).

## Cas de test (à écrire AVANT le code)
| source | résultat |
|---|---|
| `"title.width"` | ref title [width] |
| `"title.topRight.x + 20"` | bin + (ref title [topRight,x]) (num 20) |
| `"t.vertex[1].y"` | ref t [{vertex,index:1},{y}] |
| `"scene.center"` | ref scene [center] |
| `"a.boundingBox.center.y - 100"` | bin − (ref a [boundingBox,center,y]) (num 100) |
| `"c.pathAngle(main, 0.5) + 90"` | bin + (pathFn c pathAngle main 0.5)(num 90) |
| `"o.pathX(main, -0.25)"` | pathFn o pathX main t=−0.25 |
| `"title"` | erreur |
| `"a."`, `".x"`, `"a.b["`, `"a.b[x]"`, `"a.b[1.5]"`, `"a.b[-1]"` | erreur |
| `"a.pathX(main)"`, `"a.pathX(main, b.x)"`, `"a.b.pathX(main,0)"` | erreur |
| `"a.pathX"` (sans parenthèse) | ref a [pathX] (l'analyse le refusera) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/expr/parser.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): expression parser, references and path functions (T016)`

## Suivante
`T017-lang-validate-shell`
