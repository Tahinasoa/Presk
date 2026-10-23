# T091-view-object-view-registry
**Phase** P5 · **Dépend de** : T090-view-pixi-host · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md`
- `architecture/decisions/ADR-017-view-layer-contract.md`
- `architecture/contracts/C-model-core.md`

## Objectif
Créer la classe de base des vues et le registre type → fabrique.

## Fichiers
- créer : `core/src/view/objectView.ts`
- créer : `core/src/view/viewRegistry.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T091.1 `objectView.ts` : `abstract class ObjectView` : `constructor(readonly...)` interdit (erasableSyntaxOnly) → déclare les champs `object: SceneObject`, `host: PixiHost`, `container: Container` et assigne-les dans le constructeur. `update(): void` : appelle `applyCommon()` puis `draw()`. `protected applyCommon()` : `alpha = object.effectiveAlpha()` ; `container.visible = alpha > 0` ; `container.alpha = alpha` ; `container.setFromMatrix(toPixiMatrix(object.worldMatrix()))`. `protected abstract draw(): void`. `destroy(): void` : `host.remove(container)` ; `container.destroy({children:true})`.
T091.2 Exporte `toPixiMatrix(m: Mat): Matrix` = `new Matrix(m.a, m.b, m.c, m.d, m.e, m.f)`.
T091.3 `viewRegistry.ts` : `type ViewFactory = (o: SceneObject, host: PixiHost) => ObjectView`. `class ViewRegistry` : `register(type, factory)` (lève si doublon) ; `create(o, host): ObjectView | null` (null si le type n'a pas de fabrique, ex. `point`, `scene`, `group`).

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
`feat(view): ObjectView base and registry (T091)`

## Suivante
`T092-view-rectangle-view`
