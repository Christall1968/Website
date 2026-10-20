# Beautiful-Flowers.de

Die Website ist eine statische Floristik-Boutique mit datenbasierten Haupt- und Unterkategorien, Produktübersichten und Produktdetailseiten.

## Projektstruktur

```text
content/
  categories.json
  company/
    images/
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
category.html
detail.html
impressum.html
assets/
README.md
```

Wichtig: Alle Bildquellen liegen immer in einem `images/`-Ordner. Bilder werden nicht direkt im Produktordner oder außerhalb von `images/` abgelegt.

## Kategorien

- Die Kategorien und Unterkategorien stehen in `content/categories.json`.
- Jede Kategorie hat einen eindeutigen `slug`, einen sichtbaren `title` und optional `children` sowie ein passendes `image`.
- Die drei obersten Kategorien erscheinen in der Navigation und auf der Startseite.
- Kategorien öffnen sich über `category.html?slug=<slug>`. Unterkategorien und zugeordnete Produkte werden automatisch angezeigt.
- Für eine neue Kategorie wird ein Eintrag in der JSON-Struktur ergänzt. Produkte verweisen mit ihrem `category`-Wert auf den Slug ihrer Produktkategorie.

Beispiel für eine Produktkategorie:

```json
{
  "slug": "brautstraeusse",
  "title": "Brautsträuße"
}
```

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
  "seoTitle": "Brautstrauß nach Wunsch | Beautiful-Flowers.de",
  "seoDescription": "Handgefertigter Brautstrauß, passend zum Hochzeitskonzept gestaltet.",
  "imageAlt": "Brautstrauß aus cremeweißen Rosen und Eukalyptus",
  "category": "brautstraeusse",
  "menuOrder": 1
}
```

Auf Produktkarten und Detailseiten wird „Preis auf Anfrage“ angezeigt; feste Preise werden nicht ergänzt oder geschätzt.

Die aktuellen individuellen Werkstücke zeigen „Preis auf Anfrage“. Anfragelinks öffnen das E-Mail-Programm mit vorausgefülltem Produktnamen und Nachricht. Ein serverseitiges Kontaktformular ist nicht eingerichtet.

Produktdetailseiten bleiben unter `detail.html?slug=<produkt-slug>` erreichbar.

Die WhatsApp-Kontaktschaltflächen verwenden die bestätigte Geschäftsnummer im internationalen Format. Die Nummer und die Click-to-Chat-Links werden in `assets/js/site.js` gepflegt; Nachrichten werden nur vorbereitet und erst nach Bestätigung durch den Kunden versendet.

## Bilder

- Produktfotos kommen in `content/products/<slug>/images/`; `cover.jpg` ist das Titelbild.
- Dekorative, freigestellte Blumenbilder liegen in `content/company/images/`.
- Fehlende Produktfotos werden nicht durch erfundene Produktbilder ersetzt.

## Lokale Vorschau

```bash
npm run build
npm run serve
```

Danach im Browser öffnen: `http://localhost:8000`

## SEO und öffentliche Domain

Produktbezogene SEO-Titel, Meta-Beschreibungen und Bild-Alternativtexte werden im jeweiligen Produktmanifest gepflegt. Kategorie-Texte und die allgemeinen Seitentitel liegen in `assets/js/site.js`; Titel und Beschreibungen der Kategorie- und Produktseiten werden anhand ihrer Slugs gesetzt.

Die bestätigte öffentliche Domain ist `https://beautiful-flowers.de`. Der GitHub-Pages-Workflow setzt diese Adresse beim Build, damit Canonical-URLs, Sitemap und Produktlinks auf die bestehende Domain verweisen. Für einen lokalen Build mit denselben SEO-Daten:

```bash
PUBLIC_SITE_URL="https://beautiful-flowers.de" npm run build
```

Der Workflow kopiert anschließend nur die veröffentlichbaren Website-Dateien nach `_site` und schließt `.DS_Store`-Dateien sowie Entwicklungsdateien vom Pages-Artefakt aus.
