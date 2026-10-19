# C-view-app — `core/src/view/` et `core/src/app/`

Réf : ADR-014, 017. Seuls dossiers autorisés à importer `pixi.js`.

```
view/pixiHost.ts         PixiHost : Application Pixi, canvas dans le root, conteneur monde, add/remove(Container), setViewport(cx,cy,zoom,sceneW,sceneH)
view/objectView.ts       abstract ObjectView : constructor(object: SceneObject, host: PixiHost); update(): void; destroy(): void
view/viewRegistry.ts     ViewRegistry : register(type, factory: (o, host) => ObjectView); create(o, host): ObjectView | null
view/viewSync.ts         ViewSync : constructor(world, registry, host) ; syncAll() (crée les vues manquantes, update toutes) ; destroy()
view/pixiTextMeasurer.ts PixiTextMeasurer implements TextMeasurer (via pixi.js Text, mesure sans rendu)
view/<type>View.ts       une vue par classe : RectangleView, TextView, …
app/presk.ts             Presk (façade)
app/main.ts              démo (remplace core/src/main.ts à la bascule)
```

## Règles de vue
- `update()` : `visible = effectiveAlpha() > 0` ; `displayObject.setFromMatrix(worldMatrix())` ; `alpha = effectiveAlpha()` ; redessiner les `Graphics` en coordonnées **locales**.
- Couleurs : nombres `0xRRGGBB` de l'état, passés tels quels à Pixi.
- Une vue **n'écrit jamais** dans le modèle (aucun `setState`, `writeProp`).
- Ajout au stage dans l'ordre de création des objets (`world.all()`).

## Façade `Presk`
```ts
export class Presk {
  static async create(opts: { root: string; fps?: number }): Promise<Presk>;   // init Pixi, catalogue par défaut, PixiTextMeasurer
  async load(raw: unknown): Promise<void>;     // précharge les images (P9), compileProgram, Simulation, vues ; applique scene.width/height/background ; seek(0)
  get duration(): number;
  get time(): number;
  renderAt(t: number): void;                   // simulation.seek(t) puis viewSync.syncAll()
  play(): void; pause(): void;                 // boucle requestAnimationFrame, temps = temps mur écoulé ; s'arrête à `duration`
  onFrame(cb: (t: number) => void): void;
}
```
`load` relance proprement (détruit vues et simulation précédentes). Les erreurs de compilation (`PreskCompileError`) sont **propagées** à l'appelant.
