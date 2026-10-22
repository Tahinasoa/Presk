# T014-lang-expr-tokenizer
**Phase** P1 · **Dépend de** : T010-lang-diagnostics · **Réf spec** : §7.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-lang-expr.md`
- `architecture/decisions/ADR-007-expression-pipeline-parse-analyze-evaluate.md`

## Objectif
Transformer le texte d'une expression en jetons.

## Fichiers
- créer : `core/src/lang/expr/tokenizer.ts`
- créer : `core/src/lang/expr/tokenizer.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T014.1 Écris `tokenizer.test.ts` avec les cas ci-dessous.
T014.2 Crée `tokenizer.ts` avec `Token`, `TokenizeResult`, `tokenize`. Parcours caractère par caractère (pas de regex globale) ; ignore les espaces, tabulations, sauts de ligne.
T014.3 Nombre : `\d+` suivi optionnellement de `.` + `\d+` (un `.` non suivi d'un chiffre n'appartient PAS au nombre : `3.` donne `num 3` puis `dot`). Identifiant : `[A-Za-z_][A-Za-z0-9_]*`.
T014.4 Caractère inconnu → `{ ok:false, message:"unexpected character 'c' at 3", pos:3 }`.

## Cas de test (à écrire AVANT le code)
| source | jetons (type:valeur) |
|---|---|
| `"a.b"` | ident:a, dot, ident:b |
| `"title.topRight.x + 20"` | ident, dot, ident, dot, ident, op:+, num:20 |
| `"-3.5*x"` | op:-, num:3.5, op:*, ident:x |
| `"v.vertex[1]"` | ident, dot, ident, dot… ident:vertex, lbracket, num:1, rbracket |
| `"c.pathX(main, -0.5)"` | ident, dot, ident:pathX, lparen, ident:main, comma, op:-, num:0.5, rparen |
| `"  "` | liste vide, ok |
| `"a $ b"` | ok:false, pos:2 |
| `"3."` | num:3, dot |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/expr/tokenizer.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): expression tokenizer (T014)`

## Suivante
`T015-lang-expr-parser-arithmetic`
