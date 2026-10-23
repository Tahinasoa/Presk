# T156-final-audit
**Phase** P9 · **Dépend de** : T155-move-easing-to-lang · **Réf spec** : §12

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `language/Presk — Spécification v1.0.md (relire §12)`
- `architecture/gap-analysis.md`

## Objectif
Vérifier mécaniquement l'état final et préparer le contrôle humain. Aucun code.

## Fichiers
- modifier : `BACKLOG.md (section « Contrôles humains » uniquement)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T156.1 Lance `pnpm exec tsc --noEmit`, `pnpm exec vitest run` (note le total), `pnpm exec vitest run src/__arch__`.
T156.2 `grep -rn "LEGACY\|TODO\|FIXME\|console.log" core/src --include=*.ts | grep -v test` : liste les occurrences dans BACKLOG › Journal (ne corrige rien).
T156.3 Vérifie qu'il ne reste dans `core/src` que `__arch__ app engine geom lang model view style.css`.
T156.4 Recopie dans BACKLOG › « Contrôles humains » la liste à faire par l'humain : (1) `pnpm dev`, jouer `HELLO` ; (2) zoom `focusOn` ; (3) `reveal:"draw"` sur une `curve` ; (4) un document volontairement faux affiche bien les diagnostics ; (5) relire `architecture/open-questions.md` (Q1–Q23).
T156.5 Écris `TERMINÉ` dans BACKLOG › Reprise.

## Cas de test (à écrire AVANT le code)
Résultats attendus : 0 erreur tsc ; 0 échec vitest ; arborescence conforme.

## Ne pas toucher
Tout le code source.

## Validation
```
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`chore: final audit report (T156)`

## Suivante
*(fin du backlog : écrire TERMINÉ)*
