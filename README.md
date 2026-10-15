# Beautiful Flowers Website

Diese Website ist eine wartbare GitHub-Pages-Seite für eine Floristik/Blumenshop-Kategorie mit Produktseiten, Unternehmensbildern und dynamischer Navigation.

## Projektstruktur

```text
content/
  company/
    images/
      hero-1.svg
      hero-2.svg
  products/
    brautstrauss/
      index.json
      images/
        cover.jpg
        detail-1.jpg
        detail-2.jpg
    brauttaschen/
      index.json
      images/
        cover.svg
    hochzeitsfloristik/
      index.json
      images/
        cover.svg
site.json
index.html
detail.html
impressum.html
assets/
README.md
```

Wichtig: Alle Bildquellen liegen immer in einem `images/`-Ordner. Bilder werden nicht direkt im Produktordner oder außerhalb von `images/` abgelegt.

## Allgemeine Unternehmensbilder

- Bilder für den oberen Bereich kommen in `content/company/images/`
- Diese werden automatisch auf der Startseite angezeigt
- Wenn dort keine Bilder vorhanden sind, erscheint kein Bildblock

## Produkte

- Produkte werden in `content/products/<slug>/` abgelegt
- Jede Produktseite braucht eine `index.json`
- Alle Bilder aus `content/products/<slug>/images/` werden automatisch übernommen
- Typische Dateien sind `cover.jpg` sowie optionale `detail-1.jpg`, `detail-2.jpg` usw.

Beispiel `index.json`:

```json
{
  "slug": "brautstrauss",
  "title": "Brautstrauß",
  "subtitle": "Für jeden Stil",
  "kicker": "Hochzeitsblumen",
  "description": "Lange Beschreibung ...",
  "menuOrder": 1
}
```

## Dynamisches Verhalten

- Oben: allgemeine Unternehmensbilder, wenn vorhanden
- Unten: Produktkarten, wenn Produkte hinterlegt sind
- Wenn nur ein Produkt existiert, funktioniert die Seite trotzdem normal
- Wenn später mehr Produkte ergänzt werden, erscheinen sie automatisch auf der Startseite und in der Navigation

## Lokale Vorschau

```bash
npm run build
python -m http.server 8000
```

Danach im Browser öffnen: `http://localhost:8000`
