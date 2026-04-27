const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'src', 'i18n', 'index.ts');
let content = fs.readFileSync(i18nPath, 'utf-8');

const keysToAdd = {
  en: {
    'home.stats.prants': 'Prants',
    'home.stats.india': 'India',
    'home.profil.ad': 'Advertisement',
    'home.profil.adBanner': 'Add your ad banner here',
    'home.profil.adBlank': '(Right-side blank space filled)'
  },
  hi: {
    'home.stats.prants': 'प्रांत',
    'home.stats.india': 'भारत',
    'home.profil.ad': 'विज्ञापन',
    'home.profil.adBanner': 'अपना विज्ञापन बैनर यहाँ जोड़ें',
    'home.profil.adBlank': '(दाईं ओर का खाली स्थान भर गया)'
  },
  mr: {
    'home.stats.prants': 'प्रांत',
    'home.stats.india': 'भारत',
    'home.profil.ad': 'जाहिरात',
    'home.profil.adBanner': 'तुमचे जाहिरात बॅनर येथे जोडा',
    'home.profil.adBlank': '(उजव्या बाजूची रिकामी जागा भरली)'
  },
  gu: {
    'home.stats.prants': 'પ્રાંત',
    'home.stats.india': 'ભારત',
    'home.profil.ad': 'જાહેરાત',
    'home.profil.adBanner': 'તમારું જાહેરાત બેનર અહીં ઉમેરો',
    'home.profil.adBlank': '(જમણી બાજુની ખાલી જગ્યા ભરાઈ ગઈ)'
  },
  kn: {
    'home.stats.prants': 'ಪ್ರಾಂತಗಳು',
    'home.stats.india': 'ಭಾರತ',
    'home.profil.ad': 'ಜಾಹೀರಾತು',
    'home.profil.adBanner': 'ನಿಮ್ಮ ಜಾಹೀರಾತು ಬ್ಯಾನರ್ ಅನ್ನು ಇಲ್ಲಿ ಸೇರಿಸಿ',
    'home.profil.adBlank': '(ಬಲಬದಿಯ ಖಾಲಿ ಜಾಗ ತುಂಬಿದೆ)'
  }
};

for (const lang in keysToAdd) {
  const langRegex = new RegExp(`(${lang}:\\s*{\\s*translation:\\s*{)`);
  const match = content.match(langRegex);
  
  if (match) {
    const keysString = Object.entries(keysToAdd[lang])
      .map(([k, v]) => `\n      '${k}': '${v}',`)
      .join('');
    
    content = content.replace(langRegex, `$1${keysString}`);
  }
}

fs.writeFileSync(i18nPath, content, 'utf-8');
console.log('Translations added successfully.');
