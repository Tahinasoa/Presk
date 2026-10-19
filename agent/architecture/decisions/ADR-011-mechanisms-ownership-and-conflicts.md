# ADR-011-mechanisms-ownership-and-conflicts
**Mécanismes, propriété des clés, conflits** · Réf spec : §9

## Contexte
`animate`, `travel`, `bind` ne peuvent piloter la même propriété simultanément ; la dernière action déclarée prend la main ; la précédente se fige.

## Décision
- Chaque clé de base (`"x"`, `"rotation"`…) d'un objet a au plus **un propriétaire** (mécanisme actif).
- Activer `set`/`animate`/`travel`/`bind` sur des clés `K` : pour chaque clé de `K`, l'ancien propriétaire **perd** la clé (valeur gelée à sa dernière écriture). Un mécanisme sans clé restante est désactivé.
- Les clés viennent de `PropSpec.writes` (équivalences §9.4). `travel` : `x`,`y` (+ `rotation` si `orient`). Un **effet** n'a pas de clé de base (pas de conflit, §5.4) mais le suivi d'actions `stop` utilise la pseudo-clé `@<effet>` (ex. `@reveal`).
- Validation à la compilation (`engine/analyze/activity.ts`) : `stop` sans `animate`/`travel` actif, `unbind` sans `bind` actif, `stop` sur un `bind`, `unbind` sur un `animate`, `stop x` seul pendant un `travel` → erreurs `E_*`. L'activité est calculée sur le planning statique (début, fin, prises de propriété), ordre (start, déclaration).
- `stop`/`unbind` : la propriété reste à sa valeur courante.

## Alternatives écartées
Conflit résolu par dernier écrivain implicite sans suivi : `stop` ne peut pas être validé.

## Conséquences
La logique d'ownership existe deux fois (analyse statique + exécution). Les tests dorés (T079) vérifient leur accord.
