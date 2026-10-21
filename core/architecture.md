> ⚠️ PÉRIMÉ — décrit la v0.1 du moteur. Source de vérité : `language/Presk — Spécification v1.0.md`. Ne pas utiliser pour décider.

# KTimer architecture

KTimer calls scheduled tween functions at the right time. The compiler converts relative timeline positions to absolute times and resolves temporal dependencies.

The timeline initializes tweens in order: each tween is initialized, rendered to its endpoint, and then the next tween is initialized. KTimer rewinds to time zero after this initialization pass. Tween state is derived from time and captured start values, so seeking does not depend on an external animation scheduler.
