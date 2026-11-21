const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEXT_DIR = path.join(ROOT_DIR, '.next');
const DEPLOY_DIR = path.join(ROOT_DIR, 'deploy-public');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function safeCopyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

console.log('Preparing Firebase Hosting static distribution in:', DEPLOY_DIR);

// 1. Clean and initialize deploy-public
if (fs.existsSync(DEPLOY_DIR)) {
  const resolvedRoot = fs.realpathSync(ROOT_DIR);
  const resolvedDeploy = fs.realpathSync(DEPLOY_DIR);
  if (resolvedDeploy !== path.join(resolvedRoot, 'deploy-public')) throw new Error('Refusing to clear an unexpected deployment directory.');
  fs.rmSync(resolvedDeploy, { recursive: true, force: true });
}
fs.mkdirSync(DEPLOY_DIR, { recursive: true });

// 2. Copy static asset bundle (_next/static)
const nextStaticSrc = path.join(NEXT_DIR, 'static');
const nextStaticDest = path.join(DEPLOY_DIR, '_next', 'static');
console.log('Copying static assets from', nextStaticSrc, 'to', nextStaticDest);
copyDirRecursive(nextStaticSrc, nextStaticDest);

// 3. Copy top-level prerendered pages
const appServerDir = path.join(NEXT_DIR, 'server', 'app');
const topLevelPages = [
  'index',
  'explore',
  'assessments',
  'community',
  'dashboard',
  'privacy',
  'terms',
  'results',
  'history',
  'compare',
  'couples',
  'profile',
  'settings',
  '_not-found',
];

// Discover any extra top-level .html files
if (fs.existsSync(appServerDir)) {
  const serverFiles = fs.readdirSync(appServerDir);
  for (const f of serverFiles) {
    if (f.endsWith('.html') && !f.startsWith('_')) {
      const base = path.basename(f, '.html');
      if (!topLevelPages.includes(base)) {
        topLevelPages.push(base);
      }
    }
  }
}

for (const page of topLevelPages) {
  const htmlSrc = path.join(appServerDir, `${page}.html`);
  if (fs.existsSync(htmlSrc)) {
    if (page === 'index') {
      safeCopyFile(htmlSrc, path.join(DEPLOY_DIR, 'index.html'));
    } else if (page === '_not-found') {
      safeCopyFile(htmlSrc, path.join(DEPLOY_DIR, '404.html'));
    } else {
      // Provide both cleanUrl (.html) and directory (/index.html)
      safeCopyFile(htmlSrc, path.join(DEPLOY_DIR, `${page}.html`));
      safeCopyFile(htmlSrc, path.join(DEPLOY_DIR, page, 'index.html'));
    }
    console.log(`Copied top-level page: ${page}`);
  }
}

// Ensure 404.html fallback
const fallback404 = path.join(NEXT_DIR, 'server', 'pages', '404.html');
if (!fs.existsSync(path.join(DEPLOY_DIR, '404.html')) && fs.existsSync(fallback404)) {
  safeCopyFile(fallback404, path.join(DEPLOY_DIR, '404.html'));
}

// 4. Copy all 40 assessment prerendered pages
const assessSrcDir = path.join(appServerDir, 'assess');
let assessCount = 0;
if (fs.existsSync(assessSrcDir)) {
  const assessFiles = fs.readdirSync(assessSrcDir).filter(f => f.endsWith('.html'));
  for (const file of assessFiles) {
    const slug = path.basename(file, '.html');
    const fullHtmlPath = path.join(assessSrcDir, file);
    // Write both /assess/<slug>.html and /assess/<slug>/index.html
    safeCopyFile(fullHtmlPath, path.join(DEPLOY_DIR, 'assess', `${slug}.html`));
    safeCopyFile(fullHtmlPath, path.join(DEPLOY_DIR, 'assess', slug, 'index.html'));
    assessCount++;
  }
}
console.log(`Copied ${assessCount} assessment static pages to deploy-public/assess/`);

// 5. Copy public folder assets (e.g. og-image.png, og-image.svg)
const publicDir = path.join(ROOT_DIR, 'public');
if (fs.existsSync(publicDir)) {
  copyDirRecursive(publicDir, DEPLOY_DIR);
  console.log('Copied public/ assets to deploy-public/');
}

// 6. Copy metadata files: robots.txt, sitemap.xml, icon.svg, manifest
safeCopyFile(path.join(appServerDir, 'robots.txt.body'), path.join(DEPLOY_DIR, 'robots.txt'));
safeCopyFile(path.join(appServerDir, 'sitemap.xml.body'), path.join(DEPLOY_DIR, 'sitemap.xml'));
safeCopyFile(path.join(appServerDir, 'manifest.webmanifest.body'), path.join(DEPLOY_DIR, 'manifest.webmanifest'));

const iconSrc = path.join(ROOT_DIR, 'src', 'app', 'icon.svg');
safeCopyFile(iconSrc, path.join(DEPLOY_DIR, 'icon.svg'));

console.log('Firebase Hosting static distribution prepared successfully!');
