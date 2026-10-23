# T163-colour-migration-audit
**Phase** P10 · **Dépend de** : T162-model-string-colour-defaults · **Réf spec** : §11.3 (extension : alpha, Q24)

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-021-colours-canonical-strings-with-alpha.md`
- `architecture/decisions/ADR-022-colour-rendering-contract.md`

## Objectif
Retirer le support transitoire des nombres dans l'**état**, vérifier qu'aucun résidu ne subsiste, préparer le contrôle humain. La documentation du kit est mise à jour par l'architecte, pas par toi.

## Fichiers
- modifier : `core/src/model/sceneObject.ts, core/src/model/sceneObject.test.ts`
- modifier : `BACKLOG.md (Journal et Contrôles humains uniquement)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T163.1 Dans `getColor` : **supprime la branche « nombre »** : l'état ne contient plus que des chaînes canoniques. Un nombre dans l'état doit maintenant lever. Mets à jour `sceneObject.test.ts` : la ligne « `fill: 0x9c9c9c` → `"#9c9c9c"` » devient « lève ».
T163.2 `parseColor` **garde** l'entier en entrée (documents) : ne le retire pas.
T163.3 Cherche les résidus (PowerShell) : `Get-ChildItem core/src -Recurse -Filter *.ts | Select-String 'getNumber\("(fill|stroke|color)"\)|parseColorCanonical|lerpColorCanonical|0x9c9c9c|0xffffff|as number'`. Les seules occurrences légitimes : `0xffffff` dans la table `NAMED_COLORS` (`white`), les cas d'**entrée** de `color.test.ts` et `value.test.ts`, le repli `fill: 0xffffff` de `textView.ts`. Pour **chaque** `as number` restant près d'une couleur : supprime-le. Recopie la liste des occurrences restantes et leur justification dans BACKLOG › Journal.
T163.4 Vérifie qu'aucun fichier hors de ce périmètre n'a été modifié par les tâches T157–T162 : `git diff --stat <commit avant T157> HEAD` ; signale dans le Journal tout fichier inattendu.
T163.5 Ajoute dans BACKLOG › « Contrôles humains » : (1) `pnpm dev` : `HELLO` identique à avant ; (2) un rectangle `fill:"#ff000080"` avec `opacity:0.5` : s'il apparaît à environ **25 %** d'opacité, Pixi multiplie bien alpha de couleur et opacité d'objet (Q26) ; (3) `animate fill` rouge → bleu : fondu continu, aucun noir ou transparent soudain.

## Cas de test (à écrire AVANT le code)
| situation | attendu |
|---|---|
| `getColor` avec état `fill: 0x9c9c9c` | lève (plus de nombres dans l'état) |
| `getColor` avec état `fill: "#9c9c9c"` | `"#9c9c9c"` |
| document avec `fill: 65280` (entier JSON) | compile ; l'état contient `"#00ff00"` |
| recherche de résidus | uniquement les occurrences légitimes listées |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/sceneObject.test.ts src/model/colorDefaults.test.ts src/engine/golden/colors.golden.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`chore: drop numeric colours from state and audit (T163)`

## Suivante
*(fin du backlog : écrire TERMINÉ)*
