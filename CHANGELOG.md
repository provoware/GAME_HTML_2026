# CHANGELOG.md — GAME2026

Alle nennenswerten Änderungen an **PPPoppi 1986 — Euronen, Ehre, Untergrund** werden in dieser Datei dokumentiert.

Das Format orientiert sich an Keep a Changelog. Die Versionsführung folgt SemVer, sobald die erste veröffentlichbare Version vorbereitet wird.

## [Unreleased]

### Angelegt

- Projektgrundlagen für ein statisch deploybares Browsergame mit Vite, TypeScript, Vitest, Playwright, ESLint und Prettier.
- Verbindliche Projektsteuerung über `AGENTS.md` und `TODO.md`.
- README-Grundstruktur mit Zielbild, Technik, lokaler Entwicklung, Qualitäts- und Sicherheitsgrundsätzen.
- Minimale Vite-Anwendung als Ausgangspunkt für die modulare Implementierung.
- Proprietäre Lizenzentscheidung mit vorbehaltenen Rechten dokumentiert.
- Modularer Architekturkern mit Bootstrap, Fehlergrenze, Router, Event-Bus, Logging und
  unveränderlicher Zustandsverarbeitung.
- Grundschemata für Spielerprofil, Welt und Wirtschaft samt Unit-Tests.
- Figuren-Schema mit Pflichtfeldern, Wertebereichen und verständlichen Validierungsfehlern.
- Orts-Schema für Zugang, Aktionen, Risiken, Figuren, Ereignisse, lokale Medien und
  Barrierefreiheitslabel.

### Geändert

- Action-Verarbeitung weist unbekannte oder typfalsche Profilfelder sowie ungültige
  Historieneinträge sicher zurück.
- Zentrale Laufzeitprüfungen begrenzen Texte und Zahlen und prüfen kanonische ISO-Zeitstempel.

### Noch offen

- Weitere Inhaltsschemata, Spielsysteme, Savegame-System, vollständige UI und Release-Gates.
