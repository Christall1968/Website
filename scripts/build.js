const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'content');
const outputFile = path.join(rootDir, 'site.json');

function toPosix(value) {
  return value.replace(/\\/g, '/');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function ensurePlaceholderSvg(filePath, label) {
  if (fs.existsSync(filePath)) {
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const safeLabel = escapeXml(label || 'Bild hier einfügen');
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${safeLabel}">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#f5eee7" />
        <stop offset="100%" stop-color="#ead8c7" />
      </linearGradient>
      <linearGradient id="panel" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#fffdfb" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#f4ece7" stop-opacity="0.9" />
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#bg)" />
    <rect x="120" y="100" width="960" height="700" rx="52" fill="url(#panel)" stroke="#c9a98d" stroke-width="4" opacity="0.85" />
    <circle cx="340" cy="305" r="120" fill="#f0d7bd" opacity="0.9" />
    <circle cx="590" cy="360" r="150" fill="#f7e3d0" opacity="0.9" />
    <circle cx="885" cy="330" r="120" fill="#f0d7bd" opacity="0.9" />
    <circle cx="430" cy="560" r="150" fill="#f6e7d8" opacity="0.9" />
    <circle cx="760" cy="600" r="170" fill="#efd4b8" opacity="0.9" />
    <g stroke="#b68860" stroke-width="4" opacity="0.6">
      <path d="M330 240 C390 300, 420 260, 470 330" fill="none" />
      <path d="M720 250 C780 310, 810 280, 860 330" fill="none" />
      <path d="M430 650 C520 610, 560 640, 620 680" fill="none" />
    </g>
    <text x="600" y="470" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="600" fill="#5a4339" letter-spacing="1.5">${safeLabel}</text>
    <text x="600" y="525" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#8d685d">Bild hier einfügen</text>
  </svg>
  `.trim();

  fs.writeFileSync(filePath, svg, 'utf8');
}

function hasAnyImageFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return false;
  }

  return fs.readdirSync(dirPath, { withFileTypes: true })
    .some((entry) => entry.isFile() && !entry.name.startsWith('.'));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getLocalImages(folderName) {
  const safeFolderName = folderName.replace(/^content\//, '');
  const imagesDir = path.join(contentDir, safeFolderName, 'images');
  if (!fs.existsSync(imagesDir)) {
    return [];
  }

  return fs.readdirSync(imagesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
    .map((entry) => toPosix(path.posix.join('content', safeFolderName, 'images', entry.name)))
    .sort();
}

function getPreferredCover(images) {
  const priority = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  return images
    .slice()
    .sort((a, b) => {
      const aExt = path.extname(a).toLowerCase();
      const bExt = path.extname(b).toLowerCase();
      return priority.indexOf(aExt) - priority.indexOf(bExt);
    })
    .find((image) => /cover|main|hero/i.test(path.basename(image))) || images[0];
}

function normalizeProduct(item, folderName) {
  const safeFolderName = folderName.replace(/^content\//, '');
  const imagesFolder = path.join(contentDir, safeFolderName, 'images');

  if (!hasAnyImageFiles(imagesFolder)) {
    ensurePlaceholderSvg(path.join(imagesFolder, 'cover.svg'), item.title || safeFolderName.replace(/[-_]/g, ' '));
  }

  const localImages = getLocalImages(safeFolderName);
  const sourceImages = (item.images && item.images.length ? item.images : localImages).map((image) => toPosix(image));
  const coverCandidate = item.cover || getPreferredCover(sourceImages) || sourceImages[0];
  const normalizedImages = [...new Set(sourceImages.filter((image) => image !== coverCandidate))];
  const normalizedCover = item.cover || coverCandidate || toPosix(path.posix.join('content', safeFolderName, 'images', 'cover.svg'));

  return {
    ...item,
    slug: item.slug || safeFolderName,
    cover: normalizedCover,
    images: normalizedImages,
    menuOrder: Number(item.menuOrder || 999),
  };
}

function ensureCompanyPlaceholders() {
  const companyRoot = path.join(contentDir, 'company');
  const companyImagesDir = path.join(companyRoot, 'images');
  fs.mkdirSync(companyImagesDir, { recursive: true });

  const placeholderFiles = ['hero-1.svg', 'hero-2.svg'];
  placeholderFiles.forEach((fileName) => ensurePlaceholderSvg(path.join(companyImagesDir, fileName), 'Bild hier einfügen'));
}

function collectProducts() {
  const productsRoot = path.join(contentDir, 'products');
  if (!fs.existsSync(productsRoot)) {
    return [];
  }

  const products = [];
  const entries = fs.readdirSync(productsRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const folderName = entry.name;
    const folderPath = path.join(productsRoot, folderName);
    const manifestPath = path.join(folderPath, 'index.json');
    if (!fs.existsSync(manifestPath)) continue;

    const item = readJson(manifestPath);
    const imagesFolder = path.join(folderPath, 'images');
    if (!hasAnyImageFiles(imagesFolder)) {
      ensurePlaceholderSvg(path.join(imagesFolder, 'cover.svg'), item.title || folderName);
    }

    products.push(normalizeProduct(item, path.posix.join('content', 'products', folderName)));
  }

  return products.sort((a, b) => a.menuOrder - b.menuOrder);
}

function collectCompanyImages() {
  const companyRoot = path.join(contentDir, 'company');
  if (!fs.existsSync(companyRoot)) {
    return [];
  }

  ensureCompanyPlaceholders();
  return getLocalImages('company');
}

const companyImages = collectCompanyImages();
const products = collectProducts();
fs.writeFileSync(outputFile, JSON.stringify({ companyImages, products }, null, 2));
console.log(`Generated ${products.length} products and ${companyImages.length} company images in ${outputFile}`);
