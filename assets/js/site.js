const siteUrl = './site.json';
const companyGallery = document.querySelector('[data-company-gallery]');
const homeGrid = document.querySelector('[data-home-grid]');
const detailRoot = document.querySelector('[data-detail-root]');
const navLinks = document.querySelector('[data-nav-links]');

function normalizeImage(value) {
  if (!value) return '';
  return value.startsWith('http') ? value : value.replace('\\', '/');
}

async function loadSiteData() {
  const response = await fetch(siteUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('site.json konnte nicht geladen werden');
  }
  return response.json();
}

function renderNavigation(items) {
  if (!navLinks) return;

  if (!items.length) {
    navLinks.innerHTML = '<a href="index.html">Start</a>';
    return;
  }

  navLinks.innerHTML = items
    .map((item) => `
      <a href="detail.html?slug=${encodeURIComponent(item.slug)}">${item.title}</a>
    `)
    .join('');
}

function renderCompanyGallery(images) {
  if (!companyGallery) return;

  if (!images.length) {
    companyGallery.innerHTML = '';
    return;
  }

  const companyClass = images.length === 1 ? 'company-gallery company-gallery--single' : images.length === 2 ? 'company-gallery company-gallery--two' : 'company-gallery company-gallery--many';
  const gallery = images
    .map((image) => `
      <div class="hero-card company-card">
        <img src="${normalizeImage(image)}" alt="Unternehmen" loading="eager" />
      </div>
    `)
    .join('');

  companyGallery.innerHTML = `
    <div class="${companyClass}">${gallery}</div>
  `;
}

function renderHome(products) {
  if (!homeGrid) return;

  if (!products.length) {
    homeGrid.innerHTML = '<p>Es sind noch keine Produkte hinterlegt.</p>';
    return;
  }

  homeGrid.innerHTML = products
    .map((item) => `
      <article class="card">
        <img src="${normalizeImage(item.cover || (item.images && item.images[0]))}" alt="${item.title}" loading="lazy">
        <div class="card-copy">
          <h3>${item.title}</h3>
          <p>${item.subtitle}</p>
          <a href="detail.html?slug=${encodeURIComponent(item.slug)}">Mehr erfahren</a>
        </div>
      </article>
    `)
    .join('');
}

function renderDetail(items) {
  if (!detailRoot) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const item = items.find((entry) => entry.slug === slug) || items[0];

  if (!item) {
    detailRoot.innerHTML = '<p>Keine Inhalte gefunden.</p>';
    return;
  }

  const galleryImages = (item.images || []).filter(Boolean);
  const galleryCount = galleryImages.length;
  const galleryClass = galleryCount === 1 ? 'gallery-grid gallery--single' : galleryCount === 2 ? 'gallery-grid gallery--two' : galleryCount === 3 ? 'gallery-grid gallery--three' : galleryCount > 3 ? 'gallery-grid gallery--many' : '';

  const gallery = galleryImages.length
    ? galleryImages
        .map((image) => `
          <figure class="gallery-item">
            <img src="${normalizeImage(image)}" alt="${item.title}" loading="lazy">
          </figure>
        `)
        .join('')
    : '';

  detailRoot.innerHTML = `
    <article class="detail-page">
      <div class="detail-header">
        <img src="${normalizeImage(item.cover || (galleryImages[0] || ''))}" alt="${item.title}">
        <div>
          <p class="eyebrow">${item.kicker || 'Beutiful flowers'}</p>
          <h1>${item.title}</h1>
          <h2>${item.subtitle}</h2>
          <p>${item.description}</p>
          <div class="detail-actions">
            <a class="button" href="index.html">Zurück zur Hauptseite</a>
            <a class="button button-light" href="mailto:hello@flowerpower.example">Anfragen</a>
          </div>
        </div>
      </div>
      ${galleryImages.length ? `<div class="${galleryClass}">${gallery}</div>` : ''}
    </article>
  `;
}

async function init() {
  try {
    const data = await loadSiteData();
    const companyImages = data.companyImages || [];
    const products = data.products || [];

    renderCompanyGallery(companyImages);
    renderNavigation(products);
    renderHome(products);
    renderDetail(products);
  } catch (error) {
    console.error(error);
    if (companyGallery) {
      companyGallery.innerHTML = '';
    }
    if (homeGrid) {
      homeGrid.innerHTML = '<p>Inhalte konnten nicht geladen werden.</p>';
    }
    if (detailRoot) {
      detailRoot.innerHTML = '<p>Inhalte konnten nicht geladen werden.</p>';
    }
  }
}

init();
