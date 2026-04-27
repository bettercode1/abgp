const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'src', 'i18n', 'index.ts');
let content = fs.readFileSync(i18nPath, 'utf-8');

const replacements = {
  hi: {
    "'nav.prantContacts': 'Prant Membership Contacts',": "'nav.prantContacts': 'प्रांत सदस्यता संपर्क',",
    "'nav.kshetraMantri': 'Kshetra Sanghatan Mantri',": "'nav.kshetraMantri': 'क्षेत्र संगठन मंत्री',",
    "'nav.quickMemos': 'QuickMemos',": "'nav.quickMemos': 'क्विक मेमो',",
    additions: {
      'home.profil': 'ABGP के बारे में',
      'home.welcome': 'अखिल भारतीय ग्राहक पंचायत की आधिकारिक वेबसाइट पर आपका स्वागत है',
      'home.profilIntro': 'भारत भर में जागरूकता, संगठन और कार्रवाई के माध्यम से ग्राहकों को सशक्त बनाने के लिए प्रतिबद्ध एक राष्ट्रीय स्तर का उपभोक्ता संगठन। 25+ राज्यों और लगभग 510 जिलों में सक्रिय।',
      'home.profilIntro2': 'हमारा लक्ष्य ग्राहक आंदोलन को एक जन आंदोलन - एक वास्तविक जन आंदोलन में बदलना है। ABGP खाद्य मिलावट, एमआरपी उल्लंघन, बैंकिंग जमाकर्ता अधिकार, साइबर सुरक्षा और भ्रामक विज्ञापनों सहित प्रमुख उपभोक्ता मुद्दों का समाधान करता है। हम सभी उपभोक्ताओं के कल्याण के लिए जाति, पंथ, धर्म और लिंग से परे काम करते हैं।',
      'home.profilReadMore': 'और पढ़ें'
    }
  },
  mr: {
    "'nav.prantContacts': 'Prant Membership Contacts',": "'nav.prantContacts': 'प्रांत सदस्यता संपर्क',",
    "'nav.kshetraMantri': 'Kshetra Sanghatan Mantri',": "'nav.kshetraMantri': 'क्षेत्र संघटन मंत्री',",
    "'nav.quickMemos': 'QuickMemos',": "'nav.quickMemos': 'क्विक मेमो',",
    additions: {
      'home.profil': 'ABGP बद्दल',
      'home.welcome': 'अखिल भारतीय ग्राहक पंचायतच्या अधिकृत वेबसाइटवर आपले स्वागत आहे',
      'home.profilIntro': 'संपूर्ण भारतात जागरूकता, संघटन आणि कृतीद्वारे ग्राहकांना सक्षम करण्यासाठी वचनबद्ध असलेली राष्ट्रीय स्तरावरील ग्राहक संस्था. 25+ राज्ये आणि जवळपास 510 जिल्ह्यांमध्ये सक्रिय.',
      'home.profilIntro2': 'आमचे ध्येय ग्राहक आंदोलनाचे जनआंदोलनात - खऱ्या लोकआंदोलनात रूपांतर करणे हे आहे. ABGP अन्न भेसळ, MRP उल्लंघन, बँकिंग ठेवीदार हक्क, सायबर सुरक्षा आणि दिशाभूल करणाऱ्या जाहिरातींसह प्रमुख ग्राहक समस्या सोडवते. आम्ही सर्व ग्राहकांच्या कल्याणासाठी जात, पंथ, धर्म आणि लिंगाच्या पलीकडे काम करतो.',
      'home.profilReadMore': 'अधिक वाचा'
    }
  },
  gu: {
    "'nav.prantContacts': 'Prant Membership Contacts',": "'nav.prantContacts': 'પ્રાંત સભ્યપદ સંપર્કો',",
    "'nav.kshetraMantri': 'Kshetra Sanghatan Mantri',": "'nav.kshetraMantri': 'ક્ષેત્ર સંગઠન મંત્રી',",
    "'nav.quickMemos': 'QuickMemos',": "'nav.quickMemos': 'ક્વિક મેમો',",
    additions: {
      'home.profil': 'ABGP વિશે',
      'home.welcome': 'અખિલ ભારતીય ગ્રાહક પંચાયતની સત્તાવાર વેબસાઇટ પર આપનું સ્વાગત છે',
      'home.profilIntro': 'સમગ્ર ભારતમાં જાગૃતિ, સંગઠન અને કાર્યવાહી દ્વારા ગ્રાહકોને સશક્ત બનાવવા માટે પ્રતિબદ્ધ રાષ્ટ્રીય-સ્તરનું ગ્રાહક સંગઠન. 25+ રાજ્યો અને લગભગ 510 જિલ્લાઓમાં સક્રિય.',
      'home.profilIntro2': 'અમારું લક્ષ્ય ગ્રાહક આંદોલનને જન આંદોલનમાં બદલવાનું છે - એક સાચું લોક આંદોલન. ABGP ખાદ્યપદાર્થોમાં ભેળસેળ, MRP ઉલ્લંઘન, બેંકિંગ થાપણદારોના અધિકારો, સાયબર સુરક્ષા અને ભ્રામક જાહેરાતો સહિતના મુખ્ય ગ્રાહક મુદ્દાઓને સંબોધિત કરે છે. અમે તમામ ગ્રાહકોના કલ્યાણ માટે જાતિ, પંથ, ધર્મ અને લિંગની બહાર કામ કરીએ છીએ.',
      'home.profilReadMore': 'વધુ વાંચો'
    }
  },
  kn: {
    "'nav.prantContacts': 'Prant Membership Contacts',": "'nav.prantContacts': 'ಪ್ರಾಂತ ಸದಸ್ಯತ್ವ ಸಂಪರ್ಕಗಳು',",
    "'nav.kshetraMantri': 'Kshetra Sanghatan Mantri',": "'nav.kshetraMantri': 'ಕ್ಷೇತ್ರ ಸಂಘಟನಾ ಮಂತ್ರಿ',",
    "'nav.quickMemos': 'QuickMemos',": "'nav.quickMemos': 'ಕ್ವಿಕ್ ಮೆಮೊಗಳು',",
    additions: {
      'home.profil': 'ABGP ಬಗ್ಗೆ',
      'home.welcome': 'ಅಖಿಲ ಭಾರತೀಯ ಗ್ರಾಹಕ ಪಂಚಾಯತ್‌ನ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಸುಸ್ವಾಗತ',
      'home.profilIntro': 'ಭಾರತದಾದ್ಯಂತ ಜಾಗೃತಿ, ಸಂಘಟನೆ ಮತ್ತು ಕ್ರಿಯೆಯ ಮೂಲಕ ಗ್ರಾಹಕರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸಲು ಬದ್ಧವಾಗಿರುವ ರಾಷ್ಟ್ರೀಯ ಮಟ್ಟದ ಗ್ರಾಹಕ ಸಂಸ್ಥೆ. 25+ ರಾಜ್ಯಗಳು ಮತ್ತು ಸುಮಾರು 510 ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿದೆ.',
      'home.profilIntro2': 'ಗ್ರಾಹಕ ಆಂದೋಲನವನ್ನು ಜನ ಆಂದೋಲನವಾಗಿ - ನಿಜವಾದ ಜನರ ಆಂದೋಲನವಾಗಿ ಪರಿವರ್ತಿಸುವುದು ನಮ್ಮ ಗುರಿಯಾಗಿದೆ. ABGP ಆಹಾರ ಕಲಬೆರಕೆ, MRP ಉಲ್ಲಂಘನೆ, ಬ್ಯಾಂಕಿಂಗ್ ಠೇವಣಿದಾರರ ಹಕ್ಕುಗಳು, ಸೈಬರ್ ಸುರಕ್ಷತೆ ಮತ್ತು ದಾರಿತಪ್ಪಿಸುವ ಜಾಹೀರಾತುಗಳು ಸೇರಿದಂತೆ ಪ್ರಮುಖ ಗ್ರಾಹಕ ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಹರಿಸುತ್ತದೆ. ನಾವು ಎಲ್ಲಾ ಗ್ರಾಹಕರ ಕಲ್ಯಾಣಕ್ಕಾಗಿ ಜಾತಿ, ಧರ್ಮ ಮತ್ತು ಲಿಂಗವನ್ನು ಮೀರಿ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ.',
      'home.profilReadMore': 'ಇನ್ನಷ್ಟು ಓದಿ'
    }
  }
};

let lines = content.split('\n');
let inLang = '';

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  if (line.match(/^  [a-z]{2}: \{/)) {
    inLang = line.trim().substring(0, 2);
  }
  
  if (inLang && replacements[inLang]) {
    const config = replacements[inLang];
    
    // Replace direct lines
    for (const [find, rep] of Object.entries(config)) {
      if (find === 'additions') continue;
      if (line.includes(find)) {
        lines[i] = line.replace(find, rep);
      }
    }
    
    // Check if we reached the end of the translation block for this language to append additions
    if (line.includes('// Hero Section') || (line.includes('home.stats.locations') && !content.includes('home.profilIntro') && inLang !== 'en')) {
      // Just inject it around here. A safe place is before home.stats or Hero Section.
    }
  }
}

content = lines.join('\n');

// For additions, it's safer to just inject them right after 'nav.activities' in each language block
for (const lang of Object.keys(replacements)) {
  const langRegex = new RegExp(`(${lang}:\\s*{\\s*translation:\\s*{[\\s\\S]*?'nav\\.activities': '.*?',)`);
  const match = content.match(langRegex);
  
  if (match && !content.includes(`'home.profil':`, match.index + 50)) {
    const adds = replacements[lang].additions;
    const keysString = Object.entries(adds)
      .map(([k, v]) => `\n      '${k}': '${v.replace(/'/g, "\\'")}',`)
      .join('');
    
    content = content.replace(langRegex, `$1${keysString}`);
  }
}

fs.writeFileSync(i18nPath, content, 'utf-8');
console.log('Fixed nav keys and added Profil section translations successfully.');
