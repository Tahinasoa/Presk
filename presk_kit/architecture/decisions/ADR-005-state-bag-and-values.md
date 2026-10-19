# ADR-005-state-bag-and-values
**Un objet = un sac d'état clé/valeur** · Réf spec : §3, §9.4

## Contexte
Il faut : snapshot/restauration (rejeu), accès générique pour `set/animate/bind`, équivalences de propriétés (`pos` = `x`+`y`).

## Décision
- Chaque `SceneObject` stocke son état dans `Record<string, StateValue>` (clés = **clés de base**).
- `StateValue = number | string | boolean | Pt | readonly Pt[]`. Les couleurs sont stockées en **nombre 0xRRGGBB** (ADR-019).
- L'accès DSL passe par des **PropSpec** (ADR-008) : `get/set` + `writes` (clés de base touchées). `pos` écrit `["x","y"]` ; `topLeft` écrit `["x","y"]` ; `start` d'un segment écrit `["p0"]`.
- `snapshot()` fait une copie profonde ; `restore()` la réapplique. La hiérarchie (parent) est restaurée par le `World`.
- Pas de getters/setters TypeScript métier dispersés : tout passe par le sac d'état + PropSpec.

## Alternatives écartées
Champs privés par propriété (comme `KObject`) : impossible de snapshotter/animer génériquement.

## Conséquences
Le catalogue de classes (ADR-008) est la seule source des propriétés valides.
