# LAST FENCE — Browser Beta

Eine vollständig statische 2D-Browser-Beta. Es gibt keine Installation und keine Abhängigkeiten: `index.html` öffnen oder über GitHub Pages spielen.

## Der Zaun lebt

- In der Mitte der Festung steht ein Rift-Artefakt mit eigenen Strukturpunkten. Nur dessen Zerstörung beendet den Run.
- Stirbt der Held, wird er am Rift-Artefakt mit voller Gesundheit wiederbelebt.
- Die Festung besteht aus 28 separaten Zaunsegmenten mit eigenen Strukturpunkten.
- Jeder Gegner wählt ein Segment, belagert es und verursacht dort Schaden.
- Erst nach der Zerstörung dieses Segments durchquert der Gegner die Bresche und kann die Festung angreifen.
- Mit `R` repariert der Held ein nahes, beschädigtes Segment für 10 Schrott.

## Steuerung

- `WASD` oder Pfeiltasten: bewegen
- Maus + Klick oder Leertaste: zielen und feuern
- `F`: Mana-Waffe einsetzen
- `Q`: Ausweichen
- `R`: nächsten Zaun reparieren
- `M`: komplette Arenakarte mit Gegnern, Loot-Drops und deren Rarität anzeigen
- `C`: Charakter-Ausrüstung öffnen

## Fortschritt und Ausrüstung

- Besiegte Gegner, insbesondere Bosse, lassen Loot in fünf Raritäten fallen: gewöhnlich, ungewöhnlich, selten, episch und legendär.
- Eingesammelter Loot gibt Schrott und XP. Level-ups erhöhen Leben, Mana und Schaden.
- Im Charaktermenü lassen sich Schuhe, Hose, Brustplatte, Helm, drei Artefakt-Slots, Waffe und Mana-Waffe zusammenstellen.
- Die Kamera folgt dem Helden weich über die größere Arena. Aim Assist hilft beim Zielen auf Gegner in der Nähe des Fadenkreuzes.

## GitHub Pages

Der Workflow in `.github/workflows/deploy-pages.yml` veröffentlicht jede Änderung auf `main`. In den Repository-Einstellungen unter **Pages** muss einmalig als Quelle **GitHub Actions** gewählt werden. Danach ist die Beta verfügbar unter:

`https://thossla.github.io/LAST-FENCE/`
