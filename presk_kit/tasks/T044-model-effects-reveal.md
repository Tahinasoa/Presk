# T044-model-effects-reveal
**Phase** P3 · **Dépend de** : T041-model-scene-object, T040-model-values-ports-effect-types · **Réf spec** : §5.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-model-effects.md`
- `architecture/decisions/ADR-012-effects-reveal-presence.md`

## Objectif
Implémenter `REVEAL_FADE` et `revealWithDraw()`.

## Fichiers
- modifier : `core/src/model/effects.ts`
- créer : `core/src/model/effects.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T044.1 Écris les tests (cas ci-dessous).
T044.2 Ajoute à `effects.ts` : `REVEAL_FADE` (variants `["default"]`, `defaultDuration 0.5`, `defaultEase "cubicOut"`, `touches ["presence"]`, `apply` : `presence = clamp(p,0,1)` ; variante inconnue → `Error` interne).
T044.3 `revealWithDraw()` : variants `["default","draw"]`, mêmes durée/ease, `touches ["presence","drawProgress"]`. `default` : `presence = clamp(p)`. `draw` : `presence = p > 0 ? 1 : 0` et `drawProgress = clamp(p)`.

## Cas de test (à écrire AVANT le code)
Objet de test avec état initial `presence:0, drawProgress:1` :
| appel | attendu |
|---|---|
| `REVEAL_FADE.apply(o,"default",0.5)` | `presence` 0.5 |
| `apply(o,"default",-1)` / `2` | presence 0 / 1 |
| `REVEAL_FADE.apply(o,"draw",1)` | lève |
| `revealWithDraw().apply(o,"draw",0)` | presence 0, drawProgress 0 |
| `.apply(o,"draw",0.3)` | presence 1, drawProgress 0.3 |
| `.apply(o,"default",0.4)` | presence 0.4 (drawProgress inchangé) |
| `REVEAL_FADE.variants` | `["default"]` ; `revealWithDraw().variants` `["default","draw"]` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/effects.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): reveal effects (T044)`

## Suivante
`T045-model-rectangle-object`
