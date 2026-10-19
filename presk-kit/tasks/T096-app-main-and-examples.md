# T096-app-main-and-examples
**Phase** P5 · **Dépend de** : T095-app-presk-facade · **Réf spec** : §2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md`
- `architecture/00-overview.md`

## Objectif
Créer la démo sur le nouveau moteur et pointer `index.html` dessus. Le legacy n'est pas encore supprimé.

## Fichiers
- créer : `core/src/app/examples.ts`
- créer : `core/src/app/main.ts`
- modifier : `core/index.html (src du script uniquement)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T096.1 `examples.ts` : exporte `HELLO: unknown` = exactement ce document :
```json
{"version":"1.0","scene":{"width":1280,"height":720,"background":"#101014"},"steps":[
 {"action":"create","target":"title","type":"text","properties":{"text":"Presk","fontSize":64,"color":"white","pos":{"x":100,"y":100}}},
 {"action":"create","target":"box","type":"rectangle","properties":{"width":200,"height":80,"fill":"#3b82f6","topLeft":"title.bottomLeft"}},
 {"action":"animate","target":"title","properties":{"reveal":true}},
 {"action":"animate","target":"box","properties":{"reveal":true},"start":"<0.3"},
 {"action":"animate","target":"box","properties":{"x":600},"duration":2,"ease":"cubicInOut"}
]}
```
Durée attendue : 2,8 s (titre 0→0,5 ; boîte 0,3→0,8 ; déplacement 0,8→2,8).
T096.2 `main.ts` : `import "../style.css"` ; `const presk = await Presk.create({root:"#app"})` ; `await presk.load(HELLO)` ; reprend la logique de contrôles du `main.ts` legacy (`#play-button`, `#pause-button`, `#timeline-cursor`, `#timeline-time`) : `max = duration` ; `input` → `pause()` + `renderAt(valeur)` ; `onFrame` met à jour curseur et texte `t.toFixed(2) / duration.toFixed(2) s`. En cas d'erreur de compilation : affiche `error.diagnostics` (code + message) dans `console.error` et dans un `<pre>` ajouté au `<body>`.
T096.3 Dans `core/index.html`, remplace **uniquement** `src="/src/main.ts"` par `src="/src/app/main.ts"`.
T096.4 Vérifie la compilation : `pnpm exec tsc --noEmit`. **Contrôle humain** (note-le dans BACKLOG › « Contrôles humains ») : `pnpm dev`, ouvrir la page : le titre apparaît en fondu, le rectangle apparaît puis glisse à droite, play/pause/curseur fonctionnent.

## Cas de test (à écrire AVANT le code)
Aucun test automatique. Le contrôle visuel est fait par l'humain (BACKLOG › Contrôles humains).

## Ne pas toucher
Tout fichier legacy (`src/main.ts`, `src/presk.ts`, …) : ils seront supprimés en T097/T098.

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(app): new demo entry point on the v1.0 engine (T096)`

## Suivante
`T097-delete-legacy-top-layers`
