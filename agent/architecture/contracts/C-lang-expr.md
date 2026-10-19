# C-lang-expr — `core/src/lang/expr/`

Fichiers : `tokenizer.ts`, `ast.ts`, `parser.ts`. Réf spec §7.1–§7.4. ADR-007.

```ts
// ast.ts
export type BinaryOp = "+" | "-" | "*" | "/";
export interface RefSegment { name: string; index?: number }          // vertex[1] -> { name: "vertex", index: 1 }
export type Expr =
  | { kind: "num"; value: number }
  | { kind: "neg"; operand: Expr }
  | { kind: "bin"; op: BinaryOp; left: Expr; right: Expr }
  | { kind: "ref"; object: string; path: RefSegment[] }               // path.length >= 1
  | { kind: "pathFn"; object: string; fn: "pathX" | "pathY" | "pathAngle"; pathName: string; t: number };

// tokenizer.ts
export type Token =
  | { type: "num"; value: number; pos: number } | { type: "ident"; value: string; pos: number }
  | { type: "op"; value: BinaryOp; pos: number }
  | { type: "dot" | "lbracket" | "rbracket" | "lparen" | "rparen" | "comma"; pos: number };
export type TokenizeResult = { ok: true; tokens: Token[] } | { ok: false; message: string; pos: number };
export function tokenize(source: string): TokenizeResult;

// parser.ts
export type ParseResult = { ok: true; expr: Expr } | { ok: false; message: string };
export function parseExpression(source: string): ParseResult;
```

## Règles
- Espaces ignorés entre jetons. Nombres : `\d+(\.\d+)?` (pas de `.5`, pas de `5.`, pas d'exposant). Identifiants : `[A-Za-z_][A-Za-z0-9_]*`.
- Précédence : `*` `/` avant `+` `-`, associativité gauche. `-` unaire : `-x`, `a - -b`, `--3` valides.
- `ref` : `ident ('.' segment)+` ; **au moins un segment** (`"title"` seul → erreur de syntaxe). `segment` : `ident` ou `ident '[' entier ']'`.
- `pathFn` : `ident '.' ('pathX'|'pathY'|'pathAngle') '(' ident ',' ['-'] nombre ')'`. `t` est un **littéral** (pas d'expression).
- Une chaîne vide ou avec jeton en trop (`"1 2"`, `"a.b c"`) → erreur de syntaxe. Aucune parenthèse de regroupement : `"(1+2)"` → erreur.
- Le parseur ne décide **pas** si un `ref` est scalaire ou point (c'est l'analyse, T060).

## Exemples
| Source | AST (abrégé) |
|---|---|
| `"20"` | num 20 |
| `"title.topRight.x + 20"` | bin + (ref title [topRight,x]) (num 20) |
| `"a.width / 2 - 1"` | bin − (bin / (ref a [width]) (num 2)) (num 1) |
| `"-b.x"` | neg (ref b [x]) |
| `"t.vertex[1].y"` | ref t [{vertex,1},{y}] |
| `"circuit.pathAngle(main, 0.5) + 90"` | bin + (pathFn circuit pathAngle main 0.5) (num 90) |
| `"orbit.pathX(main, -0.25)"` | pathFn … t −0.25 |
| `"title"`, `"a."`, `".x"`, `"a.b["`, `"a.b[x]"`, `"1 +"`, `"(1)"`, `"a.pathX(main)"`, `"a.pathX(main, b.x)"` | erreur |
