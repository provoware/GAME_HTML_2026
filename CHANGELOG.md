# CHANGELOG.md — GAME2026

Alle nennenswerten Änderungen an **PPPoppi 1986 — Euronen, Ehre, Untergrund** werden in dieser Datei dokumentiert.

Das Format orientiert sich an Keep a Changelog. Die Versionsführung folgt SemVer, sobald die erste veröffentlichbare Version vorbereitet wird.

## [Unreleased]

### Angelegt

- GAME-0307: optionales begrenztes Zufallsprotokoll, fünf Grundtests plus Fehlerfall- und Bedienungstests; isolierter Testgenerator im Entwicklungs-Diagnosemodus. Keine Änderung von Spielständen oder Zufallsfolgen.

- GAME-0305 (in Prüfung): reproduzierbare, unverzerrte Gewichtsauswahl mit ganzzahligen Gewichten, strikter Eingabeprüfung, sicheren Grenzen und gezielten Regressionstests.


- GAME-0304 (in Prüfung): versionierte Sicherung und Wiederherstellung des ursprünglichen Seeds und aller drei fortgeschrittenen RNG-Zustände in vorhandenen Spielstandfeldern, mit Erkennung älterer inkompatibler Werte ohne stille Migration und Regressionstests.


- GAME-0303 (in Prüfung): Seed-Erzeugung aus crypto.getRandomValues() ohne unsicheren Rückfall, kanonisches achtstelliges Hex-Format, verlustfreies Einlesen sowie sieben Regressionstests für Fehlerbehandlung und Reproduzierbarkeit.


- GAME-0302 (in Prüfung): getrennte deterministische Zufallsströme für Welt, Ereignisse und Oberfläche mit festen Domänenmasken, isoliertem Zustand sowie positiven und negativen Unabhängigkeitstests. Noch keine Änderung des Savegame-Vertrags oder der Spiel-Engine.


- GAME-0301 (in Prüfung): gekapselter deterministischer Mulberry32-Zufallsgenerator mit strengem 32-Bit-Seed, unabhängigem Zustand, reproduzierbaren Testvektoren und Grenztests. Nicht kryptografisch; getrennte Streams, Seed-Erzeugung, Spielzustandsintegration folgen in eigenständigen Aufgaben.


- GAME-0218 (in Prüfung): einheitliche Schema-Vertragsmatrix für acht Inhaltskategorien; negative Tests für fehlende IDs, falsche ID-Typen, unbekannte Felder und unbekannte Schemaversionen sowie Unveränderlichkeitsprüfung.


- GAME-0217 (zur Prüfung): dateiübergreifende Prüfung existierender Figuren-, Orts-, Missions-, Dialog-, Ereignis-, Erfolgs- und Endenreferenzen; vorhandene Modul-Regressionstests und Einbindung in die Inhaltsvalidierung.


- GAME-0216 (in Prüfung): globaler Inhalts-ID-Abgleich für valide JSON-Inhalte unterschiedlicher Kategorien; deterministische Diagnosen und vier Regressionstests. Noch nicht freigegeben.

- GAME-0215: automatisches Inhaltsvalidierungsskript für alle acht bestehenden Inhaltsmodelle mit strengem JSON-/Dateisicherheitscheck, unbekannten Feldern, lokalen Verweisen, verständlichen Fehlern, Kommandozeilentests und CI-Gate.

- GAME-0213: versionierter Savegame-Inhaltsvertrag mit vollständiger, strikt begrenzter Prüfung der vorhandenen GameState-Felder, Metadaten, Zeitstempel und Prüfsummenformat; Negativtests für beschädigte Werte, Inkonsistenzen und unbekannte Felder.

- GAME-0212: deklaratives, versioniertes Cheat-Schema für zehn Cheat-Arten, vier sichere Auslöser, streng erlaubte Wirkungen, Werteobergrenzen, Spielstand-Markierung und optionale Achievement-Sperre mit positiven und negativen Sicherheitstests.

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
