# LAST FENCE — 2D Browser Mini 0.8

Direkt im Browser spielen: https://thossla.github.io/LAST-FENCE/

Die Mini-Version ist ein eigenständiges, statisches 2D-Spiel ohne Installation oder Server. Alternativ `index.html` lokal öffnen. Für Tastatur und Maus auf Desktop ausgelegt.

## Spielen

- **Normaler Run:** 42 Katalog-Gegenstände sind anfangs gesperrt. Bewachte Loot-Caches enthalten Waffen, Mana-Waffen, Helme, Brustplatten, Hosen, Schuhe und Artefakte in unterschiedlichen Seltenheiten. Gefundene Katalogteile werden im selben Browser gespeichert, sofern dieser lokalen Speicher zulässt.
- **Admin-Sandbox:** alle 42 Katalogteile sind sofort freigeschaltet. Zum Ausprobieren der Kräfte und Designs; verändert die normale Sammlung nicht.
- Alle drei Wellen erscheint **The Breaker**. Weitere bewachte Lootdrops landen alle zwei Wellen.
- Die Arenakarte zeigt Held, Gegner, Zaun, offene Caches, Beute, Seltenheiten und frisch gelandete Drops.

## Festung, Beute und Ausrüstung

Jedes Zaunsegment hat eigene Strukturpunkte. Gegner dringen erst nach einer Bresche in die Basis vor. Schrott repariert und verstärkt einzelne Segmente, mit Schrott und Riftstaub lässt sich der gesamte Zaunring erweitern. Gegner lassen Material und XP fallen; Katalog-Ausrüstung liegt in bewachten Caches. Nach dem Öffnen zeigt ein Beutefenster den tatsächlichen Gegenstand und seine Werte. Das Inventar enthält auch einen Katalog mit noch gesperrten Silhouetten.

Es gibt 6 Primärwaffen, 6 Mana-Waffen, je 6 Helme, Brustplatten, Hosen und Schuhe sowie 6 Artefakte. Alle haben eigene Werte und besondere Kampfeffekte. Nur das Nekromanten-Siegel erlaubt die Beschwörung von Seelen; ohne es dienen Seelen als Upgrades für Waffen und Rüstung. Vier Verzauberungen verändern Waffentreffer. Mana-Waffen verbrauchen Mana und regenerieren nicht unbegrenzt schnell.

## Steuerung

| Taste | Aktion |
| --- | --- |
| WASD / Pfeile | Bewegen |
| Maus + Klick / Leertaste | Zielen und Primärwaffe abfeuern |
| F | Mana-Waffe einsetzen |
| E | Bewachten Cache öffnen, sobald alle Wächter besiegt sind |
| G | Seelen beschwören, nur mit Nekromanten-Siegel |
| Q | Ausweichen |
| R | Nahes Zaunsegment reparieren |
| U | Nahes Zaunsegment verstärken |
| B | Basis und Zaunring erweitern |
| M | Arenakarte |
| I | Inventar und Katalog |
| C | Charakter und Ausrüstung |

## Technik

Reines HTML, CSS und Canvas-JavaScript ohne Build-Schritt und externe Assets. Spielmechanik-Test: `node tests/smoke.cjs` (nur im Entwicklungsordner). Die Zeichnungen sind eigenständige stilisierte 2D-Canvas-Grafiken; das Spiel benötigt weder Unity noch Unreal.
