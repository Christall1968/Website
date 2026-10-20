const siteDataUrl = './site.json';
const whatsappPhoneNumber = '4915227937526';
let publicSiteUrl = '';
const homeCategoryGrid = document.querySelector('[data-main-category-grid]');
const featuredProducts = document.querySelector('[data-featured-products]');
const categoryRoot = document.querySelector('[data-category-root]');
const detailRoot = document.querySelector('[data-detail-root]');
const navLinks = document.querySelector('[data-nav-links]');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeImage(value) {
  if (!value) return '';
  return value.startsWith('http') ? value : value.replace(/\\/g, '/');
}

function isPlaceholderImage(value) {
  return /(?:^|\/)(?:hero-\d+|cover)\.svg(?:[?#].*)?$/i.test(value || '');
}

function findCategory(categories, slug, parents = []) {
  for (const category of categories) {
    const ancestors = [...parents, category];
    if (category.slug === slug) return { category, ancestors };
    const found = findCategory(category.children || [], slug, ancestors);
    if (found) return found;
  }
  return null;
}

function productBelongsToCategory(product, categorySlug) {
  return product.category === categorySlug
    || (product.additionalCategories || []).includes(categorySlug);
}

function updateSeo(title, description, canonicalPath) {
  document.title = title;
  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag) descriptionTag.content = description;
  updateCanonical(canonicalPath);
}

function updateCanonical(relativePath) {
  if (!publicSiteUrl) return;
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.rel = 'canonical';
    document.head.append(canonicalTag);
  }
  canonicalTag.href = new URL(relativePath, `${publicSiteUrl}/`).href;
}

const categorySeoDescriptions = {
  hochzeitsfloristik: 'Individuelle Hochzeitsfloristik in Berlin: handgefertigte Brautsträuße, Brauttaschen und Hochzeitsdekoration. Gestaltung nach Wunsch, Preis auf Anfrage.',
  brautfloristik: 'Entdecken Sie individuelle Brautfloristik mit langlebigen Kunstblumen: Brautsträuße, Brauttaschen, Haarschmuck und florale Accessoires, liebevoll nach Wunsch gestaltet.',
  brautstraeusse: 'Individuelle Brautsträuße in Berlin, auch in Herzform: von tiefroten Rosen bis zu cremeweißen Blütenherzen. Handgefertigt nach Wunsch, Preis auf Anfrage.',
  brauttaschen: 'Handgefertigte Brauttaschen zur Hochzeit mit floralen Details und Perlengriff. Individuelle Farben und Gestaltung, Preis auf Anfrage.',
  'braut-haarschmuck': 'Floraler Haarschmuck für die Braut, individuell passend zu Brautstrauß, Kleid und Hochzeitskonzept gestaltet.',
  'florale-brautaccessoires': 'Entdecken Sie individuelle florale Brautaccessoires, handgefertigt und abgestimmt auf Ihren Hochzeitsstil.',
  braeutigamfloristik: 'Florale Accessoires für den Bräutigam, darunter Reversanstecker und individuelle Details passend zur Hochzeitsfloristik.',
  reversanstecker: 'Individuelle florale Reversanstecker für den Bräutigam, passend zum Brautstrauß und Hochzeitskonzept gestaltet.',
  florale_einstecktuecher: 'Florale Einstecktücher und individuelle Details für den Bräutigam, abgestimmt auf die Hochzeitsfloristik.',
  braeutigam_accessoires: 'Entdecken Sie florale Accessoires für den Bräutigam, individuell passend zu Anlass und Hochzeitskonzept.',
  hochzeitsdekoration: 'Individuelle Hochzeitsdekoration mit floralen Arbeiten für Tisch, Auto, Traubogen und Fest. Gestaltung nach Wunsch, Preis auf Anfrage.',
  tischdekoration: 'Florale Tischdekoration für Hochzeiten und Feiern, individuell auf Farben und Gestaltungskonzept abgestimmt.',
  autoschmuck: 'Individueller floraler Autoschmuck für Hochzeiten, passend zu Brautstrauß und Dekoration gestaltet.',
  traubogen_dekoration: 'Florale Traubogen-Dekoration für eine persönliche Hochzeitszeremonie, individuell nach Wunsch gestaltet.',
  raum_und_festdekoration: 'Individuelle florale Raum- und Festdekoration für Hochzeiten und besondere Anlässe.',
  trauerfloristik: 'Persönliche Trauerfloristik in Berlin: Grablaternen, Grabschmuck und individuelle florale Arbeiten auf Anfrage.',
  grabgestecke: 'Individuelle Grabgestecke, mit Sorgfalt gestaltet und auf persönliche Wünsche abgestimmt. Preis auf Anfrage.',
  grablaternen: 'Entdecken Sie Grablaternen mit floraler Gestaltung als liebevollen Grabschmuck. Individuelle Anfertigungen auf Anfrage.',
  trauerkraenze: 'Individuelle Trauerkränze für einen persönlichen Abschied, mit Sorgfalt und nach Wunsch gestaltet.',
  individuelle_trauerfloristik: 'Persönliche, individuelle Trauerfloristik – abgestimmt auf Anlass und individuelle Wünsche. Angebot auf Anfrage.',
  weitere_floristik: 'Individuelle Floristik in Berlin: Blumenarrangements, Geschenkideen und saisonale Arbeiten, liebevoll nach Wunsch gestaltet.',
  blumenarrangements: 'Individuelle Blumenarrangements, von Hand gestaltet und passend zu Anlass, Farben und persönlichen Wünschen.',
  geschenkideen: 'Florale Geschenkideen und handgefertigte Einzelstücke für besondere Anlässe, individuell auf Wunsch gestaltet.',
  saisonale_floristik: 'Saisonale Floristik und individuelle Blumenarbeiten, liebevoll passend zur Jahreszeit gestaltet.',
  individuelle_anfertigungen: 'Individuelle florale Anfertigungen nach persönlichen Wünschen. Besprechen Sie Ihre Ideen und erhalten Sie ein unverbindliches Angebot.',
};

async function loadSiteData() {
  const response = await fetch(siteDataUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('site.json konnte nicht geladen werden');
  }
  return response.json();
}

function renderNavigation(categories) {
  if (!navLinks) return;
  navLinks.innerHTML = categories
    .map((category) => `
      <a href="category.html?slug=${encodeURIComponent(category.slug)}">${escapeHtml(category.title)}</a>
    `)
    .join('');
}

function productImage(product) {
  return [product.cover, ...(product.images || [])]
    .find((image) => image && !isPlaceholderImage(image)) || '';
}

function inquiryUrl(product) {
  const productName = product.title;
  const productId = product.slug;
  const productUrl = new URL(
    `detail.html?slug=${encodeURIComponent(productId)}`,
    window.location.href,
  ).href;
  const subject = `Anfrage: ${productName} [${productId}]`;
  const body = `Guten Tag,\n\nich interessiere mich für: ${productName}.\nArtikelkennung: ${productId}\nAusgewähltes Werkstück: ${productUrl}\n\nBitte kontaktieren Sie mich für eine unverbindliche Beratung.\n\nName:\nE-Mail-Adresse:\nWunschfarben:\nKunstblumen oder frische Blumen:\nGewünschter Termin:\nWeitere Angaben und Fragen:\n`;
  return `mailto:info@beautiful-flowers.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function whatsappUrl(message) {
  return `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(message)}`;
}

function publicProductUrl(product) {
  if (!publicSiteUrl) return '';

  try {
    const siteUrl = new URL(publicSiteUrl);
    if (siteUrl.protocol !== 'https:' || siteUrl.username || siteUrl.password) return '';
    return new URL(`detail.html?slug=${encodeURIComponent(product.slug)}`, `${siteUrl.href.replace(/\/+$/, '')}/`).href;
  } catch {
    return '';
  }
}

function setGeneralWhatsAppLink() {
  const link = document.querySelector('[data-whatsapp-general]');
  if (!link) return;

  link.href = whatsappUrl('Hallo, ich habe Ihre Website Beautiful-Flowers.de besucht und hätte gerne weitere Informationen zu Ihren floristischen Arbeiten.');
}

function renderCategoryCards(categories, products = [], isHome = false) {
  const homeCategoryImages = {
    hochzeitsfloristik: 'content/company/images/Brautstrauss 3.jpeg',
    trauerfloristik: 'content/company/images/laterne 2.jpeg',
  };

  return categories.map((category) => {
    const categoryProduct = products.find((product) => productBelongsToCategory(product, category.slug) && productImage(product));
    const image = (isHome && homeCategoryImages[category.slug])
      || category.image
      || (categoryProduct && productImage(categoryProduct));
    return `
      <a class="card category-card${image ? '' : ' category-card--no-image'}" href="category.html?slug=${encodeURIComponent(category.slug)}">
        ${image ? `<img src="${escapeHtml(normalizeImage(image))}" alt="${escapeHtml(category.title)}" loading="lazy">` : ''}
        <span class="category-card-copy">
          <span class="category-card-title">${escapeHtml(category.title)}</span>
          <span class="category-card-link">Entdecken</span>
        </span>
      </a>
    `;
  }).join('');
}

function renderProductCards(products) {
  if (!products.length) {
    return '<p class="empty-category">In dieser Kategorie sind derzeit keine Produkte eingetragen.</p>';
  }

  return products.map((product) => {
    const image = productImage(product);
    const detailUrl = `detail.html?slug=${encodeURIComponent(product.slug)}`;
    return `
      <article class="card product-card${image ? '' : ' card--text-only'}">
        ${image ? `<a class="product-image-link" href="${detailUrl}" aria-label="Details zu ${escapeHtml(product.title)} ansehen"><img class="product-image" src="${escapeHtml(normalizeImage(image))}" alt="${escapeHtml(product.imageAlt || product.title)}" loading="lazy"></a>` : ''}
        <div class="card-copy">
          <h3>${escapeHtml(product.title)}</h3>
          ${product.subtitle ? `<p>${escapeHtml(product.subtitle)}</p>` : ''}
          <p class="product-price">Preis auf Anfrage</p>
          <div class="product-actions">
            <a href="${detailUrl}">Details ansehen</a>
            <a class="inquiry-link" href="${escapeHtml(inquiryUrl(product))}">Unverbindlich anfragen</a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderHome(categories, products) {
  if (homeCategoryGrid || featuredProducts) updateCanonical('.');
  if (homeCategoryGrid) {
    homeCategoryGrid.innerHTML = renderCategoryCards(categories, products, true);
  }
  if (featuredProducts) {
    featuredProducts.innerHTML = renderProductCards(products);
  }
}

function renderCategoryPage(categories, products) {
  if (!categoryRoot) return;

  const slug = new URLSearchParams(window.location.search).get('slug');
  const found = findCategory(categories, slug);
  if (!found) {
    categoryRoot.innerHTML = `
      <p class="eyebrow">Beautiful-Flowers.de</p>
      <h1 class="category-title">Kategorie nicht gefunden</h1>
      <a class="button" href="index.html">Zur Startseite</a>
    `;
    return;
  }

  const { category, ancestors } = found;
  const parent = ancestors.length > 1 ? ancestors[ancestors.length - 2] : null;
  const children = category.children || [];
  const categoryProducts = products.filter((product) => productBelongsToCategory(product, category.slug));
  const title = category.slug === 'hochzeitsfloristik'
    ? 'Hochzeitsfloristik Berlin | Beautiful-Flowers.de'
    : category.slug === 'trauerfloristik'
      ? 'Trauerfloristik Berlin | Beautiful-Flowers.de'
      : category.slug === 'weitere-floristik'
        ? 'Individuelle Floristik Berlin | Beautiful-Flowers.de'
        : `${category.title} | Beautiful-Flowers.de`;
  const description = categorySeoDescriptions[category.slug.replace(/-/g, '_')]
    || categorySeoDescriptions[category.slug]
    || `${category.title}: individuelle florale Arbeiten, liebevoll nach Ihren Wünschen gestaltet. Preis auf Anfrage bei Beautiful-Flowers.de.`;
  updateSeo(title, description, `category.html?slug=${encodeURIComponent(category.slug)}`);
  const backLink = parent
    ? `<a class="back-navigation" href="category.html?slug=${encodeURIComponent(parent.slug)}">← Zurück zur ${escapeHtml(parent.title)}</a>`
    : '<a class="back-navigation" href="index.html">← Zurück zur Startseite</a>';
  const breadcrumb = ancestors.map((item) => `
    <a href="category.html?slug=${encodeURIComponent(item.slug)}">${escapeHtml(item.title)}</a>
  `).join('<span aria-hidden="true">/</span>');

  categoryRoot.innerHTML = `
    ${backLink}
    <nav class="breadcrumbs" aria-label="Brotkrumennavigation">
      <a href="index.html">Startseite</a>
      <span aria-hidden="true">/</span>
      ${breadcrumb}
    </nav>
    <header class="category-heading">
      <p class="eyebrow">${escapeHtml(parent ? parent.title : 'Floristikbereiche')}</p>
      <h1 class="category-title">${escapeHtml(category.title)}</h1>
    </header>
    ${children.length ? `
      <section class="category-section" aria-labelledby="subcategory-heading">
        <h2 id="subcategory-heading" class="section-title">${parent ? 'Unterkategorien' : 'Bereiche entdecken'}</h2>
        <div class="card-grid category-grid">${renderCategoryCards(children, products)}</div>
      </section>
    ` : ''}
    <section class="category-section" aria-labelledby="products-heading">
      <h2 id="products-heading" class="section-title">${children.length ? 'Produkte in diesem Bereich' : 'Produkte'}</h2>
      ${categoryProducts.length
        ? `<div class="card-grid">${renderProductCards(categoryProducts)}</div>`
        : children.length
          ? '<p class="empty-category">Wähle eine Unterkategorie, um die dort eingetragenen Produkte anzusehen.</p>'
          : '<p class="empty-category">Individuelle Anfertigungen auf Anfrage</p>'}
    </section>
  `;
}

function renderDetail(items, categories) {
  if (!detailRoot) return;

  const slug = new URLSearchParams(window.location.search).get('slug');
  const item = items.find((entry) => entry.slug === slug);

  if (!item) {
    document.title = 'Produkt nicht gefunden | Beautiful-Flowers.de';
    detailRoot.innerHTML = `
      <article class="detail-page">
        <h1>Produkt nicht gefunden</h1>
        <p>Dieser Produktlink ist ungültig oder das Produkt ist nicht mehr verfügbar.</p>
        <a class="button" href="index.html#produkte">Zur Produktübersicht</a>
      </article>
    `;
    return;
  }

  const pageTitle = item.subtitle
    ? `${item.title}: ${item.subtitle} | Beautiful-Flowers.de`
    : `${item.title} | Beautiful-Flowers.de`;
  const metaDescription = item.seoDescription
    || `${item.title}${item.subtitle ? ` – ${item.subtitle}` : ''}. Individuell handgefertigt, nach Wunsch gestaltet. Preis auf Anfrage bei Beautiful-Flowers.de.`;
  updateSeo(item.seoTitle || pageTitle, metaDescription, `detail.html?slug=${encodeURIComponent(item.slug)}`);

  const galleryImages = (item.images || []).filter((image) => image && !isPlaceholderImage(image));
  const cover = productImage(item);
  const galleryCount = galleryImages.length;
  const isLanternTwo = item.slug === 'grablaterne-02';
  const galleryClass = isLanternTwo
    ? 'gallery-grid gallery--lantern-two'
    : galleryCount === 1 ? 'gallery-grid gallery--single' : galleryCount === 2 ? 'gallery-grid gallery--two' : galleryCount === 3 ? 'gallery-grid gallery--three' : galleryCount > 3 ? 'gallery-grid gallery--many' : '';
  const gallery = galleryImages.map((image, index) => `
    <figure class="gallery-item${isLanternTwo && index === 0 ? ' gallery-item--lantern-two' : ''}">
      <img src="${escapeHtml(normalizeImage(image))}" alt="${escapeHtml(item.imageAlt || item.title)}" loading="lazy">
    </figure>
  `).join('');
  const description = (item.description || '')
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
  const price = '<p class="product-price">Preis auf Anfrage</p>';
  const materialsNote = '<p class="product-materials-note">Unsere Arrangements werden mit hochwertigen Kunstblumen gefertigt. Auf Wunsch ist bei vielen Kreationen auch eine Ausführung mit frischen Blumen möglich – abhängig von Saison und Verfügbarkeit. Farben und Gestaltung können individuell abgestimmt werden.</p>';
  const productCategory = findCategory(categories, item.category)?.category;
  const productUrl = publicProductUrl(item);
  const whatsappMessage = [
    'Hallo, ich interessiere mich für folgendes Produkt von Beautiful-Flowers.de:',
    '',
    `Produkt: ${item.title}`,
    ...(item.subtitle ? [`Modell: ${item.subtitle}`] : []),
    `Artikelnummer: ${item.slug}`,
    '',
    'Ich würde gerne den Preis erfahren und mich über die individuellen Gestaltungsmöglichkeiten informieren.',
    ...(productUrl ? ['', `Produktseite: ${productUrl}`] : []),
    '',
    'Vielen Dank!',
  ].join('\n');
  const categoryBackLabels = {
    brautstraeusse: '← Zurück zu den Brautsträußen',
    brauttaschen: '← Zurück zu den Brauttaschen',
    grablaternen: '← Zurück zu den Grablaternen',
  };
  const categoryLink = productCategory
    ? `<a class="back-navigation" href="category.html?slug=${encodeURIComponent(productCategory.slug)}">${escapeHtml(categoryBackLabels[productCategory.slug] || `← Zurück zur Kategorie „${productCategory.title}“`)}</a>`
    : '<a class="back-navigation" href="index.html">← Zurück zur Startseite</a>';

  detailRoot.innerHTML = `
    <article class="detail-page">
      ${categoryLink}
      <div class="detail-header${cover ? '' : ' detail-header--no-image'}">
        ${cover ? `<img src="${escapeHtml(normalizeImage(cover))}" alt="${escapeHtml(item.imageAlt || item.title)}">` : ''}
        <div>
          <p class="eyebrow">${escapeHtml(item.kicker || 'Beautiful-Flowers.de')}</p>
          <h1>${escapeHtml(item.title)}</h1>
          ${item.subtitle ? `<h2>${escapeHtml(item.subtitle)}</h2>` : ''}
          ${description}
          ${price}
          ${materialsNote}
          <div class="detail-actions">
            <a class="button" href="index.html">Zur Startseite</a>
            <a class="button button-light" href="${escapeHtml(inquiryUrl(item))}">Unverbindlich anfragen</a>
            <a class="button whatsapp-button" href="${escapeHtml(whatsappUrl(whatsappMessage))}" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                <path d="M16 3.2A12.5 12.5 0 0 0 5.2 22l-1.5 6.8 7-1.8A12.5 12.5 0 1 0 16 3.2Z"></path>
                <path d="M11.2 9.4c-.4-.4-.8-.4-1.1-.4-.3 0-.7 0-1 .5-.4.4-1.4 1.4-1.4 3.3s1.4 3.8 1.6 4.1c.2.3 2.7 4.3 6.6 5.8 3.3 1.3 4 .9 4.7.8.7-.1 2.3-1 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.2-.4-.3-.8-.5-.4-.2-2.3-1.1-2.7-1.2-.4-.1-.7-.2-1 .2-.3.4-1 1.2-1.2 1.5-.2.3-.4.3-.8.1-.4-.2-1.7-.6-3.3-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.6.1-.2 0-.5 0-.7-.1-.2-.9-2.2-1.2-2.9Z"></path>
              </svg>
              Per WhatsApp anfragen
            </a>
          </div>
        </div>
      </div>
      ${gallery ? `<div class="${galleryClass}">${gallery}</div>` : ''}
    </article>
  `;
}

async function init() {
  setGeneralWhatsAppLink();
  try {
    const data = await loadSiteData();
    publicSiteUrl = data.publicSiteUrl || '';
    const legalPagePath = [
      'impressum.html',
      'datenschutz.html',
      'bestellinformationen.html',
    ].find((pagePath) => window.location.pathname.endsWith(`/${pagePath}`));
    if (legalPagePath) {
      const descriptionTag = document.querySelector('meta[name="description"]');
      updateSeo(document.title, descriptionTag ? descriptionTag.content : '', legalPagePath);
    }
    const categories = data.categories || [];
    const products = data.products || [];
    renderNavigation(categories);
    renderHome(categories, products);
    renderCategoryPage(categories, products);
    renderDetail(products, categories);
  } catch (error) {
    console.error(error);
    if (homeCategoryGrid) homeCategoryGrid.innerHTML = '<p class="empty-category">Inhalte konnten nicht geladen werden.</p>';
    if (featuredProducts) featuredProducts.innerHTML = '<p class="empty-category">Inhalte konnten nicht geladen werden.</p>';
    if (categoryRoot) categoryRoot.innerHTML = '<p class="empty-category">Inhalte konnten nicht geladen werden.</p>';
    if (detailRoot) detailRoot.innerHTML = '<p class="empty-category">Inhalte konnten nicht geladen werden.</p>';
  }
}

init();
