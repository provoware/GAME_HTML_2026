# GAME-0306 – Deterministisches Mischen (Fisher–Yates)

**Ausgangsbasis:** `main` `4763394eae1ff37e1aca1f465ecdd4f61e70f85f`.
**Release-Pflichtkatalog:** `TODO.md` enthält 464 eindeutig nummerierte Aufgaben; zum Ausgangsstand sind 53 als erledigt markiert (11,42 %).
**Aktueller PR-Zweig nach tatsächlichem Testlauf und TODO-Aktualisierung:** 54/464 = **11,64 %**. Im noch unveränderten Hauptzweig gelten bis zur Übernahme 53/464 = **11,42 %**. Dieses Dokument ersetzt den TODO-Katalog nicht.

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

Auf dem vorherigen PR-Commit `13ce2c30446975ad490466e388815d7a3d2e0f9d` war der komplette Workflow [Quellcode und Spieltests #38094767836](https://github.com/provoware/GAME_HTML_2026/actions/runs/38094767836) erfolgreich (373 Unit-Tests, vier Browsertests, Typ-/Code-/Inhalts-/Build-Prüfungen). Die `TODO.md` wurde im PR-Zweig danach auf erledigt gestellt. **Für jede neue Dokumentationsänderung sind die Prüfungen auf dem neuen Commit erneut auszuwerten.** Der Hauptzweig und die Release-Freigabe bleiben bis zum regelkonformen Merge unverändert.

**Nächste Pflichtaufgabe:** `GAME-0307` (Zufallsprotokoll im Diagnosemodus), erst nach abgeschlossener Prüfung von `GAME-0306`.
