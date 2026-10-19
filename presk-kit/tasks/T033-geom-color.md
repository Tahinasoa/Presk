# T033-geom-color
**Phase** P2 · **Dépend de** : T030-geom-vec · **Réf spec** : §11.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-geom.md (section color.ts)`
- `architecture/decisions/ADR-019-colors-and-literals.md`

## Objectif
Créer `geom/color.ts`.

## Fichiers
- créer : `core/src/geom/color.ts`
- créer : `core/src/geom/color.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T033.1 Écris les tests, puis `parseColor` et `lerpColor`. La table des noms est dans `C-geom.md` : recopie-la dans un `Record<string, number>`.

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| `parseColor("#ff0000")` / `"#FF0000"` / `"#f00"` | `0xff0000` |
| `parseColor("#888")` | `0x888888` |
| `parseColor("blue")` / `"Blue"` | `0x0000ff` |
| `parseColor(0x9c9c9c)` / `parseColor(0)` | `0x9c9c9c` / `0` |
| `parseColor("#ff")`, `"#gggggg"`, `"#1234567"`, `"nope"`, `-1`, `0x1000000`, `1.5`, `null`, `{}` | `null` |
| `lerpColor(0x000000,0xffffff,0.5)` | `0x808080` (arrondi : 127.5 → 128) |
| `lerpColor(0xff0000,0x0000ff,0)` / `1` | `0xff0000` / `0x0000ff` |
| `lerpColor(0x000000,0xffffff,1.5)` | `0xffffff` (canaux clampés 0..255) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/geom/color.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(geom): color parsing and interpolation (T033)`

## Suivante
`T034-geom-flat-path`
