# ADR-016-scene-view-viewport
**Vue de la scène (viewport, zoom)** · Réf spec : §3.5

## Contexte
`scene` est la cible de `focusOn`, `focusMargin`, `view`, `zoom`.

## Décision
- L'objet `scene` porte l'état de vue `viewCx`, `viewCy`, `viewZoom` (défaut : centre de la scène, zoom 1). `focusOn`, `view`, `zoom` écrivent tous **les trois mêmes clés** (donc en conflit entre eux) ; `focusMargin` accompagne `focusOn` (clé séparée `viewMargin`).
- La région visée est toujours ramenée au **ratio de la scène** en agrandissant le petit côté autour du même centre.
- `animate` : centre interpolé linéairement, zoom **géométriquement** (`z = z0 × (z1/z0)^p`). `bind focusOn` : région recalculée à chaque tick.
- `scene.view.<ancre>`, `scene.view.width/height` : lecture de la vue courante (T143).
- La vue n'est appliquée que par `view/` : transformation du conteneur monde (scale = zoom, position = −topLeft × zoom).
- Erreurs : voir `C-lang-diagnostics.md` (`E_VIEW_*`, `E_SCENE_*`).

## Alternatives écartées
Caméra comme objet distinct : la spec la rattache à `scene`.

## Conséquences
Phase P8, après la bascule ; n'affecte pas le reste.
