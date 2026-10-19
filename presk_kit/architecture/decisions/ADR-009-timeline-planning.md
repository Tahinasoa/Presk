# ADR-009-timeline-planning
**Planification de la timeline** · Réf spec : §6

## Contexte
Le code utilise une logique GSAP (`cursor`, `+=`). La spec définit des règles précises.

## Décision
- `create` n'est pas sur la timeline (§4.1) ; seules les autres actions sont planifiées, **dans l'ordre de `steps`**.
- `start` omis = `">"` = **fin de l'action précédente** (la précédente dans `steps`, hors `create`) ; première action : 0. Si la précédente est infinie : `E_START_REF_INFINITE_END`.
- Formes de `start` : voir `C-lang-start.md`. Référence à un nom : le nom doit être déclaré par une action **plus haut** dans `steps` (Q8). Sans action précédente, `<` et `>` valent 0.
- Instants arrondis à 1e-9. `start` < 0 → `E_START_NEGATIVE`.
- Fin : `set/bind/unbind/stop/ungroup` : `end = start` ; `animate/travel/group` : `end = start + duration × repeat` ; `repeat: "infinite"` → `end = Infinity`.
- Durée d'un `animate` : `duration` explicite ; si seulement des effets : durée par défaut de l'effet (max s'il y en a plusieurs) ; sinon `E_DURATION_MISSING`.
- Durée de scène = max des fins **finies** (≥ 0). Une action infinie avec `start ≥ durée` → `E_INFINITE_NEVER_PLAYED`.
- `travel` avec `speed` : durée = longueur du chemin (état **après tous les `create`**, voir Q7) / vitesse.

## Alternatives écartées
Calcul dynamique des débuts à l'exécution : rend la durée de scène inconnue avant simulation.

## Conséquences
Le planning est une fonction pure (testable sans modèle) sauf pour la longueur de chemin (callback).
