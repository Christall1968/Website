# Flower Power Website

This repository contains a maintainable GitHub Pages site for a floral studio. New sections can be added by creating a new folder under `content/` with an `index.json` file and image assets.

## Struktur

```text
content/
  brautstrauss/
    index.json
    cover.svg
    detail-1.svg
    detail-2.svg
  brauttaschen/
    index.json
    cover.svg
    detail-1.svg
    detail-2.svg
...
site.json
index.html
detail.html
assets/
```

## Struktur

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
```

Wichtig: Alle Bildquellen liegen immer in einem `images/`-Ordner. Es werden keine Bilder direkt im Produktordner oder außerhalb von `images/` verwendet.

## Allgemeine Unternehmensbilder

- Bilder für den oberen Bereich kommen in `content/company/images/`
- Diese werden automatisch auf der Startseite angezeigt
- Wenn dort keine Bilder sind, erscheint kein Bildblock

## Produkte

- Produkte werden in `content/products/<slug>/` abgelegt
- Jede Produktseite braucht `index.json`
- Es werden automatisch alle Bilddateien aus `content/products/<slug>/images/` übernommen
- Für ein Produkt sind typischerweise `cover.jpg` und optional `detail-1.jpg`, `detail-2.jpg` usw. geeignet

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
- Wenn du später mehr Produkte ergänzst, werden sie automatisch zur Hauptseite und Navigation hinzugefügt

## Lokale Vorschau

```bash
npm run build
python -m http.server 8000
```

Dann in den Browser: `http://localhost:8000`
