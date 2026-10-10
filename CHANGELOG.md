# CHANGELOG.md — GAME2026

Alle nennenswerten Änderungen an **PPPoppi 1986 — Euronen, Ehre, Untergrund** werden in dieser Datei dokumentiert.

Das Format orientiert sich an Keep a Changelog. Die Versionsführung folgt SemVer, sobald die erste veröffentlichbare Version vorbereitet wird.

## [Unreleased]

### Angelegt

- GAME-0211: versionierter Enden-Vertrag für zwölf Endarten, Sieg/Niederlage, priorisierte Endbedingungen, Kampagnenmodi, Missions-/Erfolgs-/Ereignisreferenzen, Cheat-Regeln und personalisierten Abspann samt Negativtests.

- GAME-0210: versionierter Achievement-Vertrag mit sichtbaren/geheimen Spielerfolgen, All-/Any-Freischaltbedingungen, optionalem Fortschrittsziel, Cheat-Regel und Effektreferenzen; umfangreiche Positiv- und Negativtests.

- GAME-0209: versioniertes Dialog-Schema für Knoten, bedingte Entscheidungen, nachvollziehbare Wirkungen, Beziehungsänderungen, Missionsstarts, Personalisierung und lokale Graphprüfung mit Negativtests.

- GAME-0208: versionierter, deklarativer Ereignisvertrag für Gewichtung, Sperrzeiten, Bedingungen, Konfliktgruppen, Wiederholungsgrenzen, Folgewirkungen und protokollierbare Zufallsquelle einschließlich Positiv- und Negativtests.

- GAME-0207: versionierter, deklarativer Missionsvertrag für zehn Missionsarten; sichtbare und verborgene Ziele, Schritte, Frist, Bedingungen, Effektreferenzen und Endzustände werden inklusive Negativtests geprüft.

- Figuren-Schema mit Pflichtfeldern, Wertebereichen und verständlichen Validierungsfehlern.
- Orts-Schema für Zugang, Aktionen, Risiken, Figuren, Ereignisse und Barrierefreiheitslabel.
- Validierungshilfen für begrenzte Texte, Integer und kanonische UTC-Zeitstempel mit Regressionstests.

- Browser-Regressionsfix: genau ein semantischer Hauptbereich und korrektes Sprunglink-Ziel in Desktop-/Mobilansicht.

- Architekturfehler #32: Spielzustand und Reducer in die Spielschicht verlagert; Kernzustandsverwaltung fachneutralisiert; vollständige Regression für unveränderte Startwerte ergänzt.

- Projektgrundlagen für ein statisch deploybares Browsergame mit Vite, TypeScript, Vitest, Playwright, ESLint und Prettier.
- Verbindliche Projektsteuerung über `AGENTS.md` und `TODO.md`.
- README-Grundstruktur mit Zielbild, Technik, lokaler Entwicklung, Qualitäts- und Sicherheitsgrundsätzen.
- Minimale Vite-Anwendung als Ausgangspunkt für die modulare Implementierung.
- Proprietäre Lizenzentscheidung mit vorbehaltenen Rechten dokumentiert.

### Geändert

- Profildaten und Historieneinträge werden vor Übernahme strikt geprüft; unbekannte Felder und ungültige Eingaben bleiben folgenlos.
- Die zusätzlichen Eingabeprüfungen nutzen den nach PR #33 verlagerten Game-Reducer; der Core bleibt frei von Spielmodulen.

### Noch offen

- Erste vollständig erfolgreiche Build-, Lint- und Testpipeline.
- Architekturkern, Spielsysteme, Inhalte, Savegame-System, UI und Release-Gates.
