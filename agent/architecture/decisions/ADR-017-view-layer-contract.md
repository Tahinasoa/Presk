# ADR-017-view-layer-contract
**Contrat de la couche vue** · Réf spec : —

## Contexte
Seule couche autorisée à importer PixiJS ; lit le modèle sans jamais l'écrire.

## Décision
- `ObjectView` : un par objet visible, créé selon le type par un `ViewRegistry` (type → fabrique). Méthodes : `update()` (relit le modèle, pousse vers Pixi), `destroy()`.
- Matrice : `displayObject.setFromMatrix(worldMatrix())`. Dessin en **coordonnées locales** (origine = `pos`).
- Alpha : `object.effectiveAlpha()`. Invisible si alpha ≤ 0.
- Ordre d'affichage : ordre de création des objets (plat, pas de conteneurs imbriqués).
- `ViewSync` : après chaque `simulation.seek(t)`, appelle `update()` sur toutes les vues.
- Les vues ne sont pas testées unitairement (pas de canvas en test). Leur validation = `tsc` + test d'architecture + contrôle humain listé dans le BACKLOG.

## Alternatives écartées
Vue qui mesure et réécrit la taille du modèle (legacy) : interdit.

## Conséquences
Le code de décision (alpha, ancres, fraction de tracé) doit vivre dans `model/` ou `geom/`, testable, pas dans la vue.
