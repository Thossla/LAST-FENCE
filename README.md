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
- `Q`: Ausweichen
- `R`: nächsten Zaun reparieren

## GitHub Pages

Der Workflow in `.github/workflows/deploy-pages.yml` veröffentlicht jede Änderung auf `main`. In den Repository-Einstellungen unter **Pages** muss einmalig als Quelle **GitHub Actions** gewählt werden. Danach ist die Beta verfügbar unter:

`https://thossla.github.io/LAST-FENCE/`
