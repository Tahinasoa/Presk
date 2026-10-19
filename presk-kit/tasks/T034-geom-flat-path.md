# T034-geom-flat-path
**Phase** P2 · **Dépend de** : T030-geom-vec · **Réf spec** : §8.2, §8.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-geom.md (section flatPath.ts)`
- `architecture/decisions/ADR-013-paths-and-travel.md`

## Objectif
Créer la classe `FlatPath` (sans les fonctions `flatten*`, T035).

## Fichiers
- créer : `core/src/geom/flatPath.ts`
- créer : `core/src/geom/flatPath.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T034.1 Écris les tests (cas ci-dessous).
T034.2 Constructeur : copie les points ; calcule `segments` (pour `closed`, ajoute le segment dernier→premier) et le tableau des **longueurs cumulées** `cum[i]` (début du segment `i`) ; `length`.
T034.3 `pointAt(t)` : si `closed` → `t = ((t % 1) + 1) % 1` ; sinon `t = clamp(t,0,1)`. `d = t × length`. Cherche le segment `i` tel que `cum[i] ≤ d ≤ cum[i+1]` (recherche linéaire OK ; pour `d == length` ouvert → dernier segment, fraction 1). Interpole. Longueur 0 → premier point.
T034.4 `angleAt(t)` : même recherche mais, si `d` tombe **exactement** sur un sommet (tolérance 1e-9), prends le segment **suivant** (sortant), sauf `d == length` (ouvert) → dernier segment. Ignore les segments de longueur < 1e-12 (prends le suivant non nul). Retour `radToDeg(atan2(dy,dx))`.
T034.5 `sub(from,to)` : renvoie `[pointAt(from), ...sommets strictement entre, pointAt(to)]` (sans doublon consécutif identique).

## Cas de test (à écrire AVANT le code)
Chemin carré fermé `P = [(0,0),(10,0),(10,10),(0,10)]` (longueur 40) :
| appel | attendu |
|---|---|
| `length` | 40 |
| `pointAt(0)` / `pointAt(0.125)` / `pointAt(0.25)` / `pointAt(0.5)` | (0,0) / (5,0) / (10,0) / (10,10) |
| `pointAt(1)` / `pointAt(1.25)` / `pointAt(-0.75)` | (0,0) / (10,0) / (10,0)  (modulo 1) |
| `angleAt(0)` / `angleAt(0.25)` / `angleAt(0.5)` / `angleAt(0.75)` | 0 / 90 / 180 / −90 (segment sortant) |
Chemin ouvert `[(0,0),(10,0),(10,10)]` (longueur 20) :
| `pointAt(1)` / `pointAt(2)` / `pointAt(-1)` | (10,10) / (10,10) / (0,0) (clamp) |
| `angleAt(1)` | 90 (dernier segment) |
| `angleAt(0.5)` | 90 (sommet : segment sortant) |
| `sub(0.25, 0.75)` | `[(5,0),(10,0),(10,5)]` |
Dégénérés : `new FlatPath([{x:3,y:4}], false)` → `length` 0, `pointAt(0.5)` = (3,4), `angleAt(0)` = 0.

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/geom/flatPath.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(geom): FlatPath arc-length parametrisation (T034)`

## Suivante
`T035-geom-flatten-shapes`
