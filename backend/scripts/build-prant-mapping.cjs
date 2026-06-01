/**
 * Builds state-district-prant mapping for the registration form.
 *
 *   node backend/scripts/build-prant-mapping.cjs              — rebuild from IGOD district rules
 *   node backend/scripts/build-prant-mapping.cjs --from-csv   — apply src/data/state-district-prant.csv
 *   node backend/scripts/build-prant-mapping.cjs --from-dsp   — apply src/data/dsp-list.csv (DSP List)
 */
const { writeFileSync, readFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const ROOT = join(__dirname, '../..');
const FROM_CSV = process.argv.includes('--from-csv');
const FROM_DSP = process.argv.includes('--from-dsp');

const PRANT_DISPLAY_NAMES = {
  andhra: 'Andhra Pradesh',
  arunachal: 'Arunachal Pradesh',
  assam: 'Assam',
  biharDakshin: 'Bihar (Dakshin)',
  biharUttar: 'Bihar (Uttar)',
  chattisgarh: 'Chhattisgarh',
  delhi: 'Delhi',
  gujarat: 'Gujarat',
  haryana: 'Haryana',
  himachal: 'Himachal',
  jammuKashmir: 'Jammu Kashmir',
  jharkhand: 'Jharkhand',
  karnataka: 'Karnataka',
  kerala: 'Kerala',
  mpMadhyabharat: 'MP (Madhyabharat)',
  mpMahakaushal: 'MP (Mahakaushal)',
  mpMalwa: 'MP (Malwa)',
  maharashtraDevgiri: 'Maharashtra (Devgiri)',
  maharashtraKonkan: 'Maharashtra (Konkan)',
  madhyaMaharashtra: 'Madhya Maharashtra',
  maharashtraVidharbh: 'Maharashtra (Vidharbh)',
  meghalaya: 'Meghalaya',
  odishaPashchim: 'Odisha (Pashchim)',
  odishaPurba: 'Odisha (Purba)',
  punjab: 'Punjab',
  rajasthanChittor: 'Rajasthan (Chittor)',
  rajasthanJaipur: 'Rajasthan (Jaipur)',
  rajasthanJodhpur: 'Rajasthan (Jodhpur)',
  sikkim: 'Sikkim',
  tamilnaduDakshin: 'Tamilnadu (Dakshin)',
  tamilnaduUttar: 'Tamilnadu (Uttar)',
  telangana: 'Telangana',
  upAvadh: 'UP (Avadh)',
  upBraj: 'UP (Braj)',
  upGoraksha: 'UP (Goraksha)',
  upKanpur: 'UP (Kanpur)',
  upKashi: 'UP (Kashi)',
  upMeerut: 'UP (Meerut)',
  uttarakhand: 'Uttarakhand',
};

const PRANT_NAME_TO_KEY = Object.fromEntries(
  Object.entries(PRANT_DISPLAY_NAMES).map(([k, v]) => [v, k])
);

function prantKeyToName(key) {
  return PRANT_DISPLAY_NAMES[key] || key;
}

function prantNameToKey(name) {
  const t = String(name || '').trim();
  return PRANT_NAME_TO_KEY[t] || t;
}

function csvEscape(val) {
  if (val.includes(',') || val.includes('"')) return `"${val.replace(/"/g, '""')}"`;
  return val;
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else inQ = !inQ;
    } else if (c === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

/** CSV "Prant" column labels → internal prant key (see src/lib/prantKeys.ts) */
const PRANT_CSV_ALIASES = {
  '- Punjab Prant': 'punjab',
  'Andaman Nicobar Prant': 'andhra',
  'Andhra Pradesh Prant': 'andhra',
  'Arunachal Pradesh Prant': 'arunachal',
  'Assam - Assam Prant': 'assam',
  'Assam Prant': 'assam',
  'BR-Dakshin Prant': 'biharDakshin',
  'BR-Uttar Prant': 'biharUttar',
  Chhattisgarh: 'chattisgarh',
  'Chhattisgarh Prant': 'chattisgarh',
  'Dadra Nagar Haveli Prant': 'gujarat',
  'Delhi Prant': 'delhi',
  'Goa Prant': 'maharashtraKonkan',
  'Gujarat Prant': 'gujarat',
  'Haryana Prant': 'haryana',
  'Himachal Prant': 'himachal',
  'Jammu Kashmir Pran': 'jammuKashmir',
  'Jammu Kashmir Prant': 'jammuKashmir',
  'Jammu Kashmir Prant - Jammu Kashmir Prant': 'jammuKashmir',
  'Jharkhand Prant': 'jharkhand',
  'Karnataka Prant': 'karnataka',
  'Kerala Prant': 'kerala',
  'Ladakh Prant': 'jammuKashmir',
  'Lakshadweep Prant': 'kerala',
  'MH-Devgiri Prant': 'maharashtraDevgiri',
  'MH-Konkan Prant': 'maharashtraKonkan',
  'MH-Madhya Maharashtra Prant': 'madhyaMaharashtra',
  'MH-Vidharbh Prant': 'maharashtraVidharbh',
  'MP-Madhya Bharat Prant': 'mpMadhyabharat',
  'MP-Mahakaushal Prant': 'mpMahakaushal',
  'MP-Malwa Prant': 'mpMalwa',
  'Manipur Prant': 'assam',
  'Meghalaya Prant': 'meghalaya',
  'Mizoram Prant': 'assam',
  'Nagaland Prant': 'assam',
  'OD-Pashchim Prant': 'odishaPashchim',
  'OD-Purba Prant': 'odishaPurba',
  'Panjab Prant': 'punjab',
  'Puducherry Prant': 'tamilnaduDakshin',
  'Punjab Prant': 'punjab',
  'RJ-Chittor Prant': 'rajasthanChittor',
  'RJ-Jaipur Prant': 'rajasthanJaipur',
  'RJ-Jaipur prant': 'rajasthanJaipur',
  'RJ-Jodhpur Prant': 'rajasthanJodhpur',
  'Rajasthan - RJ': 'rajasthanJaipur',
  'Sikkim Prant': 'sikkim',
  'TN-Dakshin Prant': 'tamilnaduDakshin',
  'TN-Uttar Prant': 'tamilnaduUttar',
  'Telangana Prant': 'telangana',
  'Tripura Prant': 'assam',
  'UP-Awadh Prant': 'upAvadh',
  'UP-Bruj Prant': 'upBraj',
  'UP-Goraksha Prant': 'upGoraksha',
  'UP-Kanpur Prant': 'upKanpur',
  'UP-Kashi Prant': 'upKashi',
  'UP-Meerut Prant': 'upMeerut',
  'Uttarakhand Prant': 'uttarakhand',
  'West Bengal Prant': 'biharUttar',
};

const STATE_CSV_ALIASES = {
  'Andaman Nicobar (UT)': 'Andaman and Nicobar Islands',
  'Chandigarh (UT)': 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu (UT)': 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (UT)': 'Delhi',
  'Jammu Kashmiri (UT)': 'Jammu and Kashmir',
  'Ladakh (UT)': 'Ladakh',
  'Lakshadweep (UT)': 'Lakshadweep',
  'Puducherry (UT)': 'Puducherry',
};

function normalizeStateName(stateRaw) {
  const trimmed = String(stateRaw || '').trim();
  return STATE_CSV_ALIASES[trimmed] || trimmed;
}

function normalizePrantFromCsv(prantRaw) {
  const trimmed = String(prantRaw || '').trim();
  if (!trimmed) return '';
  if (PRANT_CSV_ALIASES[trimmed]) return PRANT_CSV_ALIASES[trimmed];
  if (PRANT_NAME_TO_KEY[trimmed]) return PRANT_NAME_TO_KEY[trimmed];
  const withoutPrant = trimmed.replace(/\s+Prant$/i, '').trim();
  if (PRANT_CSV_ALIASES[`${withoutPrant} Prant`]) return PRANT_CSV_ALIASES[`${withoutPrant} Prant`];
  if (PRANT_NAME_TO_KEY[withoutPrant]) return PRANT_NAME_TO_KEY[withoutPrant];
  return '';
}

function parseDspLine(line) {
  const raw = String(line || '').trim();
  if (!raw) return null;

  if (raw.includes('Khairthal,Tijara')) {
    return { district: 'Khairthal-Tijara', state: 'Rajasthan', prantRaw: 'RJ-Jaipur Prant' };
  }
  if (raw.includes('South Salmara,Mankachar')) {
    return { district: 'South Salmara-Mankachar', state: 'Assam', prantRaw: 'Assam Prant' };
  }

  const parts = raw.split(' , ').map((s) => s.trim());
  if (parts.length < 3) return null;
  const prantRaw = parts.pop();
  const stateRaw = parts.pop();
  const district = parts.join(' , ').trim();
  if (!district || !stateRaw || !prantRaw) return null;
  return { district, state: stateRaw, prantRaw };
}

function buildMapFromDspCsv(csvPath) {
  const text = readFileSync(csvPath, 'utf8').trim();
  const lines = text.split(/\r?\n/).slice(1);
  const byStateDistrict = {};
  const districtsByState = {};
  const prantStateCounts = {};
  const statePrantCounts = {};
  const unknownPrants = new Set();

  for (const line of lines) {
    const parsed = parseDspLine(line);
    if (!parsed) continue;

    const state = normalizeStateName(parsed.state);
    const district = parsed.district.trim();
    const prant_key = normalizePrantFromCsv(parsed.prantRaw);
    if (!prant_key) {
      unknownPrants.add(parsed.prantRaw);
      continue;
    }

    byStateDistrict[`${state}|${district}`] = prant_key;
    if (!districtsByState[state]) districtsByState[state] = [];
    if (!districtsByState[state].includes(district)) districtsByState[state].push(district);

    if (!prantStateCounts[prant_key]) prantStateCounts[prant_key] = {};
    prantStateCounts[prant_key][state] = (prantStateCounts[prant_key][state] || 0) + 1;

    if (!statePrantCounts[state]) statePrantCounts[state] = {};
    statePrantCounts[state][prant_key] = (statePrantCounts[state][prant_key] || 0) + 1;
  }

  for (const state of Object.keys(districtsByState)) {
    districtsByState[state].sort((a, b) => a.localeCompare(b));
  }

  const stateDefault = {};
  for (const [state, counts] of Object.entries(statePrantCounts)) {
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top) stateDefault[state] = top[0];
  }

  const prantPrimaryState = {};
  for (const [prant, stateCounts] of Object.entries(prantStateCounts)) {
    const top = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0];
    if (top) prantPrimaryState[prant] = top[0];
  }

  if (unknownPrants.size > 0) {
    console.warn('Unknown prant labels (rows skipped):', [...unknownPrants].sort().join(', '));
  }

  return { stateDefault, byStateDistrict, prantPrimaryState, districtsByState };
}

function writeGeneratedMap(map) {
  const tsPath = join(ROOT, 'src/lib/stateDistrictPrantMap.generated.ts');
  writeFileSync(
    tsPath,
    `/** Auto-generated by backend/scripts/build-prant-mapping.cjs */\nexport const STATE_DISTRICT_PRANT_MAP = ${JSON.stringify(map, null, 2)} as const;\n`,
    'utf8'
  );
  console.log(`Wrote ${tsPath}`);
}

function buildMapFromCsv(csvPath) {
  const text = readFileSync(csvPath, 'utf8').trim();
  const lines = text.split(/\r?\n/);
  const header = parseCsvLine(lines[0]);
  const stateIdx = header.indexOf('state');
  const districtIdx = header.indexOf('district');
  const prantIdx = header.findIndex((h) => h === 'prant_name' || h === 'prant_key');

  if (stateIdx < 0 || districtIdx < 0 || prantIdx < 0) {
    throw new Error('CSV must have columns: state, district, prant_name');
  }

  const byStateDistrict = {};
  const stateDefault = { ...STATE_DEFAULT_PRANT };

  for (let i = 1; i < lines.length; i += 1) {
    if (!lines[i].trim()) continue;
    const cols = parseCsvLine(lines[i]);
    const state = cols[stateIdx].trim();
    const district = cols[districtIdx].trim();
    const prantRaw = cols[prantIdx].trim();
    const prant_key = prantNameToKey(prantRaw);
    byStateDistrict[`${state}|${district}`] = prant_key;
  }

  return { stateDefault, byStateDistrict, prantPrimaryState: PRANT_PRIMARY_STATE };
}

function loadDistricts() {
  const file = join(ROOT, 'src/lib/stateDistricts.ts');
  const text = readFileSync(file, 'utf8');
  const start = text.indexOf('{');
  const end = text.indexOf(';\n\nexport const STATE_NAMES');
  return JSON.parse(text.slice(start, end));
}

const BIHAR_DAKSHIN = new Set([
  'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Gaya', 'Jamui',
  'Jehanabad', 'Kaimur', 'Lakhisarai', 'Munger', 'Nalanda', 'Nawada', 'Patna', 'Rohtas', 'Sheikhpura',
]);

const MP_MALWA = new Set([
  'Agar Malwa', 'Barwani', 'Burhanpur', 'Dewas', 'Dhar', 'Indore', 'Jhabua', 'Khandwa', 'Khargone',
  'Mandsaur', 'Neemuch', 'Ratlam', 'Shajapur', 'Ujjain', 'Alirajpur',
]);

const MP_MAHAKAUSHAL = new Set([
  'Anuppur', 'Balaghat', 'Chhindwara', 'Dindori', 'Jabalpur', 'Katni', 'Maihar', 'Mandla', 'Narsinghpur',
  'Seoni', 'Shahdol', 'Sidhi', 'Singrauli', 'Umaria',
]);

const MH_KONKAN = new Set([
  'Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar', 'Raigad', 'Ratnagiri', 'Sindhudurg',
]);

const MH_MADHYA = new Set([
  'Pune', 'Satara', 'Sangli', 'Kolhapur', 'Solapur', 'Ahmednagar',
]);

const MH_DEVGIRI = new Set([
  'Chhatrapati Sambhajinagar', 'Beed', 'Latur', 'Dharashiv', 'Jalna', 'Nanded', 'Hingoli', 'Parbhani', 'Osmanabad',
].filter(Boolean));

const MH_VIDARBH = new Set([
  'Nagpur', 'Wardha', 'Bhandara', 'Gondia', 'Chandrapur', 'Gadchiroli', 'Amravati', 'Akola', 'Washim',
  'Buldhana', 'Yavatmal', 'Nandurbar', 'Dhule', 'Jalgaon', 'Nashik',
]);

const OD_PURBA = new Set([
  'Balasore', 'Bhadrak', 'Cuttack', 'Dhenkanal', 'Jagatsinghpur', 'Jajpur', 'Kendrapara', 'Khordha',
  'Mayurbhanj', 'Puri', 'Sundargarh', 'Kendujhar', 'Angul',
]);

const RJ_JAIPUR = new Set([
  'Jaipur', 'Jaipur Rural', 'Dausa', 'Sikar', 'Alwar', 'Bharatpur', 'Dholpur', 'Karauli', 'Dudu',
  'Kotputli Behror', 'Neem Ka Thana', 'Khairthal Tijara', 'Deeg',
]);

const RJ_JODHPUR = new Set([
  'Jodhpur', 'Jodhpur Rural', 'Barmer', 'Jaisalmer', 'Bikaner', 'Churu', 'Hanumangarh', 'Sri Ganganagar',
  'Phalodi', 'Sanchore', 'Anupgarh', 'Balotra',
]);

const TN_DAKSHIN = new Set([
  'Chennai', 'Chengalpattu', 'Kanchipuram', 'Tiruvallur', 'Vellore', 'Ranipet', 'Tirupathur', 'Kanniyakumari',
  'Thoothukudi', 'Tirunelveli', 'Tenkasi', 'Madurai', 'Theni', 'Dindigul', 'Virudhunagar', 'Ramanathapuram',
  'Sivaganga', 'Pudukkottai', 'Thanjavur', 'Mayiladuthurai', 'Nagapattinam', 'Tiruvarur',
]);

const UP_MEERUT = new Set([
  'Meerut', 'Ghaziabad', 'Gautam Buddha Nagar', 'Bulandshahr', 'Baghpat', 'Hapur', 'Muzaffarnagar',
  'Saharanpur', 'Shamli', 'Bijnor', 'Moradabad', 'Sambhal', 'Amroha', 'Rampur',
]);

const UP_BRAJ = new Set([
  'Agra', 'Mathura', 'Aligarh', 'Hathras', 'Firozabad', 'Etah', 'Kasganj', 'Mainpuri', 'Firozabad',
]);

const UP_KANPUR = new Set([
  'Kanpur Nagar', 'Kanpur Dehat', 'Etawah', 'Farrukhabad', 'Kannauj', 'Auraiya', 'Jalaun', 'Hamirpur',
]);

const UP_KASHI = new Set([
  'Varanasi', 'Mirzapur', 'Sonbhadra', 'Bhadohi', 'Chandauli', 'Ghazipur', 'Ballia', 'Jaunpur',
]);

const UP_GORAKSHA = new Set([
  'Gorakhpur', 'Kushinagar', 'Deoria', 'Maharajganj', 'Siddharthnagar', 'Basti', 'Sant Kabir Nagar',
]);

const UP_AVADH = new Set([
  'Lucknow', 'Ayodhya', 'Barabanki', 'Sultanpur', 'Amethi', 'Rae Bareli', 'Pratapgarh', 'Fatehpur',
  'Kaushambi', 'Prayagraj', 'Unnao', 'Hardoi', 'Sitapur', 'Lakhimpur Kheri', 'Bahraich', 'Shravasti',
  'Gonda', 'Balrampur', 'Ambedkar Nagar', 'Azamgarh', 'Mau', 'Banda', 'Chitrakoot', 'Mahoba', 'Lalitpur',
  'Jhansi', 'Pilibhit', 'Bareilly', 'Shahjahanpur', 'Kheri',
]);

const STATE_DEFAULT_PRANT = {
  'Andhra Pradesh': 'andhra',
  'Arunachal Pradesh': 'arunachal',
  Assam: 'assam',
  Bihar: 'biharUttar',
  Chhattisgarh: 'chattisgarh',
  Goa: 'maharashtraKonkan',
  Gujarat: 'gujarat',
  Haryana: 'haryana',
  'Himachal Pradesh': 'himachal',
  Jharkhand: 'jharkhand',
  Karnataka: 'karnataka',
  Kerala: 'kerala',
  'Madhya Pradesh': 'mpMadhyabharat',
  Maharashtra: 'madhyaMaharashtra',
  Manipur: 'assam',
  Meghalaya: 'meghalaya',
  Mizoram: 'assam',
  Nagaland: 'assam',
  Odisha: 'odishaPurba',
  Punjab: 'punjab',
  Rajasthan: 'rajasthanJaipur',
  Sikkim: 'sikkim',
  'Tamil Nadu': 'tamilnaduUttar',
  Telangana: 'telangana',
  Tripura: 'assam',
  'Uttar Pradesh': 'upAvadh',
  Uttarakhand: 'uttarakhand',
  'West Bengal': 'biharUttar',
  'Andaman and Nicobar Islands': 'andhra',
  Chandigarh: 'punjab',
  'Dadra and Nagar Haveli and Daman and Diu': 'gujarat',
  Delhi: 'delhi',
  'Jammu and Kashmir': 'jammuKashmir',
  Ladakh: 'jammuKashmir',
  Lakshadweep: 'kerala',
  Puducherry: 'tamilnaduDakshin',
};

const PRANT_PRIMARY_STATE = {
  andhra: 'Andhra Pradesh',
  arunachal: 'Arunachal Pradesh',
  assam: 'Assam',
  biharDakshin: 'Bihar',
  biharUttar: 'Bihar',
  chattisgarh: 'Chhattisgarh',
  delhi: 'Delhi',
  gujarat: 'Gujarat',
  haryana: 'Haryana',
  himachal: 'Himachal Pradesh',
  jammuKashmir: 'Jammu and Kashmir',
  jharkhand: 'Jharkhand',
  karnataka: 'Karnataka',
  kerala: 'Kerala',
  mpMadhyabharat: 'Madhya Pradesh',
  mpMahakaushal: 'Madhya Pradesh',
  mpMalwa: 'Madhya Pradesh',
  maharashtraDevgiri: 'Maharashtra',
  maharashtraKonkan: 'Maharashtra',
  madhyaMaharashtra: 'Maharashtra',
  maharashtraVidharbh: 'Maharashtra',
  meghalaya: 'Meghalaya',
  odishaPashchim: 'Odisha',
  odishaPurba: 'Odisha',
  punjab: 'Punjab',
  rajasthanChittor: 'Rajasthan',
  rajasthanJaipur: 'Rajasthan',
  rajasthanJodhpur: 'Rajasthan',
  sikkim: 'Sikkim',
  tamilnaduDakshin: 'Tamil Nadu',
  tamilnaduUttar: 'Tamil Nadu',
  telangana: 'Telangana',
  upAvadh: 'Uttar Pradesh',
  upBraj: 'Uttar Pradesh',
  upGoraksha: 'Uttar Pradesh',
  upKanpur: 'Uttar Pradesh',
  upKashi: 'Uttar Pradesh',
  upMeerut: 'Uttar Pradesh',
  uttarakhand: 'Uttarakhand',
};

function resolvePrant(state, district) {
  const d = district || '';

  if (state === 'Bihar' && BIHAR_DAKSHIN.has(d)) return 'biharDakshin';
  if (state === 'Madhya Pradesh') {
    if (MP_MALWA.has(d)) return 'mpMalwa';
    if (MP_MAHAKAUSHAL.has(d)) return 'mpMahakaushal';
    return 'mpMadhyabharat';
  }
  if (state === 'Maharashtra') {
    if (MH_KONKAN.has(d)) return 'maharashtraKonkan';
    if (MH_MADHYA.has(d)) return 'madhyaMaharashtra';
    if (MH_DEVGIRI.has(d)) return 'maharashtraDevgiri';
    if (MH_VIDARBH.has(d)) return 'maharashtraVidharbh';
    return 'madhyaMaharashtra';
  }
  if (state === 'Odisha') {
    return OD_PURBA.has(d) ? 'odishaPurba' : 'odishaPashchim';
  }
  if (state === 'Rajasthan') {
    if (RJ_JODHPUR.has(d)) return 'rajasthanJodhpur';
    if (RJ_JAIPUR.has(d)) return 'rajasthanJaipur';
    return 'rajasthanChittor';
  }
  if (state === 'Tamil Nadu') {
    return TN_DAKSHIN.has(d) ? 'tamilnaduDakshin' : 'tamilnaduUttar';
  }
  if (state === 'Uttar Pradesh') {
    if (UP_MEERUT.has(d)) return 'upMeerut';
    if (UP_BRAJ.has(d)) return 'upBraj';
    if (UP_KANPUR.has(d)) return 'upKanpur';
    if (UP_KASHI.has(d)) return 'upKashi';
    if (UP_GORAKSHA.has(d)) return 'upGoraksha';
    if (UP_AVADH.has(d)) return 'upAvadh';
    return 'upAvadh';
  }

  return STATE_DEFAULT_PRANT[state] || 'andhra';
}

const dataDir = join(ROOT, 'src/data');
mkdirSync(dataDir, { recursive: true });
const csvPath = join(dataDir, 'state-district-prant.csv');
const dspCsvPath = join(dataDir, 'dsp-list.csv');

if (FROM_DSP) {
  const map = buildMapFromDspCsv(dspCsvPath);
  writeGeneratedMap(map);
  console.log(
    `Updated map from ${dspCsvPath} (${Object.keys(map.byStateDistrict).length} district rows)`
  );
  process.exit(0);
}

if (FROM_CSV) {
  const map = buildMapFromCsv(csvPath);
  writeGeneratedMap(map);
  console.log(`Updated map from ${csvPath}`);
  process.exit(0);
}

const D = loadDistricts();
const rows = [];
const byStateDistrict = {};
const stateDefault = { ...STATE_DEFAULT_PRANT };

for (const [state, districts] of Object.entries(D)) {
  for (const district of districts) {
    const prant_key = resolvePrant(state, district);
    rows.push({ state, district, prant_key });
    byStateDistrict[`${state}|${district}`] = prant_key;
  }
}

rows.sort((a, b) => a.state.localeCompare(b.state) || a.district.localeCompare(b.district));

const csvLines = [
  'state,district,prant_name',
  ...rows.map((r) =>
    `${csvEscape(r.state)},${csvEscape(r.district)},${csvEscape(prantKeyToName(r.prant_key))}`
  ),
];

writeFileSync(csvPath, `${csvLines.join('\n')}\n`, 'utf8');

const map = { stateDefault, byStateDistrict, prantPrimaryState: PRANT_PRIMARY_STATE };
writeGeneratedMap(map);

console.log(`Wrote ${csvPath} (${rows.length} rows, column prant_name)`);
