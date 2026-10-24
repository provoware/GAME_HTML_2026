# PROVOWARE Release-Fortschritt – Pilot

Diese Regel ergänzt AGENTS.md und TODO.md; bestehende Projekt-, Test-, Sicherheits- und Freigaberegeln haben Vorrang. Keine automatische Freigabe und kein neues blockierendes CI-Gate.

Stufe eins: Ist-Zustand, konkretes Release-Ziel, Abschlusskriterium, Risiken, erwartete Wirkung, betroffene Dateien und vorhandene Prüfbelege dokumentieren. Gemeinsam nutzbare Analysen und Tests prüfen. Laufende freigegebene Pläne nicht still verändern. Keine Produktcodeänderung ohne die erforderliche Freigabe.

Stufe zwei: nach gültiger Freigabe und Prüfung von Ausgangsstand, Schreibzuständigkeit und Umfang kleinste geeignete Änderung umsetzen. Tatsächlichen Commit mit vorhandenen Pflichtprüfungen einschließlich Browser-, Speicherstands-, Sicherheits- und Regressionstests validieren. Ein Plan oder historischer Test ist kein Nachweis für neue Implementierung.

Jede Iteration muss einen belegten Release-Fortschritt, einen entfernten Blocker oder eine entscheidungsrelevante Erkenntnis liefern. Aufwandseinsparung allein reicht nicht. Bei Stillstand neue Hypothese prüfen; Pflichtprüfungen nicht einsparen.

Bei unerwarteten erheblichen Konflikten nur betroffene Änderung stoppen, Befund und sichere Alternativen nennen und Nutzer gezielt fragen. Unabhängige sichere Arbeit fortsetzen. Pilot zuerst beobachten und erst nach gesonderter Validierung verbindlich automatisieren.
