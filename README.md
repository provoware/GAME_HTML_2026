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
npm run check:cycles
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

## Missions-Schema (GAME-0207)

Die Datei `src/game/missions/mission-schema.ts` definiert einen versionierten Inhaltsvertrag für zehn Missionsarten. `validateMission()` prüft Pflichtfelder, ID-Format und Eindeutigkeit, Zeichengrenzen, Zielmengen, Schrittreferenzen, Profilfelder und Fristen. Ungültige Missionen liefern eine Fehlerliste; der Validator verändert keine Spielstände. `null` bedeutet bei `timeLimitDays`, dass die Mission keine Frist besitzt. Die spätere Missions-Engine sowie die projektweite Auflösung von IDs bleiben eigene Aufgaben (ab GAME-0217 und GAME-1201).

Gezielte Prüfung: `npx vitest run tests/unit/mission-schema.test.ts`; die vollständigen Prüfungen laufen über GitHub Actions.

## Ereignis-Schema (GAME-0208)

`src/game/events/event-schema.ts` beschreibt Ereignisse mit versionierten Pflichtfeldern. `validateEvent()` lehnt ungültige Zahlen, unbekannte Felder, doppelte oder überlange ID-Listen sowie direkte Ereignis-Selbstverweise ab. Die Gewichtung liegt zwischen 1 und 10.000, die Sperrzeit zwischen 0 und 3.650 bestätigten Zügen. `repeatLimit: null` bedeutet keine Wiederholungsgrenze. Mindestens ein Folgewirkungs-Verweis ist nötig.

Die Zufallsquelle ist ausdrücklich `rngStream: 'event'` (die bestehende `GameState.rng.eventStream`). `randomDrawId` ist eine stabile Kennung für spätere Protokolle; das Schema führt selbst **keine** Zufallsziehung oder Wirkung aus. Die Prüfung anderer Ereignis-IDs, gegenseitiger Konflikte und zyklischer Ereignisketten bleibt für GAME-0217 beziehungsweise die Ereignis-Engine (GAME-1301 ff.) offen. Keine Änderung am Spielstandformat.

Gezielter Test: `npx vitest run tests/unit/event-schema.test.ts`.

## Dialog-Schema (GAME-0209)

`src/game/dialogue/dialogue-schema.ts` definiert versionierte Dialoge mit Gesprächsknoten, Entscheidungen, Bedingungen, nachvollziehbaren Folgen, möglichen Beziehungsänderungen und Missionsstarts. Texte können freigegebene Personalisierungen wie `{{crewName}}` enthalten. Alternative Texte können später Wiederholungen reduzieren. Eine leere Entscheidungsliste oder `nextNodeId: null` beendet einen Dialogzweig.

`validateDialogue()` prüft Pflichtfelder, Feldgrenzen, IDs, doppelte Entscheidungen, Beziehungswerte und Verzweigungen. Jeder Knoten muss vom Start aus erreichbar sein und einen **möglichen** Weg zu einem Ende haben. Dass Bedingungen diesen Weg zur Laufzeit freischalten, kann erst die spätere Dialog-Engine prüfen. Unbekannte Platzhalter sind gesperrt. Eine Wahl ohne Folge ist nur mit `deceptive: true` als bewusste Täuschung zulässig.

Das Schema verändert keine Spielstände, führt keine Entscheidungen aus und erzeugt noch keine Benutzeroberfläche. Die spätere Dialog-Engine, projektweite Verweisprüfungen und tatsächliche Tastaturbedienung bleiben separate Aufgaben (GAME-0217, GAME-1101 ff.). Gezielter Test: `npx vitest run tests/unit/dialogue-schema.test.ts`.

## Achievement-Schema (GAME-0210)

`src/game/achievements/achievement-schema.ts` beschreibt **sichtbare und geheime Spielerfolge** mit einer Version und strengen Pflichtfeldern. `conditionIds` verweist auf mindestens eine Freischaltbedingung; `unlockMode: 'all'` fordert alle, `unlockMode: 'any'` mindestens eine Bedingung. Ein optionales `progress`-Objekt enthält einen Zähler (`metricId`) und dessen Ziel (`targetCount` von 1 bis 1.000.000); dieser zusätzliche Zielwert muss gemeinsam mit den Bedingungen erfüllt werden. `progress: null` bedeutet: kein separater Fortschrittszähler.

`cheatPolicy: 'block'` kennzeichnet Erfolge, die während der Cheateinschränkung nicht freigeschaltet werden dürfen; `'allow'` erlaubt dies. Diese Kennzeichnung entspricht dem bestehenden Spielzustandsfeld `achievements.restrictedByCheats`, verändert den Spielstand aber nicht. Belohnungswirkungen werden nur über gültige IDs referenziert.

`validateAchievement()` lehnt fehlende, unbekannte, übergroße und doppelte Werte ab und liefert eine nachvollziehbare Fehlerliste. Das Schema führt **keine** Bedingungen aus, vergeben werden hier keine Erfolge. Die Freischalt-Engine, die tatsächliche Cheat-Prüfung, die Auflösung referenzierter Bedingungen und die Oberfläche bleiben separate Pflichtaufgaben (GAME-0217, GAME-1413, GAME-1501 ff.). Gezielter Test: `npx vitest run tests/unit/achievement-schema.test.ts`.

## Spielenden-Schema (GAME-0211)

`src/game/endings/ending-schema.ts` definiert die zwölf im Entwicklungsplan vorgesehenen Endarten. Jede Enddefinition besitzt eine Kennung, Sieg/Niederlage (`won`/`lost`), eine Priorität (0–1000), mindestens einen Freischaltbedingungs-Verweis sowie gültige Spielmodi. `conditionMode: 'all'` bedeutet alle Bedingungen, `'any'` mindestens eine. Zusätzlich können abgeschlossene Missionen, freigeschaltete Erfolge und abgewickelte Ereignisse als notwendige Referenzen angegeben werden. Für verdeckte Enden gibt es `secret` und für Einschränkungen durch Cheats `cheatPolicy`.

Der Abschlusstext `epilogue` erlaubt ausdrücklich freigegebene Platzhalter wie `{{crewName}}`. `validateEnding()` prüft Pflichtfelder, ID-Format, Duplikate, Wertebereiche, Listenlängen und Personalisierung. Er sammelt Fehler, ohne den Spielzustand zu verändern. Die Priorität wird später erst in der Ende-Engine zur konfliktfreien Auswahl herangezogen; aktuell wird sie lediglich begrenzt und validiert.

**Wichtig:** Das Schema gewährleistet noch nicht, dass Referenzen zu vorhandenen Missionen, Erfolgen und Ereignissen führen oder alle zwölf Enden tatsächlich spielerisch erreichbar sind. Das übernehmen GAME-0217, GAME-1518 und GAME-1519; die Laufzeit-Auswahl und der Abspann folgen in Phase 15. Gezielter Test: `npx vitest run tests/unit/ending-schema.test.ts`.

## Cheat-Schema (GAME-0212)

`src/game/cheats/cheat-schema.ts` definiert einen versionierten Vertrag für die zehn geplanten Cheats: Geldbonus, Energie auffüllen, Ermittlungsdruck senken, Ort freischalten, Retro-Farbmodus, Debug-Statistik, Chaosmodus, geheime Figur, alternativer Abspann und persönliches Geheimwort. Erlaubte Auslöser sind ein kleingeschriebenes Terminalwort, eine Folge erlaubter **Spieltasten ohne Systemtasten**, das Feld `profile.secretWord` und eine geheime Ortsaktion. Der persönliche Geheimwort-Cheat darf nur die vorhandene Profil-Eigenschaft referenzieren; ein echtes Geheimwort wird nicht als Cheat-Wert gespeichert.

Jede Art hat genau **einen festen, passenden Effekttyp** statt frei ausführbarer Skripte. Für Geldbonus gilt 1–1.000.000, für Energie und Ermittlungsdruck 1–100 als erlaubte Änderungsmenge. Bei der späteren Ausführung müssen Zustandswerte zusätzlich auf ihre zulässigen Endbereiche begrenzt werden. Für jedes Cheat-Datenobjekt ist `marksSave: true` verbindlich. `restrictsAchievements` kennzeichnet, ob die spätere Engine Erfolge sperrt. Ein verständlicher Rückmeldungstext ist verpflichtend.

`validateCheat()` prüft Pflichtfelder, Typen, Kennungen, verschachtelte Felder, verbotene Zusätze, sichere Auslöser und festgelegte Wirkungen. **Das Schema führt keine Aktion aus, ändert keine Savegames und ruft weder Browserfunktionen noch externe Programme auf.** Echte Spielstand-Markierung, Cheat-Ausführung und Achievement-Sperren bleiben GAME-1402 bis GAME-1414; projektweite Referenzprüfungen folgen GAME-0217. Gezielter Test: `npx vitest run tests/unit/cheat-schema.test.ts`.

## Savegame-Schema (GAME-0213)

`src/game/save/savegame-schema.ts` beschreibt das **versionierte Format eines vollständigen Spielstands**, bestehend aus allen Feldern des vorhandenen `GameState` sowie `createdAt`, `updatedAt` und `checksum`. Der neue Validator `validateSavegame(unknown)` prüft ausschließlich Daten und liefert entweder die vollständig akzeptierte Definition oder eine Liste verständlicher Probleme. Er akzeptiert weder ungeprüfte, unvollständige noch unbekannte Felder.

Geprüft werden die aktuelle Version `schemaVersion: 1`, Spielversion, kanonische UTC-Zeitstempel und deren Reihenfolge, erlaubte Spielmodi, Kalender, Profilwerte, normalisierte Spielerwerte und Rang, ganzzahlige Geldbeträge, Wirtschaftsbuchungen, konsistente Orts- und ID-Listen, Missionen, Ereignisse, Beziehungen, Erfolge, Einstellungen, getrennte Zufallsströme sowie geordnete Verlaufsdaten. Große Listen sind jeweils auf 10.000 Einträge begrenzt. Auch verschachtelte Objekte werden streng überprüft.

**Wichtige Abgrenzung:** `checksum` wird als genau 64 kleine Hex-Zeichen für SHA-256 vorgeschrieben, aber **die Prüfsumme wird hier noch nicht berechnet oder mit den Daten verglichen**; diese Integritätsprüfung gehört ausdrücklich zu GAME-1607. Ein syntaktisch richtiges `checksum`-Feld ist daher noch kein Beweis für einen unbeschädigten Save. Speichern/Laden, Importgrößenbegrenzung, echte kryptografische Prüfung, Backups und Migrationen folgen als eigene Aufgaben in Phase 16. Das bisherige Spielzustandsformat bleibt unverändert.

Gezielter Test: `npx vitest run tests/unit/savegame-schema.test.ts`. Alle Tests laufen automatisch über die bestehende GitHub-Prüfstrecke.

## Automatische Inhaltsprüfung (GAME-0215)

Mit `npm run validate:content` prüft das Projekt sämtliche JSON-Dateien unter `src/game/content/data/` **vor** der Nutzung. Die Ablage erfolgt jeweils in einem Unterordner: `characters/`, `locations/`, `missions/`, `events/`, `dialogues/`, `achievements/`, `endings/` oder `cheats/`. Jede Datei enthält genau **ein** Objekt gemäß seinem bereits definierten Schema; ihr Name muss mit der Inhalts-ID übereinstimmen (`<id>.json`). Fehler werden samt Dateiname aufgelistet und der Prozess bricht mit Fehlerstatus ab.

Die Prüfung verbietet unbekannte Dateikategorien, andere Dateiformate und unsichere Dateieinträge; JSON-Dateien sind auf **256 KiB** begrenzt. Nach dem Einlesen werden die vorhandenen Schema-Validatoren aufgerufen. Bei Figuren und Orten werden auch bisher nicht geprüfte zusätzliche Felder strikt abgewiesen. **Interne Referenzen** wie Missionsziele, Dialogknoten und unmittelbare Ereignis-Selbstverweise werden geprüft; **dateiübergreifende Referenzintegrität** bleibt ausdrücklich GAME-0217. Globale ID-Eindeutigkeit ist durch GAME-0216 implementiert und CI-geprüft.

Der produktive Datenordner enthält derzeit noch keine JSON-Inhaltsdateien. Deshalb meldet das Skript bei einem leeren Ordner ausdrücklich **0 geprüfte Dateien**, statt Vollständigkeit vorzutäuschen. Zum Nachweis der tatsächlichen Ausführung liegen gültige Beispieldateien ausschließlich unter `tests/fixtures/content-valid/`. Diese werden durch `npm run validate:content -- --root tests/fixtures/content-valid` geprüft. Fehlerhafte Dateien, unbekannte Kategorien, beschädigtes JSON und ungültige interne Verweise werden zusätzlich in automatischen Integrationstests erwartet.

Die GitHub-Qualitätsprüfung führt **beide** Inhaltsprüfungen vor den bestehenden Modultests aus. Es werden keine Inhalte automatisch korrigiert oder ausgeführt; es gibt keinen Eingriff in Savegames.

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
