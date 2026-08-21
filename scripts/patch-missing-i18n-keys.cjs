/**
 * Add keys that exist in en but are missing from ta/bn/or (targeted patch).
 */
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const langs = ['ta', 'bn', 'or'];
const langCodes = { ta: 'ta', bn: 'bn', or: 'or' };

function protectPlaceholders(text) {
  const tokens = [];
  const protectedText = text.replace(/\{\{[^}]+\}\}/g, (match) => {
    const token = `__PH${tokens.length}__`;
    tokens.push(match);
    return token;
  });
  return { protectedText, tokens };
}

function restorePlaceholders(text, tokens) {
  let out = text;
  tokens.forEach((token, i) => {
    out = out.split(`__PH${i}__`).join(token);
  });
  return out;
}

async function translate(text, to) {
  const { protectedText, tokens } = protectPlaceholders(text);
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText)}&langpair=en|${to}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'failed');
  return restorePlaceholders(data.responseData.translatedText, tokens);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  for (const lang of langs) {
    const file = path.join(localesDir, `${lang}.json`);
    const current = JSON.parse(fs.readFileSync(file, 'utf8'));
    const missing = Object.keys(en).filter((k) => !(k in current));
    console.log(`${lang}: patching ${missing.length} missing keys`);
    for (const key of missing) {
      try {
        current[key] = await translate(en[key], langCodes[lang]);
      } catch {
        current[key] = en[key];
      }
      await sleep(350);
    }
    const sorted = Object.fromEntries(Object.keys(current).sort().map((k) => [k, current[k]]));
    fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
    console.log(`${lang}: ${Object.keys(sorted).length} keys`);
  }
})();
