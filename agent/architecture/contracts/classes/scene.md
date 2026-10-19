# Classe `scene` — racine de la scène (id réservé `scene`)
Famille : **rectangle** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/sceneObject.ts` · Vue : `core/src/view/sceneView.ts`

- **`pos`** : (0,0), immuable.
- **Pivot** : défaut `center` ; valeurs permises : les 9 ancres.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`width`, `height` = `scene.width/height` ; `x:0 y:0 rotation:0 scale:1 opacity:1 presence:1 pivot:"center"`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `width` | number | `[]` | **ro** | non | 0 | |
| `height` | number | `[]` | **ro** | non | 0 | |

## Ancres
les 9 ancres en lecture seule (mode `ro`, `writes: []`).

## Ancres indexées
aucune

## Géométrie locale / bornes
aucun effet utile (`reveal` présent mais non utilisable : `scene` n'accepte que les propriétés de vue, §3.5).

## Chemin `main`
`localBounds` = `[0,width]×[0,height]` ; `creatable: false`.

## Effets
contour fermé comme `rectangle`.

## Notes d'implémentation
`x y pos rotation scale opacity pivot` sont `ro` sur `scene`. Les propriétés de vue sont ajoutées en P8 (T140–T143). Avant P8 : `scene` n'est cible que de **lectures** dans les expressions.
