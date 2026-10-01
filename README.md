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

### Erster Start – Schritt für Schritt

1. Öffne ein Terminal und wechsle in den Projektordner:

   ```bash
   cd /workspace/GAME_HTML_2026
   ```

2. Aktiviere die vorgesehene Node-Version. Falls `nvm` noch nicht installiert ist,
   installiere zuerst [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) und öffne
   danach ein neues Terminal.

   ```bash
   nvm install
   nvm use
   node --version
   npm --version
   ```

   `node --version` muss mindestens `v24.0.0` und `npm --version` mindestens `11.0.0`
   ausgeben.

3. Installiere exakt die im Projekt festgeschriebenen Pakete:

   ```bash
   npm ci
   ```

4. Starte die Entwicklungsansicht:

   ```bash
   npm run dev
   ```

5. Öffne die im Terminal angezeigte Adresse im Browser, normalerweise
   `http://localhost:5173`. Beende den Server später mit `Strg+C`.

### Änderungen prüfen

Führe nach einer Änderung diese Befehle einzeln in derselben Reihenfolge aus. Bricht ein
Befehl ab, lies zuerst dessen letzte Fehlermeldung; der nächste Befehl behebt den Fehler nicht.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Der Browser-Test benötigt einmalig einen eigenen Testbrowser:

```bash
npx playwright install chromium
npm run test:e2e
```

Jeder Befehl muss mit Exit-Code `0` enden (das bedeutet: erfolgreich). Der fertige statische
Build liegt danach in `dist/` und kann mit `npm run preview` lokal geprüft werden.

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

Dieses Projekt ist proprietär. Alle Rechte bleiben vorbehalten; Nutzung, Kopie,
Änderung oder Weitergabe benötigen eine vorherige schriftliche Erlaubnis.
