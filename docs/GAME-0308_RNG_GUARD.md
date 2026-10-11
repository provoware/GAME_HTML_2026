# GAME-0308 · Keine unkontrollierten Zufallsquellen in Spielmodulen

**Ausgangsstand:** `main` @ `4763394eae1ff37e1aca1f465ecdd4f61e70f85f`. **Scope:** nur ESLint-Regel, fokussierte Tests, TODO und Changelog. Keine Änderungen an Spielmechanik, Seed-Verträgen, Savegames oder UI.

## Warum?
`Math.random()` ist nicht an den gespeicherten Seed gebunden. Schon ein einziger solcher Aufruf in einer Spielregel kann Wiederholungen und Spielstände unvorhersagbar machen. Das Spiel hat bereits `createSeededRandom` und drei getrennte `createRandomStreams`-Ströme (Welt, Ereignisse, Oberfläche).

## Technische Regel
ESLint `no-restricted-properties` untersagt `Math.random` in `src/game/**/*.{ts,tsx}`, auch `Math['random']` und bloßen Zugriff ohne Aufruf. Anders als eine Textsuche ignoriert ESLint Kommentare und Zeichenfolgen. Die Regel verändert keine Laufzeitdaten. Außerhalb der Spielmodule wird die vorhandene Konfiguration nicht verändert.

## Prüfungen und Grenzen
- `npm run lint`: prüft die tatsächlich vorhandenen Spielmodule.
- `npm test`: prüft die Regel selbst mit positiven und negativen Beispielen über ESLint.
- Vollständige vorgeschriebene CI: Lint, Typprüfung, Importkreise, Inhaltsvalidierung, Vitest, Produktionsbuild und Desktop-/Mobilbrowser.
- Keine Aussage über indirekt übergebene fremde Zufallsfunktionen oder absichtlich versteckte dynamische Zugriffe: die Regel schützt den direkten `Math.random`-Zugriff, keine allgemeine Taint-Analyse.
- Diese Aufgabe ist unabhängig von den noch offenen RNG-PRs #50 (Mischen) und #51 (gewichtete Auswahl).

**Freigabe:** Nur nach grüner CI auf dem tatsächlichen Branch-HEAD. Kein Merge und kein Release allein aufgrund dieser Dokumentation.
