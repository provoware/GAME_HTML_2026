# GAME_HTML_2026

**PPPoppi 1986 — Euronen, Ehre, Untergrund** ist ein geplantes, statisch deploybares Retro-Browsergame. Das Spiel wird als rundenbasierte Wirtschafts-, Karriere- und Milieusimulation in einer fiktiven Metropolregion des Jahres 1986 umgesetzt.

## Projektstatus

- Spezifikation: vollständig in `AGENTS.md` und `TODO.md` beschrieben.
- Implementierung: im Aufbau.
- Validierung: im Aufbau.
- Release-Ziel: Version `1.0.0`.

Es gelten nur Funktionen als umgesetzt, die im Repository vorhanden, getestet und in `TODO.md` als erledigt markiert sind.

## Zielbild

Das fertige Spiel soll:

- direkt im Browser laufen,
- ohne zwingende Serverkomponente funktionieren,
- als statische Website deploybar sein,
- auf Desktop, Tablet und Smartphone bedienbar sein,
- vollständig per Tastatur spielbar sein,
- reproduzierbare Spielstände erzeugen,
- robuste Savegame-Importe und -Migrationen unterstützen,
- automatisiert geprüft werden.

## Technik

Geplanter Pflichtstack:

- Node.js 24 LTS gemäß `.nvmrc`,
- npm,
- Vite,
- TypeScript im Strict-Modus,
- Vanilla TypeScript ohne Framework-Zwang,
- CSS mit Custom Properties,
- Vitest,
- Playwright,
- ESLint,
- Prettier.

Produktionsbuilds dürfen keine externen CDN-Aufrufe benötigen.

## Lokale Entwicklung

Voraussetzung ist eine Node- und npm-Version, die zu `package.json` und `.nvmrc` passt.

```bash
npm ci
npm run dev
```

Wichtige Prüfungen:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Die vollständige Pipeline gilt erst als bestanden, wenn alle genannten Befehle ohne Fehler laufen.

## Projektsteuerung

- `AGENTS.md` enthält verbindliche Projekt-, Architektur-, Qualitäts- und Ablaufregeln.
- `TODO.md` enthält den nummerierten Entwicklungsplan und den rechnerischen Fortschritt.
- Jede Iteration bearbeitet die kleinste sinnvoll abschließbare Aufgabe.
- Fortschritt wird ausschließlich über erledigte Pflichtaufgaben in `TODO.md` berechnet.

## Architekturgrundsätze

- Kein One-File-Projekt.
- Spielregeln liegen nicht in UI-Komponenten.
- `core` bleibt unabhängig von der UI.
- `game` greift nicht direkt auf DOM-Elemente zu.
- Seiteneffekte werden gekapselt.
- Alle Zustandsänderungen laufen über typisierte Actions.

## Repository-Struktur

Die Zielstruktur ist in `AGENTS.md` dokumentiert. Während der Implementierung werden Ordner und Dateien nur angelegt, wenn eine konkrete Aufgabe sie benötigt.

## Qualität und Sicherheit

Das Projekt zielt auf:

- WCAG 2.2 AA für Barrierefreiheit,
- robuste Fehlerbehandlung mit sicherem Fallback,
- keine Nutzung von `eval` oder `new Function`,
- validierte und begrenzte Nutzereingaben,
- keine geschützten Inhalte historischer Spiele,
- keine erfundenen Test- oder Release-Aussagen.

## Lizenz

Die Lizenzentscheidung ist noch offen und wird über `TODO.md` als eigene Aufgabe dokumentiert.
