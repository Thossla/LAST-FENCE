# LAST FENCE — 2,5D Browser Beta 0.9

Direkt im Browser spielen: https://thossla.github.io/LAST-FENCE/

Die Beta ist ein eigenständiges Browsergame mit schräger 2,5D-Canvas-Ansicht und eigenen kantigen Fantasy-Grafiken im Dungeons-Stil. Keine Installation oder Build-Schritte nötig; alternativ `index.html` lokal öffnen. Für Tastatur und Maus auf Desktop ausgelegt.

## Spielen

- **Normaler Run:** 42 Katalog-Gegenstände sind anfangs gesperrt. Bewachte Loot-Caches enthalten Waffen, Mana-Waffen, Helme, Brustplatten, Hosen, Schuhe und Artefakte in unterschiedlichen Seltenheiten. Gefundene Katalogteile werden im selben Browser gespeichert, sofern dieser lokalen Speicher zulässt.
- **Admin-Sandbox:** alle 42 Katalogteile sind sofort freigeschaltet. Zum Ausprobieren der Kräfte und Designs; verändert die normale Sammlung nicht.
- Alle drei Wellen erscheint **The Breaker**. Weitere bewachte Lootdrops landen alle zwei Wellen.
- Die Arenakarte zeigt Held, Gegner, Zaun, offene Caches, Beute, Seltenheiten und frisch gelandete Drops.

## Festung, Beute und Ausrüstung

Jedes Zaunsegment hat eigene Strukturpunkte. Gegner dringen erst nach einer Bresche in die Basis vor. Schrott repariert und verstärkt einzelne Segmente, mit Schrott und Riftstaub lässt sich der gesamte Zaunring erweitern. Gegner lassen Material und XP fallen; Katalog-Ausrüstung liegt in bewachten Caches. Nach dem Öffnen zeigt ein Beutefenster den tatsächlichen Gegenstand und seine Werte. Das Inventar enthält auch einen Katalog mit noch gesperrten Silhouetten.

Es gibt 6 Primärwaffen, 6 Mana-Waffen, je 6 Helme, Brustplatten, Hosen und Schuhe sowie 6 Artefakte. Alle 42 Katalogteile haben eigene skalierbare Gegenstandsporträts, Werte und Kräfte. Das gemeinsame Charakter-/Inventarmenü zeigt links exakt dasselbe gezeichnete Modell wie im Spiel und rechts die Sammlung. Gegenstände lassen sich per Drag-and-drop auf passende Slots ziehen oder zurück ins Inventar ablegen. Es gibt drei aktive Artefaktplätze.

Schwerter, Hämmer, Doppelklingen und Stäbe treffen im Nahkampf statt generische Kugeln zu verschießen. Das Gewehr feuert Salven; jede Mana-Waffe besitzt eine eigene Projektilform und verbraucht Mana. F wechselt die aktive Waffe, Mausklick greift mit ihr an. Die Artefakte haben einzigartige aktive Kräfte auf den Tasten 1–3. Nur das Nekromanten-Siegel erlaubt die Beschwörung von Seelen; ohne es dienen Seelen als Upgrades für Waffen und Rüstung. In der Schmiede wird eine Waffe per Drag-and-drop eingelegt; drei dazu passende Verzauberungen kosten eingesammelte Seelen.

## Steuerung

| Taste | Aktion |
| --- | --- |
| WASD / Pfeile | Bewegen |
| Maus + Klick / Leertaste | Zielen und mit der aktiven Waffe angreifen |
| F | Zwischen Primär- und Mana-Waffe umschalten |
| 1 / 2 / 3 | Artefaktplätze aktivieren |
| E | Bewachten Cache öffnen, sobald alle Wächter besiegt sind |
| G | Nekromanten-Siegel als Kurztaste aktivieren |
| Q | Ausweichen |
| R | Nahes Zaunsegment reparieren |
| U | Nahes Zaunsegment verstärken |
| B | Basis und Zaunring erweitern |
| M | Arenakarte |
| I / C | Gemeinsames Charakter- und Inventarmenü |

## Technik

Reines HTML, CSS und Canvas-JavaScript ohne Build-Schritt und externe Assets. Spielmechanik-Test: `node tests/smoke.cjs`. Die 42 Gegenstandsbilder werden als eigenständige SVG-Grafiken durch `gear-art.js` erzeugt. Das Spiel benötigt weder Unity noch Unreal.
