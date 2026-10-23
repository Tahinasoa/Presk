# T080-engine-golden-core
**Phase** P4 · **Dépend de** : T079-engine-simulation · **Réf spec** : §2–§9

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-018-testing-strategy.md`
- `architecture/contracts/C-engine-runtime.md`

## Objectif
Verrouiller le comportement du noyau par des documents JSON v1.0 minuscules et des états attendus à des instants précis.

## Fichiers
- créer : `core/src/engine/golden/core.golden.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T080.1 Crée un helper local `run(doc, t)` : `compileProgram` → `new Simulation` → `seek(t)` → renvoie la simulation. Écris **un `it` par ligne** du tableau ci-dessous. Chaque document est de la forme `{ version:"1.0", scene:{width:800,height:600}, steps:[…] }` ; `R(id,props)` = `{action:"create",target:id,type:"rectangle",properties:props}`.
T080.2 Si un attendu ne se vérifie pas, **ne modifie pas l'attendu** : passe en `FAILED` avec l'écart (les attendus viennent de la spec).

## Cas de test (à écrire AVANT le code)
| # | steps | instant | attendu |
|---|---|---|---|
| G1 | `R(a,{x:0})` ; `animate a {x:100} d2 linear` | 1 | `a.x` = 50 |
| G2 | `R(a,{x:0,y:0})` ; `animate a {x:100} d1` ; `animate a {y:50} d1` (linear, sans start) | 1.5 | x 100, y 25 |
| G3 | `R(a,{x:0})` ; `R(b,{x:200})` ; `animate b {x:400} d2 linear` ; `bind a {x:"b.x - 50"} start:"<"` ; `unbind a start:1.5` | 1 ; 2 | `a.x` = 250 ; 300 (gelé à 1,5) |
| G4 | `T = {action:create,target:t,type:text,properties:{text:"Hi"}}` ; `animate t {reveal:true} start:1 duration:1 ease:linear` ; `animate t {reveal:false} start:3 duration:1 ease:linear` | 0 ; 1.5 ; 2 ; 3.5 ; 4 | `effectiveAlpha()` de `t` : 0 ; 0.5 ; 1 ; 0.5 ; 0 |
| G5 | `R(a,{x:0})` ; `animate a {x:100} d2` ; `set a {x:0} start:1` | 1 ; 2 | `a.x` = 0 ; 0 |
| G6 | `R(a,{x:0})` ; `animate a {x:100} d4 linear` ; `stop a properties:["x"] start:1` | 1 ; 4 | 25 ; 25 |
| G7 | `R(a,{x:0})` ; `animate a {x:100} d1 repeat:2 repeatMode:yoyo linear` | 0.5 ; 1.25 ; 1.5 ; 2 | 50 ; 75 ; 50 ; 0 |
| G8 | `R(b,{x:"a.x"})` puis `R(a,{})` | (compilation) | lève `PreskCompileError` avec `E_FORWARD_REFERENCE` |
| G9 | `T(title,text "Hello" fontSize 10 x 100 y 100)` ; `R(sub,{topLeft:"title.bottomLeft"})` | 0 | `sub.x` 100, `sub.y` 112 (texte 30×12 avec `FakeTextMeasurer`) |
| G10 | `animate zzz {x:1} duration 1` **et** `create a type:"hexagon"` | (compilation) | `PreskCompileError` contenant `E_OBJECT_UNKNOWN` **et** `E_TYPE_UNKNOWN` |
| G11 | **steps exacts** : `[{"action":"create","target":"a","type":"rectangle","properties":{"x":0}},{"action":"animate","target":"a","properties":{"x":10},"duration":1},{"action":"animate","target":"a","properties":{"x":20},"duration":1,"start":"<0.5"}]` (conflit : le 2ᵉ prend la main à 0,5) | 0.5 ; 1.5 | `a.x` = **5** ; **20** (à 0,5 : 1ᵉʳ animate = 5 ; le 2ᵉ démarre de 5 vers 20, fin à 1,5) |
| G12 | `R(a,{scale:2,pivot:"topLeft",x:10,y:20})` — un rectangle par défaut fait **100×100** | 0 | `readProp("topLeft")` = (10,20) ; `bottomRight` = **(210,220)** |
| G13 | **steps exacts** : `[{"action":"create","target":"a","type":"rectangle","properties":{"x":0}},{"action":"animate","target":"a","properties":{"x":100},"duration":1},{"action":"animate","target":"a","properties":{"x":"a.x + 10"},"duration":1,"start":"<0.5"}]` | 1.5 | `a.x` = **60** (cible figée à t=0,5 : 50 + 10) |

## Ne pas toucher
Tout fichier source. Cette tâche n'ajoute que le test doré.

## Validation
```
cd core && pnpm exec vitest run src/engine/golden/core.golden.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`test(engine): golden tests for the language core (T080)`

## Suivante
`T090-view-pixi-host`
