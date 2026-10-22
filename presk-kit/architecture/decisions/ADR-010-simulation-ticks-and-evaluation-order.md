# ADR-010-simulation-ticks-and-evaluation-order
**Simulation par ticks, rejeu déterministe** · Réf spec : §7.3, §6.5, §6.6

## Contexte
La spec exige : évaluation à chaque frame dans l'ordre de déclaration, cibles d'`animate` figées au démarrage, cycles tolérés (la valeur avance d'un cran), liaisons coupées à la fin de scène. Cela suppose un état qui évolue, pas une fonction pure du temps.

## Décision
- `Simulation` détient un `World` et un temps courant. `seek(t)` : si `t` < temps courant → `reset()` (retour à l'état post-`create`) puis avance. **Pas d'état caché hors du `World`** → le rejeu est déterministe.
- On avance par **ticks**. Les instants de tick = grille `k / fps` (fps par défaut 60) ∪ `start` de chaque action ∪ `end` de chaque action finie, jusqu'à `min(t, durée)`. Les instants de début/fin d'action sont donc évalués **exactement**.
- À chaque tick `τ`, deux phases :
  - **Phase F (finalisation)** : pour chaque mécanisme actif **fini** avec `end ≤ τ`, dans l'ordre de déclaration : écrire sa valeur finale exacte, puis le désactiver.
  - **Phase U (mise à jour)** : pour chaque action dans l'ordre de déclaration : si `start ≤ τ` et pas encore démarrée → l'**activer** (capture des cibles, prise de propriété, exécution du `set`, etc.) ; puis, si elle porte un mécanisme actif → l'**évaluer** à `τ`.
- Un `animate` fige sa cible à l'activation (§7.3) ; un `bind` réévalue à chaque tick ; un `travel` réévalue son chemin à chaque tick.
- Cycles de `bind` : aucune détection. Chaque tick lit les valeurs courantes (la valeur avance d'un cran **par tick**).
- À `τ = durée` : on exécute le tick, puis tous les mécanismes encore actifs sont coupés.
- Pas de snapshots intermédiaires dans cette version (rejeu depuis 0) ; optimisation future.

## Alternatives écartées
Tweens purs `render(progress)` (legacy) : incompatibles avec `bind` par frame, prise de propriété, infinis.

## Conséquences
`KTimer`/`KTween` sont supprimés à la bascule. `Simulation.seek` coûte O(t × fps) au pire : acceptable pour la v1.
