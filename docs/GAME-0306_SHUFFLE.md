# GAME-0306 – Deterministisches Mischen (Fisher–Yates)

**Ausgangsbasis:** `main` `4763394eae1ff37e1aca1f465ecdd4f61e70f85f`.
**Release-Pflichtkatalog:** `TODO.md` enthält 464 eindeutig nummerierte Aufgaben; zum Ausgangsstand sind 53 als erledigt markiert (11,42 %).
**Geplante neue Quote nach erfolgreicher Prüfung und Aktualisierung von TODO.md:** 54/464 = **11,64 %**. Bis dahin gilt die bisherige Zahl; dieses Dokument ersetzt den TODO-Katalog nicht.

## Eine abgegrenzte Aufgabe

`src/game/rng/deterministic-shuffle.ts` ergänzt `shuffleDeterministic(items, rng)`.
Der Algorithmus verwendet ausschließlich die vorhandene deterministische `nextUint32()`-Schnittstelle, keine globale Zufallsquelle. Gleiche Eingaben und gleicher RNG-Zustand erzeugen dieselbe Ausgabe. Die Eingabe wird kopiert, nicht verändert. Duplikate und Objektidentitäten bleiben erhalten.

Das Verfahren verhindert ungleiche Ziehungswahrscheinlichkeiten durch Rejection Sampling (verwirft nicht passende 32-Bit-Zahlen). Die Begrenzung auf 100.000 lückenlose Einträge und maximal 1.024 Ziehungen je Vertauschung verhindert unbeabsichtigte hohe Last und Endlosschleifen durch defekte Generatoren. Ungültige Zufallszahlen werden als Fehler behandelt.

## Belegplan

- Positivtests: fester Referenzvektor für Seed 42 und Seed 0, Identität/Mehrfachvorkommen, leere/einzelne Liste, Anzahl der Ziehungen, unabhängige Welt-/UI-Ströme.
- Negativtests: ungültige Generatorwerte, dauerhaft verworfene Werte, zu große oder lückenhafte Listen, fehlender Generator.
- Verbindliche Qualitätsprüfung: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run check:cycles`, `npm run validate:content`, `npm test`, `npm run build`, `npm run test:e2e` über `.github/workflows/quality.yml` auf dem PR-Commit.
- Keine Änderung am Savegame-Schema, den Spielregeln, der Benutzeroberfläche oder den bestehenden Zufallsströmen.

## Nachweisstatus

Die Ausführungsergebnisse stehen ausschließlich im GitHub-PR und im zugehörigen CI-Lauf. Ein angelegter Test ist noch kein bestandener Test. Die bestehende `TODO.md` wird erst nach bestätigtem Prüfergebnis als erledigt markiert; bei ausstehender oder blockierter Änderung bleibt `GAME-0306` offen.

**Nächste Pflichtaufgabe:** `GAME-0307` (Zufallsprotokoll im Diagnosemodus), erst nach abgeschlossener Prüfung von `GAME-0306`.
