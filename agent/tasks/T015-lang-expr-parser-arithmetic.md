# T015-lang-expr-parser-arithmetic
**Phase** P1 · **Dépend de** : T014-lang-expr-tokenizer · **Réf spec** : §7.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-lang-expr.md`

## Objectif
Créer l'AST et le parseur pour les nombres, `-` unaire et les 4 opérateurs avec précédence. Les références viennent en T016.

## Fichiers
- créer : `core/src/lang/expr/ast.ts`
- créer : `core/src/lang/expr/parser.ts`
- créer : `core/src/lang/expr/parser.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T015.1 Crée `ast.ts` : recopie les types `BinaryOp`, `RefSegment`, `Expr` de `C-lang-expr.md`.
T015.2 Crée `parser.ts` : `ParseResult` et `parseExpression(source)`. Utilise `tokenize`. Descente récursive : `parseExpr` (`+ -`, gauche), `parseTerm` (`* /`, gauche), `parseUnary` (`-` → `{kind:"neg"}`), `parseAtom` (nombre ; pour l'instant tout identifiant → `{ok:false}` « references not supported yet »). Après l'expression, s'il reste des jetons → erreur.
T015.3 Écris `parser.test.ts` avec les cas ci-dessous (AST exact via `toEqual`).

## Cas de test (à écrire AVANT le code)
| source | résultat |
|---|---|
| `"20"` | `{kind:"num",value:20}` |
| `"1 + 2 * 3"` | bin + (num 1) (bin * (num 2)(num 3)) |
| `"8 / 2 / 2"` | bin / (bin / 8 2) 2  (associativité gauche) |
| `"1 - 2 - 3"` | bin − (bin − 1 2) 3 |
| `"-5"` | neg (num 5) |
| `"2 - -3"` | bin − (num 2) (neg (num 3)) |
| `"--3"` | neg (neg 3) |
| `""`, `"1 +"`, `"* 2"`, `"1 2"`, `"(1)"` | `ok:false` |

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
`feat(lang): expression parser, arithmetic part (T015)`

## Suivante
`T016-lang-expr-parser-references`
