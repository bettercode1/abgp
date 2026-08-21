/**
 * Compare locale JSON files against English baseline.
 * Usage: node scripts/compare-i18n-keys.cjs
 */
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const langs = ['en', 'hi', 'mr', 'gu', 'kn', 'te', 'ta', 'bn', 'or'];

const map = {};
for (const lang of langs) {
  map[lang] = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(localesDir, `${lang}.json`), 'utf8'))));
}

const enKeys = [...map.en].sort();
console.log('Key counts:', Object.fromEntries(langs.map((l) => [l, map[l].size])));

let totalMissing = 0;
for (const lang of langs) {
  if (lang === 'en') continue;
  const missing = enKeys.filter((k) => !map[lang].has(k));
  totalMissing += missing.length;
  console.log(`${lang}: ${missing.length} missing`);
  if (missing.length && missing.length <= 15) missing.forEach((k) => console.log(`  - ${k}`));
}

process.exit(totalMissing > 0 ? 1 : 0);
