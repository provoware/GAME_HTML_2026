# CHANGELOG.md — GAME2026

Alle nennenswerten Änderungen an **PPPoppi 1986 — Euronen, Ehre, Untergrund** werden in dieser Datei dokumentiert.

Das Format orientiert sich an Keep a Changelog. Die Versionsführung folgt SemVer, sobald die erste veröffentlichbare Version vorbereitet wird.

## [Unreleased]

### Angelegt

- Browser-Regressionsfix: genau ein semantischer Hauptbereich und korrektes Sprunglink-Ziel in Desktop-/Mobilansicht.

- Architekturfehler #32: Spielzustand und Reducer in die Spielschicht verlagert; Kernzustandsverwaltung fachneutralisiert; vollständige Regression für unveränderte Startwerte ergänzt.

- Projektgrundlagen für ein statisch deploybares Browsergame mit Vite, TypeScript, Vitest, Playwright, ESLint und Prettier.
- Verbindliche Projektsteuerung über `AGENTS.md` und `TODO.md`.
- README-Grundstruktur mit Zielbild, Technik, lokaler Entwicklung, Qualitäts- und Sicherheitsgrundsätzen.
- Minimale Vite-Anwendung als Ausgangspunkt für die modulare Implementierung.
- Proprietäre Lizenzentscheidung mit vorbehaltenen Rechten dokumentiert.

### Noch offen

- Erste vollständig erfolgreiche Build-, Lint- und Testpipeline.
- Architekturkern, Spielsysteme, Inhalte, Savegame-System, UI und Release-Gates.
