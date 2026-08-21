/**
 * Fill missing locale keys (resumable). Uses MyMemory API; Google as fallback.
 * Usage: node scripts/fill-i18n-gaps.cjs [lang...]
 */
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const langs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['hi', 'mr', 'gu', 'kn', 'te', 'ta', 'bn', 'or'];

const langCodes = { hi: 'hi', mr: 'mr', gu: 'gu', kn: 'kn', te: 'te', ta: 'ta', bn: 'bn', or: 'or' };

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
let hi = null;

function loadLang(lang) {
  const file = path.join(localesDir, `${lang}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveLang(lang, data) {
  fs.writeFileSync(path.join(localesDir, `${lang}.json`), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function shouldSkipKey(key, value) {
  if (key.startsWith('contact.key.')) return true;
  if (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return true;
  if (typeof value === 'string' && /^\+?\d[\d\s/-]{8,}$/.test(value.trim())) return true;
  return false;
}

function needsTranslation(lang, key, current) {
  if (shouldSkipKey(key, en[key])) return false;
  if (!(key in current)) return true;
  const val = current[key];
  if (!val || val === en[key]) return true;
  return false;
}

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateMyMemory(text, from, to) {
  const { protectedText, tokens } = protectPlaceholders(text);
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText)}&langpair=${from}|${to}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || 'MyMemory failed');
  }
  return restorePlaceholders(data.responseData.translatedText, tokens);
}

async function translateGoogle(text, to) {
  const { protectedText, tokens } = protectPlaceholders(text);
  const { translate } = await import('@vitalets/google-translate-api');
  const result = await translate(protectedText, { from: 'en', to });
  return restorePlaceholders(result.text, tokens);
}

async function translateValue(text, lang, useHiSource) {
  if (!text || !text.trim()) return text;
  const to = langCodes[lang];
  const maxChunk = 420;

  async function translateChunk(chunk, from) {
    try {
      return await translateMyMemory(chunk, from, to);
    } catch {
      await sleep(1500);
      try {
        return await translateGoogle(chunk, to);
      } catch {
        return null;
      }
    }
  }

  if (text.length <= maxChunk) {
    const from = useHiSource ? 'hi' : 'en';
    return (await translateChunk(text, from)) || text;
  }

  const parts = text.match(/[^.!?]+[.!?]?/g) || [text];
  const out = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const translated = await translateChunk(trimmed.slice(0, maxChunk), useHiSource ? 'hi' : 'en');
    out.push(translated || trimmed);
    await sleep(350);
  }
  return out.join(' ');
}

async function fillLang(lang) {
  if (!hi && lang !== 'hi') hi = loadLang('hi');
  const current = loadLang(lang);
  const missing = Object.keys(en).filter((k) => needsTranslation(lang, k, current));
  console.log(`\n${lang}: ${missing.length} keys to translate`);

  let done = 0;
  for (const key of missing) {
    const useHiSource = lang !== 'hi' && hi && hi[key] && hi[key] !== en[key];
    const source = useHiSource ? hi[key] : en[key];
    try {
      const translated = await translateValue(source, lang, useHiSource);
      if (translated && translated !== en[key]) {
        current[key] = translated;
      } else {
        current[key] = source === en[key] ? en[key] : source;
      }
      done++;
      if (done % 20 === 0) {
        saveLang(lang, current);
        console.log(`  ${lang}: ${done}/${missing.length}`);
      }
      await sleep(400);
    } catch (err) {
      console.error(`  failed ${key}:`, err.message);
      await sleep(800);
    }
  }

  saveLang(lang, current);
  console.log(`${lang}: done (${Object.keys(current).length} keys)`);
}

(async () => {
  for (const lang of langs) {
    await fillLang(lang);
    if (lang === 'hi') hi = loadLang('hi');
  }
  console.log('\nAll languages updated.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
