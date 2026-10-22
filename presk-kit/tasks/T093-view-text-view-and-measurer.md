# T093-view-text-view-and-measurer
**Phase** P5 · **Dépend de** : T091-view-object-view-registry, T047-model-text-object · **Réf spec** : §11.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md`
- `architecture/decisions/ADR-017-view-layer-contract.md`
- `architecture/decisions/ADR-014-ports-text-measurer-and-images.md`
- `architecture/contracts/classes/text.md`

## Objectif
Dessiner `text` et fournir le mesureur réel utilisé à la création des objets.

## Fichiers
- créer : `core/src/view/textView.ts`
- créer : `core/src/view/pixiTextMeasurer.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T093.1 `pixiTextMeasurer.ts` : `class PixiTextMeasurer implements TextMeasurer` : `measure(text, style)` = `CanvasTextMetrics.measureText(text, new TextStyle({fontSize, fontFamily, fontWeight}))` → `{ width: m.width, height: m.height }`. Pour un texte vide, renvoyer `{width: 0, height: m.height}`.
T093.2 `textView.ts` : `class TextView extends ObjectView` : crée `new Text({ text: "", style: { fontSize: 32, fontFamily: "sans-serif", fontWeight: "bold", fill: 0xffffff } })` et l'ajoute au `container`.
T093.3 `draw()` : `t.text = getString("text")` ; `t.style.fontSize = getNumber("fontSize")` ; `t.style.fontFamily`, `t.style.fontWeight` ; `t.style.fill = getNumber("color")`. L'origine d'un `Text` Pixi est son coin haut-gauche (cohérent avec `pos`). **Ne lit ni n'écrit** `width`/`height` du modèle.
T093.4 Exporte `registerTextView(reg)`.

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
`feat(view): TextView and PixiTextMeasurer (T093)`

## Suivante
`T094-view-sync`
