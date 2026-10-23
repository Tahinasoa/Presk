# ADR-018-testing-strategy
**Stratégie de tests** · Réf spec : —

## Contexte
Agents faibles : il faut des garde-fous automatiques et des cas concrets.

## Décision
1. Chaque tâche fournit ses **cas de test** (entrées/sorties exactes). L'agent écrit le test d'abord, le voit échouer, puis implémente.
2. Tout est testable hors navigateur sauf `view/`.
3. **Tests dorés** (T080 puis P6+) : un document JSON v1.0 minuscule + états attendus à des instants précis, via `compileProgram` + `Simulation` + `FakeTextMeasurer`.
4. Test d'architecture (T004) exécuté à chaque commit.
5. Les anciens tests restent verts jusqu'à leur suppression explicite (tâches de bascule). Aucun ancien test n'est modifié, sauf T002.

## Alternatives écartées
Tests écrits après coup par l'agent : couvrent ce qu'il a codé, pas ce que la spec exige.

## Conséquences
Les cas de test des tâches sont dérivés de la spec (référence de section indiquée).
