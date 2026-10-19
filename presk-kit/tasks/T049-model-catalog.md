# T049-model-catalog
**Phase** P3 · **Dépend de** : T047-model-text-object, T048-model-scene-root · **Réf spec** : §1 principe 6

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-model-core.md (section Catalog)`
- `architecture/decisions/ADR-008-class-catalog-and-prop-specs.md`

## Objectif
Créer `Catalog` et `createDefaultCatalog()` (scene, rectangle, text pour l'instant).

## Fichiers
- créer : `core/src/model/catalog.ts`
- créer : `core/src/model/defaultCatalog.ts`
- créer : `core/src/model/catalog.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T049.1 Écris les tests (cas ci-dessous).
T049.2 `Catalog` : `Map<string, ClassDef>` ; `register` lève `Error` si le type existe déjà ; `types()` renvoie les types triés alphabétiquement.
T049.3 `defaultCatalog.ts` : `createDefaultCatalog()` crée un `Catalog` et appelle `register` **une ligne par classe** : `SCENE_DEF`, `RECTANGLE_DEF`, `TEXT_DEF`. (Chaque nouvelle classe ajoutera sa ligne.)

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| `createDefaultCatalog().types()` | `["rectangle","scene","text"]` |
| `get("text")?.family` | `"rectangle"` ; `get("nope")` undefined ; `has("scene")` vrai |
| `get("scene")?.creatable` | false ; `get("rectangle")?.creatable` true |
| `register(RECTANGLE_DEF)` deux fois | lève |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/catalog.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): class catalog (T049)`

## Suivante
`T060-engine-program-types`
