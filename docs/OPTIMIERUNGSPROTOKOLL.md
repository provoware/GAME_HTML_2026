# Vorrelease-Pflichtmatrix und Optimierungsprotokoll

## Lauf 2026-10-22 – GAME_HTML_2026

**Repository:** provoware/GAME_HTML_2026  
**Basis:** main `4e0a9a5787450bd28ff0528a8bbdcf888835d047`  
**Arbeitszweig:** `agent/game-0401-0412-calendar-contract-20261022`  
**Bearbeitung:** GAME-0401, 0402, 0403 und 0412 (Kalenderdatenmodell, Wochen- und Monatsmodell, Grenztests).  
**Status:** BLOCKED für Quellcodeübernahme; Dokumentation im Arbeitszweig gespeichert, main unverändert.

### Ausgangsproblem und Nutzen

Der Savegame-Prüfer kontrolliert `calendar.day` nur auf 1–31 und `calendar.week` nur auf 1–53. Damit kann er etwa den 29. Februar 1986 oder den 1. Januar mit Spielwoche 53 akzeptieren. Solche widersprüchlichen Zustände würden spätere Tages-/Monatsabrechnungen und Replays gefährden. Das Projekt besitzt noch kein Kalender-Datenmodell; der Ordner `src/game/calendar` enthält bislang nur `.gitkeep`.

Geplante Korrektur: reine Funktionen für gregorianische Kalendertage (Jahre 1–9999), sieben Tage lange Spielwochen ab dem 1. Januar, Monatslängen und Schaltjahre; verschärfte Prüfung von Datum und passender Spielwoche vor Übernahme eines Savegames. Die vorhandene Save-Struktur bleibt erhalten. Ungültige Daten werden gemeldet und niemals automatisch überschrieben. Eine ISO-Kalenderwoche ist **nicht** mit der Spielwoche gleichzusetzen.

### Beleglage und bereits ausgeführte Prüfungen

- **PASS:** Tatsächlichen main-Stand, `AGENTS.md`, `AGENTS_GAME.md`, `README.md`, `TODO.md`, Source-Ordner, CI und Tests eingesehen.
- **PASS:** Offene PRs #51 (gewichtete RNG-Auswahl), #52 (800×600), #53 (RNG-Diagnose), #54 (globales Math.random-Verbot) berücksichtigt; keine Doppelimplementierung dieser Arbeiten.
- **PASS:** Auf main zwei erfolgreiche GitHub-Actions-Läufe für SHA `4e0a9a57` beobachtet.
- **PASS (isoliert):** Lokales Kalender-Modul mit TypeScript 5.8.3 im strengen Modus typgeprüft.
- **PASS (isoliert):** Kalenderarithmetik mit Node.js 22.16.0 über sämtliche Tage der Jahre 1, 4, 100, 400, 1900, 1986, 1988, 2000, 2400 und 9999 gegen die UTC-Datumsarithmetik verglichen. Zusätzlich Spielwochen- und Monatsgrenzen geprüft.
- **BLOCKED:** Zwei Versuche, die TypeScript-Quelldatei auf dem Arbeitszweig mit dem GitHub-Connector anzulegen, wurden durch die OpenAI-Sicherheitsprüfung abgewiesen. Kein Quellcode-Commit und kein Test-Commit auf GitHub. Diese Sperre ist keine GitHub-CI-Ablehnung.
- **OPEN:** `npm ci`, `npm run lint`, `npm run typecheck`, `npm run check:cycles`, `npm run validate:content`, `npm test`, `npm run build`, `npm run test:e2e` für die geplante Kalenderänderung. Die isolierte Typprüfung ist kein Ersatz.
- **OPEN:** GitHub-CI auf einem tatsächlichen Quellcode-PR. Kein Merge, keine Releasefreigabe.

### Release-Pflichtmatrix (Stand dieser Untersuchung)

Status: PASS = nachgewiesen; PARTIAL = vorhandene Grundlage, nicht vollständig abgenommen; OPEN = Pflichtnachweis fehlt; BLOCKED = externe Sperre.

| Bereich | Soll | Ist / Evidenz | Status |
| --- | --- | --- | --- |
| Fachfunktionen | Vollständige spielbare Kampagne samt Enden | TODO: Umsetzung im Aufbau, Spielkern- und Kampagnenphasen weitgehend offen | OPEN |
| Schnittstellen | Typisierte Modulgrenzen und stabile Spielzustände | TypeScript strict, GameState/Reducer und Architekturprüfungen vorhanden | PARTIAL |
| Datenverlustschutz | Sicheres Speichern, Wiederherstellen, keine stille Migration | Savegame-Schema vorhanden, echte Persistenz und Sicherungen noch offen | OPEN |
| Sicherheit | Eingabeprüfung, keine ausführbaren fremden Inhalte | Schema-/Cheat-Validierung vorhanden; vollständige Prüfung offen | PARTIAL |
| Fehlerfälle | Verständliche Behandlung beschädigter Daten und Abbrüche | Error-Boundary vorhanden, echte Speicherfehler noch nicht integriert | PARTIAL |
| Performance | Zielwerte für Ladezeit, Speicher und Reaktion nachgewiesen | Zielwerte in AGENTS.md, Messberichte fehlen | OPEN |
| Wartbarkeit | Klare Architektur, statische Prüfungen, nachvollziehbare Tests | ESLint, Typprüfung und Zyklusprüfung in CI vorhanden | PARTIAL |
| Design/UX | Vollständige benutzbare Spieloberfläche | Grundgerüst vorhanden, viele Screens/Funktionen noch offen | OPEN |
| 800×600 und Skalierung | Keine verdeckten Aktionen bei hoher Skalierung | PR #52 offen; kein freigegebener Gesamt-Nachweis | OPEN |
| Tastatur/Barrierefreiheit | WCAG 2.2 AA, Tastatur, Fokus und Kontrast | Anforderungen in AGENTS.md, umfassende Tests offen | OPEN |
| Import/Export | Sicherer JSON-Import und -Export | Schema vorhanden, Ein-/Ausgabe nicht fertig | OPEN |
| Backup/Restore | Wiederherstellbare Sicherungen und fehlerfeste Migration | RNG-Zustands-Snapshot vorhanden; Gesamtfunktion offen | OPEN |
| Installation/Start | Reproduzierbarer Start und Offline-Build | npm-Skripte, Vite und CI vorhanden; Kubuntu-Endprüfung später | PARTIAL |
| Einheitstests | Kritische Pfade und Grenzfälle | Zahlreiche Vitest-Dateien in tests/unit; Abdeckung offen | PARTIAL |
| Integrationstests | Aktionen, Speichern/Laden, Monatswechsel | Inhaltsvalidierung vorhanden; Spielabläufe fehlen | OPEN |
| Ende-zu-Ende/GUI | Start bis Spielende, mobil und per Tastatur | Playwright-Konfiguration und app.spec.ts vorhanden; Vollablauf offen | OPEN |
| Regressionstests | Schutz aller zentralen Verträge | RNG-, Schema- und Architekturtests vorhanden; Kalender fehlt | PARTIAL |
| CI | Alle Pflichtprüfungen für unveränderten Commit grün | main SHA 4e0a9a57 erfolgreich; neue Änderung noch nicht in CI | PARTIAL |
| Dokumentation | Aktueller Soll/Ist-Stand und Anleitungen | README, TODO, AGENTS, CHANGELOG; diese Matrix ergänzt | PARTIAL |
| Paketierung | Geprüfter statischer Produktionsbuild | Vite-Build in main-CI; vollständige Releaseprüfung offen | PARTIAL |

### Nächste verbindliche Pflichtarbeit

1. Schreibblockade für TypeScript-Dateien klären; Kalender-Modul und Regressionstests **auf demselben Arbeitszweig** committen.
2. Savegame-Prüfung auf unmögliche Datumswerte und unpassende Spielwochen erweitern; ohne stille Korrektur, mit Negativtests. `TODO.md` erst nach erfolgreicher Integration aktualisieren.
3. Vollständige GitHub-Prüfkette auf dem PR-Head ausführen, Fehler beheben, Ergebnisse mit SHA dokumentieren. Erst nach grüner Kette Review; main nicht direkt verändern.

**Restrisiken:** Bestehende Speicherstände mit bisher akzeptierten, aber widersprüchlichen Kalenderangaben würden durch die strengere Prüfung zurückgewiesen; sie müssen verständlich als beschädigt gemeldet werden. Die aktuelle Savegame-Version erlaubt nur Jahr 1986. Eine Erweiterung auf weitere Jahre ist eine separate, migrationspflichtige Arbeit. Die persönliche Kubuntu-Endabnahme wird erst nach eigenständig abgeschlossener Vorrelease-Arbeit gebündelt eingeplant.
