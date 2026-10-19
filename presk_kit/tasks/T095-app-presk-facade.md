# T095-app-presk-facade
**Phase** P5 · **Dépend de** : T094-view-sync, T079-engine-simulation · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md (section Façade)`
- `architecture/decisions/ADR-010-simulation-ticks-and-evaluation-order.md`
- `architecture/decisions/ADR-014-ports-text-measurer-and-images.md`

## Objectif
Créer la façade publique `Presk` du nouveau moteur.

## Fichiers
- créer : `core/src/app/presk.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T095.1 `class Presk` : constructeur privé ; `static async create(opts: {root: string; fps?: number}): Promise<Presk>` : crée `PixiHost`, `PixiTextMeasurer`, `createDefaultCatalog()`, `createDefaultViewRegistry()`.
T095.2 `async load(raw: unknown): Promise<void>` : détruit `viewSync`/`sim` précédents ; `program = compileProgram(raw, {catalog, objectEnv})` (**les erreurs se propagent**) ; `host.init(...)` la première fois, `host.resize(...)` ensuite, avec `program.scene` ; `sim = new Simulation(program, {catalog, objectEnv, fps})` ; `viewSync = new ViewSync(sim.world, registry, host)` ; `renderAt(0)`.
T095.3 `renderAt(t)` : `sim.seek(t)` ; `viewSync.syncAll()` ; `time = sim.time` ; appelle les callbacks `onFrame`.
T095.4 `play()` : mémorise `startWall = performance.now() − time×1000` ; boucle `requestAnimationFrame` : `t = (now − startWall)/1000` ; si `t >= duration` : `renderAt(duration)` puis `pause()` ; sinon `renderAt(t)`. `pause()` : annule la boucle. `get duration()`, `get time()`, `onFrame(cb)`.
T095.5 Pas de logique de rendu ici : seulement du câblage.

## Cas de test (à écrire AVANT le code)
Pas de test unitaire (PixiJS a besoin d'un canvas). Validation = `tsc` + test d'architecture.

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(app): Presk facade (T095)`

## Suivante
`T096-app-main-and-examples`
