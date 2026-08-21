/**
 * Extract translation blocks from src/i18n/index.ts into src/i18n/locales/*.json
 * Usage: node scripts/extract-i18n-locales.cjs
 */
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src/i18n/index.ts');
const outDir = path.join(__dirname, '../src/i18n/locales');
const src = fs.readFileSync(srcPath, 'utf8');
const langs = ['en', 'hi', 'mr', 'gu', 'kn', 'te', 'ta', 'bn', 'or'];

function parseTranslations(lang) {
  const startRe = new RegExp(`^  ${lang}: \\{\\s*$`, 'm');
  const startMatch = startRe.exec(src);
  if (!startMatch) throw new Error(`Language block not found: ${lang}`);

  const translationStart = src.indexOf('translation: {', startMatch.index);
  if (translationStart === -1) throw new Error(`translation block not found for ${lang}`);

  let i = src.indexOf('{', translationStart);
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) inString = false;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) break;
    }
  }

  const block = src.slice(src.indexOf('{', translationStart), i + 1);
  const obj = {};
  const lines = block.split('\n');
  let currentKey = null;
  let currentValue = '';

  for (const line of lines) {
    const keyMatch = line.match(/^      '([^']+)':\s*(.*)$/);
    if (keyMatch) {
      if (currentKey) obj[currentKey] = currentValue.trim();
      currentKey = keyMatch[1];
      let rest = keyMatch[2].trim();
      if (rest.endsWith(',')) rest = rest.slice(0, -1);
      if (rest.startsWith("'") && rest.endsWith("'")) {
        obj[currentKey] = rest.slice(1, -1).replace(/\\'/g, "'");
        currentKey = null;
        currentValue = '';
      } else {
        currentValue = rest;
      }
      continue;
    }
    if (currentKey) {
      currentValue += (currentValue ? '\n' : '') + line.trim();
      const trimmed = currentValue.trim();
      if (trimmed.endsWith("'") && !trimmed.endsWith("\\'")) {
        obj[currentKey] = trimmed.slice(0, -1).replace(/^'/, '').replace(/\\'/g, "'");
        currentKey = null;
        currentValue = '';
      }
    }
  }

  return obj;
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const lang of langs) {
  const obj = parseTranslations(lang);
  fs.writeFileSync(path.join(outDir, `${lang}.json`), JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log(`${lang}: ${Object.keys(obj).length} keys`);
}
