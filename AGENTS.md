# AGENTS.md — GAME2026

> Verbindliche Codex-Steuerdatei für die Entwicklung eines vollständigen, modularen, spielbaren und validierten Browsergames.
>
> **Projekt:** GAME2026  
> **Repository:** `provoware/GAME2026`  
> **Ziel:** professionelles, statisch deploybares Browsergame  
> **Technik:** TypeScript, HTML, CSS, Vite, Vitest, Playwright  
> **Status:** Spezifikation vollständig, Implementierung noch offen  
> **Release-Ziel:** Version 1.0.0

---

# 000. VERBINDLICHER IST-STAND

## 000.1 Repository

1. Das Repository `provoware/GAME2026` ist erreichbar.
2. Der Standardbranch ist `main`.
3. Der aktuelle Stand enthält nur den Initial-Commit.
4. Es existieren noch keine belastbaren Spiel-, Test-, Build- oder Release-Dateien.
5. Frühere Konzepte gelten erst als umgesetzt, wenn sie im Repository vorhanden, getestet und validiert sind.

## 000.2 Fortschritt

- Spezifikation: 100 %
- Implementierung: 0 %
- Validierung: 0 %
- Release-Fähigkeit: 0 %

Der Gesamtfortschritt wird ausschließlich aus erledigten Pflichtaufgaben in `TODO.md` berechnet.

---

# 001. OBERSTES PROJEKTZIEL

Codex entwickelt ein eigenständiges, satirisches, rundenbasiertes Browsergame mit Retro-Atmosphäre, Wirtschaftssystem, Figuren, Missionen, Entscheidungen, legalen und illegalen Karrierewegen, personalisierten Eingaben, versteckten Cheats, mehreren Enden und hoher Wiederspielbarkeit.

Das Spiel muss:

1. direkt im Browser laufen,
2. statisch deploybar sein,
3. keine zwingende Serverkomponente benötigen,
4. auf Desktop, Tablet und Smartphone funktionieren,
5. vollständig per Tastatur bedienbar sein,
6. reproduzierbare Spielstände erzeugen,
7. robust gegen beschädigte Savegames sein,
8. automatisiert testbar sein,
9. keine geschützten Inhalte historischer Spiele übernehmen,
10. als eigenständiges Original erkennbar sein.

---

# 002. PRODUKTIDENTITÄT

## 002.1 Arbeitstitel

**PPPoppi 1986 — Euronen, Ehre, Untergrund**

## 002.2 Genre

- Rundenbasierte Wirtschaftsstrategie
- Text- und Ereignisspiel
- Karriere- und Milieusimulation
- Satirisches Rollen- und Managementspiel
- Retro-Browsergame

## 002.3 Ton

- direkt
- urban
- bissig
- schwarzhumorig
- systemkritisch
- doppeldeutig
- nicht belehrend
- konsequenzorientiert

## 002.4 Zeit und Welt

Fiktive Metropolregion im Jahr 1986 mit Clubs, Märkten, Baustellen, Hinterhöfen, Bahnhöfen, Bars, Kassettenläden, Ämtern, Fotolaboren und Untergrundnetzwerken.

---

# 003. NICHT VERHANDELBARE TECHNISCHE REGELN

## 003.1 Kein One-File-Projekt

Das Projekt wird modular aufgebaut. Verboten sind:

- vollständige Spiellogik in einer einzigen HTML-Datei,
- globale Skriptblöcke ohne Modulgrenzen,
- unstrukturierte Inline-CSS-Massen,
- unkontrollierte globale Variablen,
- direkt gekoppelte UI- und Spiellogik.

## 003.2 Zielstack

Pflichtstack:

- Node.js LTS
- npm
- Vite
- TypeScript im Strict-Modus
- HTML5
- CSS mit Custom Properties
- Vitest
- Playwright
- ESLint
- Prettier

Optional, nur nach begründeter Entscheidung:

- Zod für Laufzeitvalidierung
- Dexie für IndexedDB
- Workbox für PWA
- Howler nur bei echtem Mehrwert

Keine Framework-Einführung ohne nachweisbaren Nutzen. Standard ist Vanilla TypeScript mit klaren Modulen.

## 003.3 Browserziel

Mindestunterstützung:

- aktuelle Chrome-Version
- aktuelle Firefox-Version
- aktuelle Edge-Version
- aktuelle Safari-Version
- mobile Browser auf Android und iOS

## 003.4 Keine externen Laufzeitabhängigkeiten

Produktionsbetrieb muss nach Build ohne externe CDN-Aufrufe funktionieren.

---

# 004. REPOSITORY-STRUKTUR

```text
GAME2026/
├── AGENTS.md
├── TODO.md
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.js
├── .prettierrc
├── .editorconfig
├── .gitignore
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   ├── icons/
│   ├── audio/
│   └── images/
├── src/
│   ├── main.ts
│   ├── app/
│   │   ├── bootstrap.ts
│   │   ├── app-controller.ts
│   │   ├── router.ts
│   │   └── error-boundary.ts
│   ├── core/
│   │   ├── events/
│   │   ├── state/
│   │   ├── storage/
│   │   ├── validation/
│   │   ├── rng/
│   │   ├── logging/
│   │   └── config/
│   ├── game/
│   │   ├── engine/
│   │   ├── economy/
│   │   ├── calendar/
│   │   ├── characters/
│   │   ├── districts/
│   │   ├── missions/
│   │   ├── events/
│   │   ├── dialogue/
│   │   ├── cheats/
│   │   ├── achievements/
│   │   ├── endings/
│   │   ├── balance/
│   │   └── content/
│   ├── ui/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── overlays/
│   │   ├── accessibility/
│   │   ├── feedback/
│   │   └── theme/
│   ├── styles/
│   │   ├── reset.css
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── utilities.css
│   │   └── themes.css
│   ├── types/
│   └── assets/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   └── accessibility/
├── scripts/
│   ├── validate-content.mjs
│   ├── validate-saves.mjs
│   ├── build-release.mjs
│   └── audit-bundle.mjs
└── dist/
```

---

# 005. ARCHITEKTURGRENZEN

## 005.1 Schichten

1. `core` kennt keine UI.
2. `game` kennt keine DOM-Elemente.
3. `ui` darf Spielzustand nur über Controller und Actions verändern.
4. `storage` darf keine Spielregeln enthalten.
5. `content` enthält Daten, keine imperative Spiellogik.
6. `engine` steuert Regeln, Reihenfolge und Zustandsänderungen.
7. `tests` greifen nicht auf private Implementierungsdetails zu, wenn öffentliche Schnittstellen existieren.

## 005.2 Datenfluss

```text
Benutzereingabe
→ UI-Intent
→ Validierung
→ Action
→ Game Engine
→ Zustandsänderung
→ Ereignisauflösung
→ Persistenz
→ selektives Rendering
→ Nutzerfeedback
```

## 005.3 Zustandsänderung

Alle Zustandsänderungen erfolgen über typisierte Actions:

```ts
type GameAction = {
  type: string;
  payload?: unknown;
  meta?: {
    source?: string;
    timestamp?: number;
  };
};
```

Direkte Mutation aus UI-Komponenten ist verboten.

## 005.4 Seiteneffekte

Seiteneffekte sind zentral zu kapseln:

- Speicherung
- Audio
- Timer
- Dateiexport
- Zwischenablage
- Netzwerk
- Service Worker
- Browserdialoge

---

# 006. CODING-STANDARDS

## 006.1 TypeScript

- `strict: true`
- kein `any`, außer dokumentierte Ausnahme
- keine ungesicherten Type Assertions
- keine unhandled Promises
- exhaustive switch bei Union Types
- readonly, wo sinnvoll
- kleine, benannte Funktionen
- zyklische Imports vermeiden
- öffentliche APIs dokumentieren

## 006.2 Benennung

- Dateien: `kebab-case`
- Typen und Klassen: `PascalCase`
- Funktionen und Variablen: `camelCase`
- Konstanten: `UPPER_SNAKE_CASE`
- IDs: sprechende Präfixe
- Aufgaben: `GAME-0001`

## 006.3 Fehlerbehandlung

Jeder Fehler benötigt:

1. technische Ursache,
2. nutzerverständliche Meldung,
3. sicheren Fallback,
4. Logeintrag,
5. Wiederherstellungsoption, sofern möglich.

## 006.4 Keine Platzhalter

Verboten:

- tote Buttons
- leere Menüs
- Blindtext
- `TODO` im Release-Code
- `FIXME` im Release-Code
- erfundene Testberichte
- ungetestete Release-Aussagen

---

# 007. ENTWICKLUNGSABLAUF

## 007.1 Iteration

Jede Iteration:

1. offene Aufgabe aus `TODO.md` auswählen,
2. betroffenen Bereich analysieren,
3. kleinsten vollständigen Patch planen,
4. Patch implementieren,
5. Lint und Typecheck ausführen,
6. betroffene Tests ausführen,
7. sichtbare Funktion prüfen,
8. TODO-Status aktualisieren,
9. Fortschritt berechnen,
10. Ergebnis melden.

## 007.2 Effizienzregel

- Iteration 1 und 2: gezielte Tests
- jede 3. Iteration: Integrationslauf
- jede 9. Iteration: Vollprüfung
- Änderungen an Save-System, Engine, Schema, RNG, Missionsauflösung oder Router erzwingen sofortige Vollprüfung

## 007.3 Minimal-Patch

- keine unnötigen Umformatierungen
- keine Umbenennungen ohne Mehrwert
- keine parallelen Ersatzsysteme
- Wiederverwendung vor Duplikation
- bestehende Schnittstellen stabil halten
- eine Aufgabe pro Commit, sofern sinnvoll

## 007.4 Bericht

Nach jeder Iteration ausgeben:

- erledigte Aufgaben-ID
- geänderte Dateien
- Tests
- Ergebnis
- Restrisiken
- nächste Aufgaben-ID
- Fortschritt in Prozent

---

# 008. SPIELKERN

## 008.1 Hauptschleife

1. Lagebericht
2. Ort oder Bezirk wählen
3. Aktion wählen
4. Kosten und Risiko prüfen
5. Aktion bestätigen
6. Ergebnis auflösen
7. Folgen verarbeiten
8. Missionen aktualisieren
9. speichern
10. nächsten Zug planen

## 008.2 Zeitmodell

- ein Tag besitzt begrenzte Aktionspunkte
- sieben Tage ergeben eine Woche
- Monatswechsel verarbeiten Einnahmen, Kosten, Zinsen, Fristen, Ereignisse und Rang
- Kampagnenlängen: 12, 24, 36 Monate oder Endlosmodus

## 008.3 Spielmodi

1. Classic
2. Tycoon
3. Clean Legend
4. Chaos

## 008.4 Sieg- und Verlustbedingungen

Sieg kann entstehen durch:

- Vermögen
- Ruf
- Einfluss
- Moral
- kreative Reichweite
- Crewloyalität
- Missionsabschluss
- individuelles Kampagnenziel

Verlust kann entstehen durch:

- Überschuldung
- vollständigen Energiezusammenbruch
- maximalen Ermittlungsdruck
- Crewzerfall
- Fristablauf
- unrettbaren Rufverlust
- Sonderereignisse

---

# 009. SPIELWERTE

Primärwerte:

- cash
- savings
- debt
- reputation
- shadow
- morality
- influence
- creativity
- energy
- stress
- heat
- crewLoyalty
- resonance
- rank
- xp

Regeln:

- normalisierte Werte: 0 bis 100
- Rang: 1 bis 100
- Geldwerte als Integer
- abgeleitete Werte nicht doppelt speichern
- jede Änderung begrenzen und validieren
- alle Werte im Save-Schema versionieren

---

# 010. FIGUREN

## 010.1 Zentrale Figuren

1. PPPoppi Poppsen von Bückstücken
2. Etna Ruppen
3. Krawalla Kordula
4. Rita Resonanz
5. Moni Monopol
6. Lotte Leerlauf
7. Susi Sicherung
8. Berta Bypass
9. Viertel-Mumpi-Paule
10. Milchmädchen-Piet
11. Klomann M-Bia
12. Barfrau R-19
13. Joschi, Partyfotograf

## 010.2 Pflichtdaten pro Figur

- id
- name
- rolle
- bezirk
- loyalität
- vertrauen
- risiko
- fähigkeit
- schwäche
- beziehung
- dialogpool
- missionsbezug
- ereignisbezug
- mögliche Endzustände

Keine Figur darf reine Dekoration sein.

---

# 011. ORTE UND BEZIRKE

Pflichtorte:

1. Bunkerclub
2. S-Bahnhof
3. Markthalle
4. Hinterhofwerkstatt
5. Kassettenladen
6. Kunstkeller
7. Amtsflur
8. Klomann M-Bia
9. Bar R-19
10. Fotolabor
11. Sparschalter
12. Bauplatz
13. Dachstudio
14. Unterführung
15. Lagerhalle

Jeder Ort benötigt:

- eindeutige ID
- Beschreibung
- Zugangsbedingungen
- Aktionen
- Risiken
- Figuren
- Ereignisse
- Audio- und Bildzuordnung
- Barrierefreiheitslabel

---

# 012. ÖKONOMIE

## 012.1 Einnahmen

Legale Tätigkeiten:

- Klomann M-Bia
- Barfrau R-19
- Partyfotografie
- Reparaturhilfe
- Kassettenverkauf
- Kunstauftrag
- Veranstaltungsassistenz
- Marktstand
- Textarbeit
- Nachtwache

Illegale Tätigkeiten bleiben abstrakt:

- Schattenhandel
- riskante Vermittlung
- geheime Veranstaltung
- manipulierte Aufträge
- fiktiver Informationshandel
- Schutzgeschäft als Spielentscheidung

Keine reale Anleitung zu Straftaten.

## 012.2 Monatsreihenfolge

1. Löhne
2. Besitzumsätze
3. variable Einnahmen
4. Fixkosten
5. Unterhalt
6. Schuldenzinsen
7. Sparzinsen
8. Strafen
9. Boni
10. Statistik
11. Rangprüfung
12. Ereignisgenerierung

## 012.3 Balance

Keine Aktion darf unbegrenzt dominieren. Begrenzungen:

- Zeit
- Energie
- Risiko
- Markt
- Nachfrage
- Cooldown
- Ruf
- Ermittlungsdruck
- Ereignisfolgen

---

# 013. MISSIONEN UND EREIGNISSE

## 013.1 Missionstypen

- Hauptmission
- Nebenmission
- Figurenmission
- Bezirksmission
- Monatsauftrag
- Zufallsauftrag
- moralische Entscheidung
- Krisenmission
- geheime Mission
- personalisierte Mission

## 013.2 Missionsstruktur

Jede Mission besitzt:

- id
- titel
- typ
- startbedingungen
- sichtbare Ziele
- verborgene Ziele
- Schritte
- Zeitlimit
- Belohnungen
- Risiken
- Scheiterfolgen
- Dialoge
- personalisierte Felder
- Endzustände

## 013.3 Ereignisse

Ereignisse benötigen:

- Gewichtung
- Sperrzeit
- Bedingungen
- Konfliktgruppen
- Wiederholungsgrenze
- Folgewirkung
- protokollierbare Zufallsquelle

---

# 014. PERSONALISIERUNG

Beim Spielstart können eingegeben werden:

- Spielername
- Spitzname
- Crewname
- Heimatbezirk
- Lieblingsspruch
- Angst
- Ziel
- wichtige Person
- eigener Laden
- Rivale
- Kunstname
- geheimes Wort

Diese Eingaben werden später wiederverwendet in:

- Dialogen
- Missionsnamen
- Gerüchten
- Zeitungszeilen
- Rangaufstiegen
- Krisen
- Enden
- Erfolgen
- Cheats
- Erinnerungsereignissen

Regeln:

- Eingaben validieren
- HTML escapen
- Längen begrenzen
- keine direkte HTML-Ausgabe
- sinnvolle Standardwerte
- nachträglich änderbar
- Savegame-kompatibel

---

# 015. CHEATS UND EASTER EGGS

## 015.1 Eingabe

Versteckte Worteingaben dürfen ausgelöst werden über:

- Terminaldialog
- bestimmte Tastensequenz
- personalisiertes Geheimwort
- versteckte Ortsaktion

## 015.2 Regeln

- Cheats werden im Savegame markiert
- Erfolge können eingeschränkt werden
- Cheats dürfen keine Savegames beschädigen
- jede Wirkung besitzt Rückmeldung
- keine sicherheitskritischen Browserfunktionen
- keine externe Codeausführung
- keine Verwendung von `eval`

## 015.3 Pflichtcheats

Mindestens:

1. Geldbonus
2. Energie auffüllen
3. Ermittlungsdruck senken
4. Ort freischalten
5. Retro-Farbmodus
6. Debug-Statistik
7. Chaosmodus
8. geheime Figur
9. alternativer Abspann
10. persönliches Geheimwort

---

# 016. DIALOGSYSTEM

Dialoge müssen:

- verzweigen
- Folgen besitzen
- Werte prüfen
- Personalisierungen verwenden
- Beziehungen verändern
- Missionen starten
- Varianten gegen Wiederholung besitzen
- vollständig per Tastatur bedienbar sein

Keine Entscheidung ohne erkennbare Wirkung, außer bewusste Täuschung als Spielmechanik.

---

# 017. SPEICHERSYSTEM

## 017.1 Speicherorte

- IndexedDB als primärer Speicher
- LocalStorage nur für kleine Einstellungen
- JSON-Export
- JSON-Import
- Autosave
- mehrere Spielstände
- Schnellladen
- Sicherungskopie

## 017.2 Save-Schema

Pflichtfelder:

- schemaVersion
- gameVersion
- createdAt
- updatedAt
- checksum
- profile
- world
- player
- economy
- missions
- events
- relationships
- achievements
- settings
- rng
- history

## 017.3 Migration

- jede Schemaänderung benötigt Migration
- Savegames niemals stillschweigend überschreiben
- vor Migration Backup erzeugen
- inkompatible Saves verständlich melden
- beschädigte Saves isolieren
- Recovery-Modus anbieten

---

# 018. RNG UND REPRODUZIERBARKEIT

- seedbarer Zufallsgenerator
- Seed im Savegame
- getrennte Zufallsströme für Welt, Ereignisse und UI
- keine Verwendung von `Math.random()` in der Game Engine
- Zufallsentscheidungen protokollierbar
- identischer Seed plus identische Aktionen ergibt identischen Spielverlauf

---

# 019. BENUTZEROBERFLÄCHE

## 019.1 Hauptbereiche

- Header mit Datum, Geld, Energie, Ruf und Ermittlungsdruck
- linke Navigation
- zentrale Spielansicht
- rechte Kontextleiste
- Ereignisprotokoll
- Aktionsbereich
- Dialog-Overlay
- Inventar
- Missionen
- Beziehungen
- Statistik
- Einstellungen
- Savegame-Verwaltung

## 019.2 Responsive Design

Breakpoints:

- Desktop
- kleiner Laptop
- Tablet
- Smartphone

Anforderungen:

- keine überlappenden Elemente
- keine verdeckten Aktionen
- kein horizontaler Seitenlauf
- Touch-Ziele mindestens 44 × 44 CSS-Pixel
- skalierbare Schrift
- reduzierte Bewegung
- Hochkontrastmodus

## 019.3 Themes

Mindestens:

1. Retro Amber
2. Neon Night
3. Beton Grau
4. High Contrast

---

# 020. BARRIEREFREIHEIT

Ziel: WCAG 2.2 AA.

Pflicht:

- semantisches HTML
- sichtbarer Fokus
- vollständige Tastaturbedienung
- Skip-Link
- ARIA nur, wenn nötig
- Dialog-Fokusfalle
- Fokuswiederherstellung
- Screenreader-Live-Regionen
- reduzierte Bewegung
- Kontrastprüfung
- keine Farbcodierung als einziges Signal
- verständliche Fehlermeldungen
- Zoom bis 200 % ohne Funktionsverlust

---

# 021. AUDIO UND MEDIEN

- Audio abschaltbar
- getrennte Lautstärken
- keine automatische laute Wiedergabe
- Untertitel oder visuelle Entsprechung für wichtige Audiosignale
- nur lizenzierte oder selbst erstellte Medien
- Dateigrößen begrenzen
- Lazy Loading
- Fallback bei fehlenden Dateien

---

# 022. PWA UND OFFLINE

Optionaler Release-Schritt nach stabiler Webversion:

- installierbare PWA
- Web App Manifest
- Service Worker
- Offline-App-Shell
- Versionshinweis
- kontrolliertes Cache-Update
- sicherer Fallback bei alter Cacheversion

PWA darf die normale Browserversion nicht blockieren.

---

# 023. SICHERHEIT

- kein `eval`
- kein `new Function`
- kein unkontrolliertes `innerHTML`
- Content Security Policy für Deployment vorbereiten
- Eingaben escapen
- Importdateien streng validieren
- Größenlimits für Import
- keine geheimen Schlüssel im Client
- keine persönlichen Daten übertragen
- keine Analyse- oder Trackingdienste ohne ausdrückliche Entscheidung
- keine Browserberechtigungen ohne Notwendigkeit

---

# 024. TESTSTRATEGIE

## 024.1 Unit Tests

Pflichtbereiche:

- Economy
- Calendar
- RNG
- Actions
- Reducer
- Missionsbedingungen
- Endbedingungen
- Cheatwirkungen
- Save-Migration
- Validierung
- Personalisierung
- Wertebegrenzung

## 024.2 Integrationstests

- neue Kampagne
- Monatswechsel
- Mission annehmen und abschließen
- Scheitern
- Speichern und Laden
- Import und Export
- beschädigtes Savegame
- Cheat-Aktivierung
- alternatives Ende

## 024.3 End-to-End

Mindestens:

- vollständiger Start
- Spielmodus wählen
- Personalisierung
- Aktion ausführen
- Monatswechsel
- speichern
- neu laden
- Spiel fortsetzen
- Ende erreichen
- mobile Ansicht
- Tastaturbedienung

## 024.4 Qualitätsziele

- 100 % der kritischen Engine-Pfade getestet
- mindestens 85 % Statements
- mindestens 80 % Branches
- keine bekannten kritischen Fehler
- keine Konsolenfehler im Happy Path
- kein fehlerhafter Netzwerkaufruf im statischen Build

---

# 025. VALIDIERUNGSGATES

## Gate A — Architektur

- Struktur vollständig
- TypeScript strict
- Modulgrenzen eingehalten
- keine Zyklen
- Build erfolgreich

## Gate B — Spielkern

- neuer Spielstand
- Kernaktion
- Tageswechsel
- Monatswechsel
- Speichern
- Laden
- Ende

## Gate C — Inhalte

- alle IDs eindeutig
- alle Referenzen gültig
- keine unerreichbaren Missionen
- keine leeren Dialoge
- keine ungültigen Werte

## Gate D — UX

- responsive
- tastaturbedienbar
- Fokus korrekt
- Fehlermeldungen verständlich
- kein Layoutbruch

## Gate E — Robustheit

- beschädigter Save
- veralteter Save
- leerer Speicher
- fehlendes Asset
- Browserreload
- Speicherquote erreicht

## Gate F — Release

- Produktionsbuild
- Bundle-Audit
- Lighthouse
- Playwright
- Vitest
- README
- Changelog
- Versionsnummer
- Release-Tag

---

# 026. PERFORMANCE

Zielwerte:

- First Contentful Paint unter 2 Sekunden auf üblichem Desktop
- Time to Interactive unter 3 Sekunden
- initialer JS-Bundle möglichst unter 300 KB komprimiert
- keine unnötigen Re-Renders
- keine wachsenden Event-Listener
- keine dauerhaften Timer ohne Cleanup
- große Inhaltsdaten lazy laden
- Speicherverbrauch überwachen

---

# 027. VERSIONIERUNG

SemVer:

- Patch: Fehlerbehebung
- Minor: neue kompatible Inhalte
- Major: inkompatible Speicher- oder Systemänderungen

Jeder Release benötigt:

- Versionsnummer
- Datum
- Changelog
- getestete Browser
- bekannte Einschränkungen
- Migrationshinweis
- Commit-Hash

---

# 028. DEFINITION OF DONE

Das Projekt ist erst fertig, wenn:

1. alle Pflichtaufgaben in `TODO.md` erledigt sind,
2. Produktionsbuild fehlerfrei ist,
3. alle Gates bestehen,
4. Spielstart und Spielende funktionieren,
5. mindestens zwölf Enden erreichbar sind,
6. Savegames robust funktionieren,
7. Barrierefreiheit geprüft ist,
8. Desktop und Mobile geprüft sind,
9. keine kritischen Konsolenfehler auftreten,
10. keine Platzhalter vorhanden sind,
11. README und Changelog vollständig sind,
12. Version 1.0.0 getaggt werden kann.

---

# 029. ABSCHLUSSFORMAT FÜR CODEX

Nach jeder Arbeitsphase:

```text
Erledigt:
- GAME-XXXX

Geändert:
- datei
- datei

Validiert:
- npm run lint
- npm run typecheck
- npm test
- npm run test:e2e

Restrisiken:
- ...

Nächster Schritt:
- GAME-XXXX

Entwicklungsfortschritt:
- XX %
```
