# ADR-007-expression-pipeline-parse-analyze-evaluate
**Expressions : parser, analyser, évaluer** · Réf spec : §7

## Contexte
Le code actuel parse et évalue en une passe et accède aux propriétés par réflexion. La spec veut des erreurs à la compilation (point en arithmétique, segment inconnu…).

## Décision
Trois étapes séparées :
1. **Parse** (`lang/expr`) : texte → AST `Expr`, sans connaître les objets. Erreurs de syntaxe seulement.
2. **Analyse** (`engine/analyze`) : AST + catalogue + types des objets déclarés → `ExprType` (`scalar` | `point`) + liste des objets lus ; erreurs sémantiques (`E_EXPR_*`).
3. **Compilation** en **closure** `(world) => number | Pt`, évaluée au moment défini par §7.3.

Grammaire : `expr := term (('+'|'-') term)*`, `term := unary (('*'|'/') unary)*`, `unary := '-' unary | atom`, `atom := number | ref | pathFn`.
`ref := ident ('.' segment)+`, `segment := ident ('[' integer ']')?`, `pathFn := ident '.' ('pathX'|'pathY'|'pathAngle') '(' ident ',' signedNumber ')'`.
Pas de parenthèses de regroupement. `-` unaire autorisé (spec silencieuse, voir Q5). Nombres : `\d+(\.\d+)?`.

**Une chaîne JSON est une expression seulement si le type de la propriété est `number` ou `point`** (ADR-008). Pour `string`, `color`, `enum`, c'est un littéral. Plus d'heuristique par regex.

## Alternatives écartées
AST évalué directement par réflexion sur l'objet : permet `title.left`, interdit par la spec.

## Conséquences
Les erreurs de §7.5 sont détectées à la compilation. `scene` est un identifiant d'objet comme un autre (réservé).
