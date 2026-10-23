# ADR-008-class-catalog-and-prop-specs
**Catalogue de classes et PropSpec** · Réf spec : §1 principe 6, §11

## Contexte
Le moteur doit rester générique : ajouter une primitive ne doit pas toucher validation, compilation ni simulation.

## Décision
Une **classe** Presk = un `ClassDef` enregistré dans un `Catalog` :
`{ type, family, props: Record<string, PropSpec>, indexed, effects, paths, create(id, env) }` (types exacts : `C-model-core.md`).
- `PropSpec` : `kind` (`number|point|color|string|boolean|enum|pointList|objectRef|objectRefList|region`), `writes`, `mode` (`rw|ro|init`), `animatable`, `order`, `get`, `set`, bornes éventuelles.
- Les **ancres** (`topLeft`, `start`, …) sont des `PropSpec` de kind `point` (donc assignables si `mode: "rw"`).
- Les **ancres indexées** (`vertex[i]`) sont dans `indexed`.
- `family` : `rectangle` (9 ancres) | `bounded` (via `boundingBox`) | `unbounded` (`line`, `ray`) | `point`.
- Ordre d'application des propriétés d'une même étape (`order`) : 0 = contenu/géométrie/style ; 1 = `pivot`, `rotation`, `scale` ; 2 = placement (`x`,`y`,`pos`, ancres) ; 3 = `opacity` puis effets.
- La validation, l'analyse de références, la compilation et les conflits (§9.4) lisent **uniquement** le `ClassDef`.
- Un fichier de classe détaillé par type : `contracts/classes/<type>.md`.

## Alternatives écartées
`if (type === 'rectangle')` dispersés : coûteux à étendre, source de bugs pour des agents faibles.

## Conséquences
Ajouter une primitive = 1 fichier modèle + 1 enregistrement dans `defaultCatalog.ts` + 1 vue. Rien d'autre.
