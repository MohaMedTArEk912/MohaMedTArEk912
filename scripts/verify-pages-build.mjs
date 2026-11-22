import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');
const publicComicDir = resolve(rootDir, 'public', 'comic');

function parseBaseArg() {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--base');
  const raw = (idx !== -1 && args[idx + 1]) || process.env.PAGES_BASE_PATH || '/';
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '/') return '/';
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, acc);
    } else if (entry.isFile()) {
      acc.push({ path: relative(distDir, full).replaceAll('\\', '/'), size: statSync(full).size });
    }
  }
  return acc;
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const basePath = parseBaseArg();
const errors = [];

if (!existsSync(distDir)) {
  console.error('dist/ directory does not exist. Run the build first.');
  process.exit(1);
}

const requiredFiles = [
  'index.html',
  'comic/index.html',
  'resume/index.html',
  '404.html',
  '.nojekyll',
  'favicon.svg',
  'manifest.webmanifest',
  'robots.txt',
  'sitemap.xml',
  'mohamed-tarek-hussien-resume.pdf',
  'profile.jpg',
  'avatar/model.fbx',
];

if (existsSync(publicComicDir)) {
  for (const file of readdirSync(publicComicDir)) {
    if (file.endsWith('.webp')) {
      requiredFiles.push(`comic/${file}`);
    }
  }
}

for (const file of requiredFiles) {
  if (!existsSync(join(distDir, file))) {
    errors.push(`Missing required build output: dist/${file}`);
  }
}

function checkHtml(fileName, { requireMeta = false } = {}) {
  const filePath = join(distDir, fileName);
  if (!existsSync(filePath)) return;
  const html = readFileSync(filePath, 'utf8');

  if (html.includes('%BASE_URL%')) {
    errors.push(`${fileName} contains an unresolved %BASE_URL% placeholder.`);
  }

  if (basePath !== '/') {
    const attrPattern = /\b(?:href|src)="(\/[^"]*)"/g;
    for (const match of html.matchAll(attrPattern)) {
      const value = match[1];
      if (value.startsWith('//')) continue;
      if (!value.startsWith(basePath)) {
        errors.push(`${fileName} has root-relative path "${value}" outside base "${basePath}".`);
      }
    }
  }

  if (requireMeta) {
    for (const snippet of ['property="og:title"', 'property="og:image"', 'name="twitter:card"', 'rel="canonical"']) {
      if (!html.includes(snippet)) {
        errors.push(`${fileName} is missing SEO/social metadata (${snippet}).`);
      }
    }
  }
}

checkHtml('index.html', { requireMeta: true });
checkHtml('comic/index.html', { requireMeta: true });
checkHtml('resume/index.html');
checkHtml('404.html');

const allFiles = collectFiles(distDir);
const totalBytes = allFiles.reduce((sum, file) => sum + file.size, 0);
const assetBundles = allFiles
  .filter((file) => file.path.startsWith('assets/') && (file.path.endsWith('.js') || file.path.endsWith('.css')))
  .sort((a, b) => b.size - a.size);

const summaryLines = [
  '### GitHub Pages Build Verification',
  '',
  `- **Base path**: \`${basePath}\``,
  `- **Total output files**: ${allFiles.length} (${formatMb(totalBytes)})`,
  `- **Required assets checked**: ${requiredFiles.length}`,
  `- **Status**: ${errors.length === 0 ? 'Passed' : `Failed (${errors.length} issue${errors.length === 1 ? '' : 's'})`}`,
  '',
  '| Asset | Size |',
  '| :--- | ---: |',
  ...assetBundles.slice(0, 10).map((file) => `| \`${file.path}\` | ${formatKb(file.size)} |`),
  '',
];

if (errors.length > 0) {
  summaryLines.push('#### Verification Errors', '', ...errors.map((err) => `- ${err}`), '');
}

const summaryText = `${summaryLines.join('\n')}\n`;
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryText, 'utf8');
}

if (errors.length > 0) {
  for (const err of errors) {
    console.error(`ERROR: ${err}`);
  }
  process.exit(1);
}

console.log(`Verified GitHub Pages build (${allFiles.length} files, ${formatMb(totalBytes)}, base: ${basePath}).`);
