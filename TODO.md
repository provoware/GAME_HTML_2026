# TODO.md — GAME2026

> Vollständiger, nummerierter Entwicklungsplan für Codex.
>
> Statuswerte: `[ ] offen`, `[-] in Arbeit`, `[x] erledigt`, `[!] blockiert`
>
> Fortschritt = erledigte Pflichtaufgaben / alle Pflichtaufgaben × 100  
> Aktueller Implementierungsfortschritt: **6,0 %**

---

# PHASE 00 — REPOSITORY UND GRUNDLAGE

- [x] **GAME-0001** Repository-Inhalt prüfen und Ausgangszustand dokumentieren.
- [x] **GAME-0002** `AGENTS.md` und `TODO.md` in `main` übernehmen.
- [x] **GAME-0003** `.gitignore`, `.editorconfig` und `.prettierrc` anlegen.
- [x] **GAME-0004** Node-LTS-Version festlegen und dokumentieren.
- [x] **GAME-0005** `package.json` mit Scripts und Metadaten anlegen.
- [x] **GAME-0006** Vite-Projektstruktur erzeugen.
- [x] **GAME-0007** TypeScript im Strict-Modus konfigurieren.
- [x] **GAME-0008** ESLint konfigurieren.
- [x] **GAME-0009** Prettier integrieren.
- [x] **GAME-0010** Vitest konfigurieren.
- [x] **GAME-0011** Playwright konfigurieren.
- [x] **GAME-0012** README-Grundstruktur anlegen.
- [x] **GAME-0013** CHANGELOG anlegen.
- [x] **GAME-0014** Lizenzentscheidung dokumentieren.
- [x] **GAME-0015** erste Build-, Lint- und Testpipeline erfolgreich ausführen.

**Abnahme Phase 00:** `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` funktionieren.

---

# PHASE 01 — ARCHITEKTURKERN

- [x] **GAME-0101** Ordnerstruktur gemäß `AGENTS.md` anlegen.
- [x] **GAME-0102** zentralen App-Bootstrap implementieren.
- [x] **GAME-0103** Fehlergrenze und globale Fehlerbehandlung implementieren.
- [x] **GAME-0104** Konfigurationsmodul implementieren.
- [x] **GAME-0105** Event-Bus mit typisierten Ereignissen implementieren.
- [x] **GAME-0106** Action- und Dispatch-System implementieren.
- [x] **GAME-0107** zentralen Game-State-Typ definieren.
- [x] **GAME-0108** initialen Zustand erzeugen.
- [x] **GAME-0109** Reducer- oder Command-Verarbeitung implementieren.
- [x] **GAME-0110** selektive State-Subscriptions implementieren.
- [x] **GAME-0111** Logging-System mit Leveln implementieren.
- [x] **GAME-0112** Diagnosemodus implementieren.
- [x] **GAME-0113** Router für Hauptscreens implementieren.
- [ ] **GAME-0114** Architekturtests gegen verbotene Abhängigkeiten anlegen.
- [ ] **GAME-0115** zyklische Imports automatisch prüfen.

**Abnahme Phase 01:** UI kann Zustand lesen, Actions auslösen und Fehler sauber anzeigen.

---

# PHASE 02 — DATENMODELLE UND SCHEMATA

- [ ] **GAME-0201** IDs und Namenskonventionen definieren.
- [ ] **GAME-0202** Spielerprofil-Schema definieren.
- [ ] **GAME-0203** Weltzustand-Schema definieren.
- [ ] **GAME-0204** Wirtschafts-Schema definieren.
- [ ] **GAME-0205** Figuren-Schema definieren.
- [ ] **GAME-0206** Orts-Schema definieren.
- [ ] **GAME-0207** Missions-Schema definieren.
- [ ] **GAME-0208** Ereignis-Schema definieren.
- [ ] **GAME-0209** Dialog-Schema definieren.
- [ ] **GAME-0210** Achievement-Schema definieren.
- [ ] **GAME-0211** Enden-Schema definieren.
- [ ] **GAME-0212** Cheat-Schema definieren.
- [ ] **GAME-0213** Savegame-Schema definieren.
- [ ] **GAME-0214** Laufzeitvalidierung implementieren.
- [ ] **GAME-0215** Inhaltsvalidierungsskript implementieren.
- [ ] **GAME-0216** eindeutige ID-Prüfung implementieren.
- [ ] **GAME-0217** Referenzintegritätsprüfung implementieren.
- [ ] **GAME-0218** Schema-Tests erstellen.

**Abnahme Phase 02:** ungültige Inhalte und Saves werden vor Laufzeitstart erkannt.

---

# PHASE 03 — RNG UND REPRODUZIERBARKEIT

- [ ] **GAME-0301** seedbaren Zufallsgenerator auswählen und kapseln.
- [ ] **GAME-0302** getrennte RNG-Streams definieren.
- [ ] **GAME-0303** Seed-Erzeugung implementieren.
- [ ] **GAME-0304** Seed im Savegame speichern.
- [ ] **GAME-0305** gewichtete Zufallsauswahl implementieren.
- [ ] **GAME-0306** deterministische Shuffle-Funktion implementieren.
- [ ] **GAME-0307** Zufallsprotokoll für Diagnosemodus implementieren.
- [ ] **GAME-0308** Verwendung von `Math.random()` in Game-Modulen verhindern.
- [ ] **GAME-0309** Reproduzierbarkeitstests anlegen.
- [ ] **GAME-0310** Replay-Grundlage dokumentieren.

**Abnahme Phase 03:** identischer Seed und identische Aktionen erzeugen identische Ergebnisse.

---

# PHASE 04 — ZEIT, KALENDER UND AKTIONSPUNKTE

- [ ] **GAME-0401** Spieltag-Datenmodell implementieren.
- [ ] **GAME-0402** Wochenmodell implementieren.
- [ ] **GAME-0403** Monatsmodell implementieren.
- [ ] **GAME-0404** Aktionspunkte definieren.
- [ ] **GAME-0405** Aktionskosten validieren.
- [ ] **GAME-0406** Tageswechsel implementieren.
- [ ] **GAME-0407** Wochenwechsel implementieren.
- [ ] **GAME-0408** Monatswechsel-Pipeline implementieren.
- [ ] **GAME-0409** Kampagnenlängen implementieren.
- [ ] **GAME-0410** Endlosmodus vorbereiten.
- [ ] **GAME-0411** Fristensystem implementieren.
- [ ] **GAME-0412** Kalender-Unit-Tests anlegen.

**Abnahme Phase 04:** Zeitfortschritt ist deterministisch und ohne doppelte Abrechnung.

---

# PHASE 05 — SPIELERPROFIL UND PERSONALISIERUNG

- [ ] **GAME-0501** Startwizard-Konzept umsetzen.
- [ ] **GAME-0502** Spielername erfassen.
- [ ] **GAME-0503** Spitzname erfassen.
- [ ] **GAME-0504** Crewname erfassen.
- [ ] **GAME-0505** Heimatbezirk erfassen.
- [ ] **GAME-0506** Lieblingsspruch erfassen.
- [ ] **GAME-0507** Angst erfassen.
- [ ] **GAME-0508** persönliches Ziel erfassen.
- [ ] **GAME-0509** wichtige Person erfassen.
- [ ] **GAME-0510** Ladenname erfassen.
- [ ] **GAME-0511** Rivalenname erfassen.
- [ ] **GAME-0512** Kunstname erfassen.
- [ ] **GAME-0513** geheimes Wort erfassen.
- [ ] **GAME-0514** Eingabelängen begrenzen.
- [ ] **GAME-0515** Eingaben sicher escapen.
- [ ] **GAME-0516** Standardwerte anbieten.
- [ ] **GAME-0517** Profilbearbeitung nach Spielstart ermöglichen.
- [ ] **GAME-0518** personalisierte Textbausteine implementieren.
- [ ] **GAME-0519** Personalisierungstests anlegen.

**Abnahme Phase 05:** Eingaben erscheinen später sicher und sinnvoll im Spiel.

---

# PHASE 06 — FIGURENSYSTEM

- [ ] **GAME-0601** Figurenbasisdaten anlegen.
- [ ] **GAME-0602** PPPoppi implementieren.
- [ ] **GAME-0603** Etna Ruppen implementieren.
- [ ] **GAME-0604** Krawalla Kordula implementieren.
- [ ] **GAME-0605** Rita Resonanz implementieren.
- [ ] **GAME-0606** Moni Monopol implementieren.
- [ ] **GAME-0607** Lotte Leerlauf implementieren.
- [ ] **GAME-0608** Susi Sicherung implementieren.
- [ ] **GAME-0609** Berta Bypass implementieren.
- [ ] **GAME-0610** Viertel-Mumpi-Paule implementieren.
- [ ] **GAME-0611** Milchmädchen-Piet implementieren.
- [ ] **GAME-0612** Klomann M-Bia implementieren.
- [ ] **GAME-0613** Barfrau R-19 implementieren.
- [ ] **GAME-0614** Joschi implementieren.
- [ ] **GAME-0615** Beziehungswerte implementieren.
- [ ] **GAME-0616** Loyalität implementieren.
- [ ] **GAME-0617** Vertrauen implementieren.
- [ ] **GAME-0618** Konfliktzustände implementieren.
- [ ] **GAME-0619** Figurenfähigkeiten implementieren.
- [ ] **GAME-0620** Figuren-Endzustände implementieren.
- [ ] **GAME-0621** Figurenvalidierung und Tests anlegen.

**Abnahme Phase 06:** jede Figur beeinflusst mindestens zwei Spielsysteme.

---

# PHASE 07 — ORTE, BEZIRKE UND REISEN

- [ ] **GAME-0701** Bezirksdatenmodell implementieren.
- [ ] **GAME-0702** Bunkerclub anlegen.
- [ ] **GAME-0703** S-Bahnhof anlegen.
- [ ] **GAME-0704** Markthalle anlegen.
- [ ] **GAME-0705** Hinterhofwerkstatt anlegen.
- [ ] **GAME-0706** Kassettenladen anlegen.
- [ ] **GAME-0707** Kunstkeller anlegen.
- [ ] **GAME-0708** Amtsflur anlegen.
- [ ] **GAME-0709** Klomann M-Bia als Ort anlegen.
- [ ] **GAME-0710** Bar R-19 anlegen.
- [ ] **GAME-0711** Fotolabor anlegen.
- [ ] **GAME-0712** Sparschalter anlegen.
- [ ] **GAME-0713** Bauplatz anlegen.
- [ ] **GAME-0714** Dachstudio anlegen.
- [ ] **GAME-0715** Unterführung anlegen.
- [ ] **GAME-0716** Lagerhalle anlegen.
- [ ] **GAME-0717** Reisekosten implementieren.
- [ ] **GAME-0718** Zugangsbedingungen implementieren.
- [ ] **GAME-0719** Ortssperren und Freischaltungen implementieren.
- [ ] **GAME-0720** Kartenansicht implementieren.
- [ ] **GAME-0721** Kartenzoom und Tastatursteuerung implementieren.
- [ ] **GAME-0722** Ortstests und Referenztests anlegen.

**Abnahme Phase 07:** alle Orte sind erreichbar oder nachvollziehbar gesperrt.

---

# PHASE 08 — WIRTSCHAFT UND GELD

- [ ] **GAME-0801** Integer-basiertes Geldsystem implementieren.
- [ ] **GAME-0802** Bargeld implementieren.
- [ ] **GAME-0803** Sparguthaben implementieren.
- [ ] **GAME-0804** Schulden implementieren.
- [ ] **GAME-0805** Fixkosten implementieren.
- [ ] **GAME-0806** Unterhalt implementieren.
- [ ] **GAME-0807** Monatslohn implementieren.
- [ ] **GAME-0808** Sparzinsen implementieren.
- [ ] **GAME-0809** Schuldenzinsen implementieren.
- [ ] **GAME-0810** Besitzumsätze implementieren.
- [ ] **GAME-0811** Marktpreise implementieren.
- [ ] **GAME-0812** Nachfrage und Cooldowns implementieren.
- [ ] **GAME-0813** legale Tätigkeiten implementieren.
- [ ] **GAME-0814** abstrakte illegale Tätigkeiten implementieren.
- [ ] **GAME-0815** Einkommenshistorie implementieren.
- [ ] **GAME-0816** Ausgabenhistorie implementieren.
- [ ] **GAME-0817** Wirtschaftsbalance-Regeln implementieren.
- [ ] **GAME-0818** Exploit-Tests anlegen.
- [ ] **GAME-0819** Monatsabrechnungstests anlegen.

**Abnahme Phase 08:** keine doppelte Buchung, keine Fließkommafehler, keine triviale Endlosschleife.

---

# PHASE 09 — SPIELWERTE, RANG UND FORTSCHRITT

- [ ] **GAME-0901** Ruf implementieren.
- [ ] **GAME-0902** Schattenstatus implementieren.
- [ ] **GAME-0903** Moral implementieren.
- [ ] **GAME-0904** Einfluss implementieren.
- [ ] **GAME-0905** Kreativität implementieren.
- [ ] **GAME-0906** Energie implementieren.
- [ ] **GAME-0907** Stress implementieren.
- [ ] **GAME-0908** Ermittlungsdruck implementieren.
- [ ] **GAME-0909** Crewloyalität implementieren.
- [ ] **GAME-0910** Resonanz implementieren.
- [ ] **GAME-0911** Erfahrungspunkte implementieren.
- [ ] **GAME-0912** Rangsystem 1 bis 100 implementieren.
- [ ] **GAME-0913** abgeleitete Werte implementieren.
- [ ] **GAME-0914** Wertebegrenzung zentralisieren.
- [ ] **GAME-0915** Rangaufstiegsfeedback implementieren.
- [ ] **GAME-0916** Wertetests anlegen.

**Abnahme Phase 09:** Werte bleiben immer in gültigen Bereichen.

---

# PHASE 10 — AKTIONSSYSTEM

- [ ] **GAME-1001** Actionschema definieren.
- [ ] **GAME-1002** Arbeiten implementieren.
- [ ] **GAME-1003** Handeln implementieren.
- [ ] **GAME-1004** Recherchieren implementieren.
- [ ] **GAME-1005** Trainieren implementieren.
- [ ] **GAME-1006** Kontakte pflegen implementieren.
- [ ] **GAME-1007** Crew führen implementieren.
- [ ] **GAME-1008** Auftrag annehmen implementieren.
- [ ] **GAME-1009** Auftrag fortsetzen implementieren.
- [ ] **GAME-1010** Besitz verwalten implementieren.
- [ ] **GAME-1011** Sparen implementieren.
- [ ] **GAME-1012** Investieren implementieren.
- [ ] **GAME-1013** Reisen implementieren.
- [ ] **GAME-1014** Erholen implementieren.
- [ ] **GAME-1015** Gerücht streuen implementieren.
- [ ] **GAME-1016** öffentlich auftreten implementieren.
- [ ] **GAME-1017** Risikoaktion implementieren.
- [ ] **GAME-1018** Notfallaktion implementieren.
- [ ] **GAME-1019** Aktionsvorschau implementieren.
- [ ] **GAME-1020** Aktionsbestätigung implementieren.
- [ ] **GAME-1021** Aktionshistorie implementieren.
- [ ] **GAME-1022** Action-Integrationstests anlegen.

**Abnahme Phase 10:** jede Aktion zeigt Kosten, Risiko, Wirkung und Ergebnis.

---

# PHASE 11 — DIALOGSYSTEM

- [ ] **GAME-1101** Dialogdatenmodell implementieren.
- [ ] **GAME-1102** Dialogbedingungen implementieren.
- [ ] **GAME-1103** Dialogentscheidungen implementieren.
- [ ] **GAME-1104** Dialogfolgen implementieren.
- [ ] **GAME-1105** personalisierte Platzhalter implementieren.
- [ ] **GAME-1106** Beziehungsänderungen implementieren.
- [ ] **GAME-1107** Missionsstart aus Dialog implementieren.
- [ ] **GAME-1108** Dialogvarianten gegen Wiederholung implementieren.
- [ ] **GAME-1109** Dialogprotokoll implementieren.
- [ ] **GAME-1110** Tastatursteuerung implementieren.
- [ ] **GAME-1111** Screenreader-Ausgabe implementieren.
- [ ] **GAME-1112** Dialogtests anlegen.

**Abnahme Phase 11:** Dialogentscheidungen erzeugen nachvollziehbare Folgen.

---

# PHASE 12 — MISSIONSENGINE

- [ ] **GAME-1201** Mission State Machine implementieren.
- [ ] **GAME-1202** Startbedingungen implementieren.
- [ ] **GAME-1203** sichtbare Ziele implementieren.
- [ ] **GAME-1204** verborgene Ziele implementieren.
- [ ] **GAME-1205** Missionsschritte implementieren.
- [ ] **GAME-1206** Zeitlimits implementieren.
- [ ] **GAME-1207** Belohnungen implementieren.
- [ ] **GAME-1208** Risiken implementieren.
- [ ] **GAME-1209** Scheiterfolgen implementieren.
- [ ] **GAME-1210** Hauptmissionen-Grundgerüst anlegen.
- [ ] **GAME-1211** Nebenmissionen-Grundgerüst anlegen.
- [ ] **GAME-1212** Figurenmissionen anlegen.
- [ ] **GAME-1213** Bezirksmissionen anlegen.
- [ ] **GAME-1214** Monatsaufträge anlegen.
- [ ] **GAME-1215** Zufallsaufträge anlegen.
- [ ] **GAME-1216** moralische Entscheidungen anlegen.
- [ ] **GAME-1217** Krisenmissionen anlegen.
- [ ] **GAME-1218** geheime Missionen anlegen.
- [ ] **GAME-1219** personalisierte Missionen anlegen.
- [ ] **GAME-1220** Unerreichbarkeitsprüfung implementieren.
- [ ] **GAME-1221** Missionsintegrationstests anlegen.

**Abnahme Phase 12:** Missionen können starten, fortschreiten, scheitern und enden.

---

# PHASE 13 — EREIGNISENGINE

- [ ] **GAME-1301** Ereignisgewichtung implementieren.
- [ ] **GAME-1302** Bedingungen implementieren.
- [ ] **GAME-1303** Sperrzeiten implementieren.
- [ ] **GAME-1304** Konfliktgruppen implementieren.
- [ ] **GAME-1305** Wiederholungsgrenzen implementieren.
- [ ] **GAME-1306** Folgeereignisse implementieren.
- [ ] **GAME-1307** Bezirksevents implementieren.
- [ ] **GAME-1308** Figurenevents implementieren.
- [ ] **GAME-1309** Wirtschaftsevents implementieren.
- [ ] **GAME-1310** Monatsevents implementieren.
- [ ] **GAME-1311** Krisenevents implementieren.
- [ ] **GAME-1312** satirische Nachrichtenevents implementieren.
- [ ] **GAME-1313** Personalisierung in Ereignissen implementieren.
- [ ] **GAME-1314** Ereignisprotokoll implementieren.
- [ ] **GAME-1315** Ereignistests anlegen.

**Abnahme Phase 13:** Ereignisse wiederholen sich nicht unkontrolliert und bleiben reproduzierbar.

---

# PHASE 14 — CHEATS UND EASTER EGGS

- [ ] **GAME-1401** versteckte Worteingabe implementieren.
- [ ] **GAME-1402** Cheat-Markierung im Savegame implementieren.
- [ ] **GAME-1403** Geldbonus-Cheat implementieren.
- [ ] **GAME-1404** Energie-Cheat implementieren.
- [ ] **GAME-1405** Ermittlungsdruck-Cheat implementieren.
- [ ] **GAME-1406** Ortsfreischaltung implementieren.
- [ ] **GAME-1407** Retro-Farbmodus implementieren.
- [ ] **GAME-1408** Debug-Statistik implementieren.
- [ ] **GAME-1409** Chaosmodus-Cheat implementieren.
- [ ] **GAME-1410** geheime Figur implementieren.
- [ ] **GAME-1411** alternativen Abspann implementieren.
- [ ] **GAME-1412** persönliches Geheimwort integrieren.
- [ ] **GAME-1413** Achievement-Einschränkung implementieren.
- [ ] **GAME-1414** Cheat-Sicherheitstests anlegen.

**Abnahme Phase 14:** kein Cheat beschädigt Spielstand oder Engine.

---

# PHASE 15 — ERFOLGE UND ENDEN

- [ ] **GAME-1501** Achievement-Engine implementieren.
- [ ] **GAME-1502** sichtbare Erfolge definieren.
- [ ] **GAME-1503** geheime Erfolge definieren.
- [ ] **GAME-1504** Fortschrittsanzeige implementieren.
- [ ] **GAME-1505** Untergrundlegende-Ende implementieren.
- [ ] **GAME-1506** Saubere-Ikone-Ende implementieren.
- [ ] **GAME-1507** Euronen-Monopol-Ende implementieren.
- [ ] **GAME-1508** Crew-Familie-Ende implementieren.
- [ ] **GAME-1509** Einsame-Spitze-Ende implementieren.
- [ ] **GAME-1510** Bürokratisch-zerlegt-Ende implementieren.
- [ ] **GAME-1511** Schulden-Ende implementieren.
- [ ] **GAME-1512** Ermittlungsdruck-Ende implementieren.
- [ ] **GAME-1513** Moralisch-unantastbar-Ende implementieren.
- [ ] **GAME-1514** Reich-und-verlassen-Ende implementieren.
- [ ] **GAME-1515** Kultureller-Durchbruch-Ende implementieren.
- [ ] **GAME-1516** Chaoskrone-Ende implementieren.
- [ ] **GAME-1517** personalisierten Abspann implementieren.
- [ ] **GAME-1518** Endbedingungs-Tests anlegen.
- [ ] **GAME-1519** Erreichbarkeit aller Enden prüfen.

**Abnahme Phase 15:** mindestens zwölf eindeutig erreichbare Enden.

---

# PHASE 16 — SAVEGAME UND PERSISTENZ

- [ ] **GAME-1601** IndexedDB-Abstraktion implementieren.
- [ ] **GAME-1602** Einstellungs-Speicher implementieren.
- [ ] **GAME-1603** Autosave implementieren.
- [ ] **GAME-1604** manuelles Speichern implementieren.
- [ ] **GAME-1605** mehrere Slots implementieren.
- [ ] **GAME-1606** Schnellladen implementieren.
- [ ] **GAME-1607** Save-Checksumme implementieren.
- [ ] **GAME-1608** Save-Export implementieren.
- [ ] **GAME-1609** Save-Import implementieren.
- [ ] **GAME-1610** Importgrößenlimit implementieren.
- [ ] **GAME-1611** Save-Validierung implementieren.
- [ ] **GAME-1612** Backup vor Migration implementieren.
- [ ] **GAME-1613** Migration Framework implementieren.
- [ ] **GAME-1614** beschädigte Saves isolieren.
- [ ] **GAME-1615** Recovery-Modus implementieren.
- [ ] **GAME-1616** Speicherfehler nutzerverständlich anzeigen.
- [ ] **GAME-1617** Reload- und Crash-Szenarien testen.
- [ ] **GAME-1618** Save-Migrationstests anlegen.

**Abnahme Phase 16:** alte, beschädigte und aktuelle Saves werden sicher behandelt.

---

# PHASE 17 — UI-GRUNDGERÜST

- [ ] **GAME-1701** Design Tokens definieren.
- [ ] **GAME-1702** CSS Reset integrieren.
- [ ] **GAME-1703** Grundlayout implementieren.
- [ ] **GAME-1704** Header implementieren.
- [ ] **GAME-1705** Navigation implementieren.
- [ ] **GAME-1706** zentrale Spielansicht implementieren.
- [ ] **GAME-1707** Kontextleiste implementieren.
- [ ] **GAME-1708** Ereignisprotokoll implementieren.
- [ ] **GAME-1709** Aktionsbereich implementieren.
- [ ] **GAME-1710** Dialog-Overlay implementieren.
- [ ] **GAME-1711** Inventaransicht implementieren.
- [ ] **GAME-1712** Missionsansicht implementieren.
- [ ] **GAME-1713** Beziehungsansicht implementieren.
- [ ] **GAME-1714** Statistikansicht implementieren.
- [ ] **GAME-1715** Einstellungsansicht implementieren.
- [ ] **GAME-1716** Savegame-Verwaltung implementieren.
- [ ] **GAME-1717** Toast- und Feedbacksystem implementieren.
- [ ] **GAME-1718** Ladezustände implementieren.
- [ ] **GAME-1719** Leerezustände implementieren.
- [ ] **GAME-1720** Fehlerzustände implementieren.

**Abnahme Phase 17:** alle Hauptscreens sind erreichbar und funktional.

---

# PHASE 18 — RESPONSIVE DESIGN UND THEMES

- [ ] **GAME-1801** Desktoplayout fertigstellen.
- [ ] **GAME-1802** Laptoplayout fertigstellen.
- [ ] **GAME-1803** Tabletlayout fertigstellen.
- [ ] **GAME-1804** Smartphonelayout fertigstellen.
- [ ] **GAME-1805** horizontales Überlaufen verhindern.
- [ ] **GAME-1806** Touch-Ziele validieren.
- [ ] **GAME-1807** Schriftgrößenskalierung implementieren.
- [ ] **GAME-1808** Retro-Amber-Theme implementieren.
- [ ] **GAME-1809** Neon-Night-Theme implementieren.
- [ ] **GAME-1810** Beton-Grau-Theme implementieren.
- [ ] **GAME-1811** High-Contrast-Theme implementieren.
- [ ] **GAME-1812** Theme-Persistenz implementieren.
- [ ] **GAME-1813** reduzierte Bewegung implementieren.
- [ ] **GAME-1814** visuelle Regressionstests anlegen.

**Abnahme Phase 18:** kein Layoutbruch zwischen 320 und 2560 Pixel Breite.

---

# PHASE 19 — BARRIEREFREIHEIT

- [ ] **GAME-1901** semantische Landmarken prüfen.
- [ ] **GAME-1902** Skip-Link implementieren.
- [ ] **GAME-1903** sichtbaren Fokus standardisieren.
- [ ] **GAME-1904** vollständige Tastaturnavigation implementieren.
- [ ] **GAME-1905** Dialog-Fokusfalle implementieren.
- [ ] **GAME-1906** Fokuswiederherstellung implementieren.
- [ ] **GAME-1907** Live-Regionen implementieren.
- [ ] **GAME-1908** Screenreader-Texte ergänzen.
- [ ] **GAME-1909** Kontrastprüfung durchführen.
- [ ] **GAME-1910** Statusanzeigen ohne reine Farbcodierung umsetzen.
- [ ] **GAME-1911** Zoom bis 200 % prüfen.
- [ ] **GAME-1912** Tastatur-E2E-Test anlegen.
- [ ] **GAME-1913** Axe-Prüfung integrieren.
- [ ] **GAME-1914** WCAG-2.2-AA-Abnahme dokumentieren.

**Abnahme Phase 19:** alle Hauptfunktionen sind ohne Maus bedienbar.

---

# PHASE 20 — AUDIO, GRAFIK UND MEDIEN

- [ ] **GAME-2001** Medienlizenzregeln dokumentieren.
- [ ] **GAME-2002** Asset-Ordner strukturieren.
- [ ] **GAME-2003** Audio-Manager implementieren.
- [ ] **GAME-2004** Masterlautstärke implementieren.
- [ ] **GAME-2005** getrennte Musik- und Effektlautstärke implementieren.
- [ ] **GAME-2006** Stummschaltung implementieren.
- [ ] **GAME-2007** visuelle Alternative für wichtige Audiosignale umsetzen.
- [ ] **GAME-2008** Bildformate und Größen optimieren.
- [ ] **GAME-2009** Lazy Loading implementieren.
- [ ] **GAME-2010** Asset-Fallback implementieren.
- [ ] **GAME-2011** Bundle-Auswirkung prüfen.
- [ ] **GAME-2012** fehlende Assets automatisiert testen.

**Abnahme Phase 20:** fehlende Medien blockieren das Spiel nicht.

---

# PHASE 21 — SPIELMODI UND BALANCE

- [ ] **GAME-2101** Classic-Modus implementieren.
- [ ] **GAME-2102** Tycoon-Modus implementieren.
- [ ] **GAME-2103** Clean-Legend-Modus implementieren.
- [ ] **GAME-2104** Chaos-Modus implementieren.
- [ ] **GAME-2105** modusspezifische Startwerte definieren.
- [ ] **GAME-2106** modusspezifische Ereignisgewichte definieren.
- [ ] **GAME-2107** modusspezifische Endbedingungen definieren.
- [ ] **GAME-2108** kurze Kampagne balancieren.
- [ ] **GAME-2109** Standardkampagne balancieren.
- [ ] **GAME-2110** lange Kampagne balancieren.
- [ ] **GAME-2111** Endlosmodus balancieren.
- [ ] **GAME-2112** Simulation für 1.000 automatische Durchläufe erstellen.
- [ ] **GAME-2113** dominante Strategien identifizieren.
- [ ] **GAME-2114** Sackgassen identifizieren.
- [ ] **GAME-2115** Balancereport erstellen.
- [ ] **GAME-2116** finale Werte einpflegen.

**Abnahme Phase 21:** mehrere Strategien sind spielbar, keine triviale Standardlösung dominiert.

---

# PHASE 22 — PWA UND OFFLINE-MODUS

- [ ] **GAME-2201** Web App Manifest anlegen.
- [ ] **GAME-2202** App-Icons erzeugen.
- [ ] **GAME-2203** Service Worker integrieren.
- [ ] **GAME-2204** App-Shell offline verfügbar machen.
- [ ] **GAME-2205** Update-Strategie implementieren.
- [ ] **GAME-2206** alte Cacheversion sicher ersetzen.
- [ ] **GAME-2207** Offline-Start testen.
- [ ] **GAME-2208** PWA-Installation testen.
- [ ] **GAME-2209** PWA-Fallback testen.
- [ ] **GAME-2210** normale Browserversion ohne Service Worker testen.

**Abnahme Phase 22:** das Spiel funktioniert online, offline und installiert.

---

# PHASE 23 — SICHERHEIT UND DATENSCHUTZ

- [ ] **GAME-2301** `eval` und dynamische Codeausführung ausschließen.
- [ ] **GAME-2302** direkte `innerHTML`-Nutzung auditieren.
- [ ] **GAME-2303** Importdaten gegen Schema validieren.
- [ ] **GAME-2304** XSS-Tests für Personalisierung anlegen.
- [ ] **GAME-2305** Content Security Policy vorbereiten.
- [ ] **GAME-2306** externe Requests auditieren.
- [ ] **GAME-2307** keine Secrets im Client sicherstellen.
- [ ] **GAME-2308** Datenschutztext erstellen.
- [ ] **GAME-2309** Trackingfreiheit dokumentieren.
- [ ] **GAME-2310** Sicherheitsabnahme durchführen.

**Abnahme Phase 23:** keine bekannte kritische Client-Sicherheitslücke.

---

# PHASE 24 — TESTAUTOMATISIERUNG

- [ ] **GAME-2401** Unit-Teststruktur vervollständigen.
- [ ] **GAME-2402** Integrationsteststruktur vervollständigen.
- [ ] **GAME-2403** E2E-Teststruktur vervollständigen.
- [ ] **GAME-2404** Test-Fixtures erstellen.
- [ ] **GAME-2405** Happy-Path-Kampagne testen.
- [ ] **GAME-2406** Scheiterkampagne testen.
- [ ] **GAME-2407** Save-und-Load testen.
- [ ] **GAME-2408** Import-und-Export testen.
- [ ] **GAME-2409** Cheatpfad testen.
- [ ] **GAME-2410** alle Enden testen.
- [ ] **GAME-2411** mobile Bedienung testen.
- [ ] **GAME-2412** Tastaturbedienung testen.
- [ ] **GAME-2413** Browserreload testen.
- [ ] **GAME-2414** beschädigte Saves testen.
- [ ] **GAME-2415** Coverage-Ziele erreichen.
- [ ] **GAME-2416** Flaky Tests beseitigen.
- [ ] **GAME-2417** Konsolenfehler als Testfehler behandeln.

**Abnahme Phase 24:** alle automatisierten Tests laufen reproduzierbar grün.

---

# PHASE 25 — PERFORMANCE UND ROBUSTHEIT

- [ ] **GAME-2501** Bundle analysieren.
- [ ] **GAME-2502** unnötige Abhängigkeiten entfernen.
- [ ] **GAME-2503** Code Splitting prüfen.
- [ ] **GAME-2504** Content Lazy Loading implementieren.
- [ ] **GAME-2505** DOM-Update-Profiling durchführen.
- [ ] **GAME-2506** Event-Listener-Leaks prüfen.
- [ ] **GAME-2507** Timer-Cleanup prüfen.
- [ ] **GAME-2508** Speicherverbrauch prüfen.
- [ ] **GAME-2509** 36-Monats-Spielstand stresstesten.
- [ ] **GAME-2510** 1.000 Ereignisse stresstesten.
- [ ] **GAME-2511** langsame Geräte simulieren.
- [ ] **GAME-2512** Lighthouse-Ziele erreichen.
- [ ] **GAME-2513** Performancebericht dokumentieren.

**Abnahme Phase 25:** keine zunehmende Verlangsamung über lange Spielstände.

---

# PHASE 26 — DOKUMENTATION

- [ ] **GAME-2601** README vollständig schreiben.
- [ ] **GAME-2602** Installationsanleitung schreiben.
- [ ] **GAME-2603** Entwicklungsanleitung schreiben.
- [ ] **GAME-2604** Testanleitung schreiben.
- [ ] **GAME-2605** Buildanleitung schreiben.
- [ ] **GAME-2606** Deploymentanleitung schreiben.
- [ ] **GAME-2607** Architekturübersicht schreiben.
- [ ] **GAME-2608** Save-Schema dokumentieren.
- [ ] **GAME-2609** Content-Schema dokumentieren.
- [ ] **GAME-2610** Modding-Grenzen dokumentieren.
- [ ] **GAME-2611** Browserunterstützung dokumentieren.
- [ ] **GAME-2612** bekannte Einschränkungen dokumentieren.
- [ ] **GAME-2613** Credits und Lizenzen dokumentieren.

**Abnahme Phase 26:** ein neuer Entwickler kann das Projekt ohne Zusatzwissen starten.

---

# PHASE 27 — DEPLOYMENT UND CI

- [ ] **GAME-2701** GitHub Actions für Lint einrichten.
- [ ] **GAME-2702** GitHub Actions für Typecheck einrichten.
- [ ] **GAME-2703** GitHub Actions für Unit Tests einrichten.
- [ ] **GAME-2704** GitHub Actions für E2E einrichten.
- [ ] **GAME-2705** GitHub Actions für Build einrichten.
- [ ] **GAME-2706** Artifact-Upload einrichten.
- [ ] **GAME-2707** statisches Hosting konfigurieren.
- [ ] **GAME-2708** Base-Path-Kompatibilität prüfen.
- [ ] **GAME-2709** Preview-Deployment einrichten.
- [ ] **GAME-2710** Produktionsdeployment einrichten.
- [ ] **GAME-2711** Cache-Header prüfen.
- [ ] **GAME-2712** Rollback-Verfahren dokumentieren.

**Abnahme Phase 27:** jeder Release ist reproduzierbar deploybar.

---

# PHASE 28 — RELEASE CANDIDATE

- [ ] **GAME-2801** alle offenen Blocker schließen.
- [ ] **GAME-2802** vollständigen Integrationslauf ausführen.
- [ ] **GAME-2803** vollständigen E2E-Lauf ausführen.
- [ ] **GAME-2804** vollständige Barrierefreiheitsprüfung ausführen.
- [ ] **GAME-2805** vollständigen Browsercheck ausführen.
- [ ] **GAME-2806** vollständigen Mobilecheck ausführen.
- [ ] **GAME-2807** vollständigen Save-Migrationstest ausführen.
- [ ] **GAME-2808** vollständigen Content-Validator ausführen.
- [ ] **GAME-2809** alle zwölf Enden manuell gegenprüfen.
- [ ] **GAME-2810** Cheats und Easter Eggs prüfen.
- [ ] **GAME-2811** keine Platzhalter im Build sicherstellen.
- [ ] **GAME-2812** keine Konsolenfehler sicherstellen.
- [ ] **GAME-2813** keine 404-Assets sicherstellen.
- [ ] **GAME-2814** Versionsnummer auf RC setzen.
- [ ] **GAME-2815** Release-Notizen erstellen.

**Abnahme Phase 28:** Release Candidate ohne kritische Fehler.

---

# PHASE 29 — VERSION 1.0.0

- [ ] **GAME-2901** finale Versionsnummer 1.0.0 setzen.
- [ ] **GAME-2902** CHANGELOG finalisieren.
- [ ] **GAME-2903** Produktionsbuild erzeugen.
- [ ] **GAME-2904** Build-Hash dokumentieren.
- [ ] **GAME-2905** finalen Smoke-Test durchführen.
- [ ] **GAME-2906** Git-Tag `v1.0.0` vorbereiten.
- [ ] **GAME-2907** Release-Artefakte veröffentlichen.
- [ ] **GAME-2908** Produktionsdeployment prüfen.
- [ ] **GAME-2909** Rollback-Punkt sichern.
- [ ] **GAME-2910** Entwicklungsfortschritt auf 100 % setzen.

**Abnahme Phase 29:** GAME2026 Version 1.0.0 ist spielbar, validiert und veröffentlicht.

---

# CODEX-ABSCHLUSSREGEL

Codex darf das Projekt nicht als fertig bezeichnen, solange:

- ein Pflichtpunkt offen ist,
- ein Test fehlschlägt,
- ein kritischer Fehler bekannt ist,
- ein Spielende unerreichbar ist,
- ein Savegame beschädigt werden kann,
- ein Hauptscreen nicht tastaturbedienbar ist,
- der Produktionsbuild nicht reproduzierbar ist.

Nach jeder Iteration muss Codex den Fortschritt in Prozent ausgeben.
