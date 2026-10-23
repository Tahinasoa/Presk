# ADR-004-diagnostics-collect-then-fail
**Erreurs de l'auteur : on collecte, puis on échoue une fois** · Réf spec : §1 principe 5, §12.2

## Contexte
La spec veut « strict plutôt que deviné ». Un document généré par IA a souvent plusieurs erreurs ; les voir toutes d'un coup est précieux.

## Décision
- `lang/` et la compilation **ne lancent pas d'exception** pour une erreur de l'auteur : elles ajoutent un `Diagnostic { severity, code, message, stepIndex?, field? }` à un `DiagnosticCollector`.
- `compileProgram()` renvoie `Program`, ou lève **une seule** `PreskCompileError` portant toutes les diagnostics d'erreur. Les avertissements (`W_*`) sont dans `Program.warnings`.
- Les phases suivantes ne tournent pas si la phase précédente a des erreurs (validation → résolution des étapes → planning → analyse d'activité).
- Les **codes** forment une liste fermée (`C-lang-diagnostics.md`). Les tests assertent sur `code`, jamais sur `message`.

## Alternatives écartées
Lever à la première erreur : oblige l'auteur (ou l'IA) à itérer N fois.

## Conséquences
Une tâche qui a besoin d'un code absent de la liste passe en `BLOCKED` (l'architecte l'ajoute).
