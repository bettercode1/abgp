const { PRANT_DISPLAY_NAMES } = require('./prantDisplayNames');
const { PRANT_KEYS } = require('./prantKeys');

const PRANT_NAME_TO_KEY = Object.fromEntries(
  Object.entries(PRANT_DISPLAY_NAMES).map(([key, name]) => [name.toLowerCase(), key])
);

const PRANT_KEY_LOOKUP = Object.fromEntries(PRANT_KEYS.map((key) => [key.toLowerCase(), key]));

/** Legacy / CSV labels → canonical prant key. */
const PRANT_ALIASES = {
  '- punjab prant': 'punjab',
  'andaman nicobar prant': 'andhra',
  'andhra pradesh prant': 'andhra',
  'arunachal pradesh prant': 'arunachal',
  'assam - assam prant': 'assam',
  'assam prant': 'assam',
  'br-dakshin prant': 'biharDakshin',
  'br-uttar prant': 'biharUttar',
  chhattisgarh: 'chattisgarh',
  'chhattisgarh prant': 'chattisgarh',
  'dadra nagar haveli prant': 'gujarat',
  'delhi prant': 'delhi',
  'goa prant': 'maharashtraKonkan',
  'gujarat prant': 'gujarat',
  'haryana prant': 'haryana',
  'himachal prant': 'himachal',
  'jammu kashmir pran': 'jammuKashmir',
  'jammu kashmir prant': 'jammuKashmir',
  'jammu kashmir prant - jammu kashmir prant': 'jammuKashmir',
  'jharkhand prant': 'jharkhand',
  'karnataka prant': 'karnataka',
  'kerala prant': 'kerala',
  'ladakh prant': 'jammuKashmir',
  'lakshadweep prant': 'kerala',
  'mh-devgiri prant': 'maharashtraDevgiri',
  'mh-konkan prant': 'maharashtraKonkan',
  'mh-madhya maharashtra prant': 'madhyaMaharashtra',
  'mh-vidharbh prant': 'maharashtraVidharbh',
  'mp-madhya bharat prant': 'mpMadhyabharat',
  'mp-mahakaushal prant': 'mpMahakaushal',
  'mp-malwa prant': 'mpMalwa',
  'manipur prant': 'assam',
  'meghalaya prant': 'meghalaya',
  'mizoram prant': 'assam',
  'nagaland prant': 'assam',
  'od-pashchim prant': 'odishaPashchim',
  'od-purba prant': 'odishaPurba',
  panjab: 'punjab',
  'panjab prant': 'punjab',
  'puducherry prant': 'tamilnaduDakshin',
  'punjab prant': 'punjab',
  'rj-chittor prant': 'rajasthanChittor',
  'rj-jaipur prant': 'rajasthanJaipur',
  'rj-jodhpur prant': 'rajasthanJodhpur',
  'rajasthan - rj': 'rajasthanJaipur',
  'sikkim prant': 'sikkim',
  'tn-dakshin prant': 'tamilnaduDakshin',
  'tn-uttar prant': 'tamilnaduUttar',
  'telangana prant': 'telangana',
  'tripura prant': 'assam',
  'up-awadh prant': 'upAvadh',
  'up-bruj prant': 'upBraj',
  'up-goraksha prant': 'upGoraksha',
  'up-kanpur prant': 'upKanpur',
  'up-kashi prant': 'upKashi',
  'up-meerut prant': 'upMeerut',
  'uttarakhand prant': 'uttarakhand',
  'west bengal prant': 'biharUttar',
};

/**
 * Normalize a stored prant value to a canonical key, or "unknown".
 * @param {string | null | undefined} raw
 * @returns {string}
 */
function normalizePrantKey(raw) {
  let value = String(raw || '').trim();
  if (!value) return 'unknown';

  if (value.toLowerCase().startsWith('prant-')) {
    value = value.slice(6).trim();
  }

  const lower = value.toLowerCase();
  if (lower === 'unknown') return 'unknown';

  if (PRANT_ALIASES[lower]) return PRANT_ALIASES[lower];
  if (PRANT_KEY_LOOKUP[lower]) return PRANT_KEY_LOOKUP[lower];
  if (PRANT_NAME_TO_KEY[lower]) return PRANT_NAME_TO_KEY[lower];

  const withoutPrantSuffix = lower.replace(/\s+prant$/i, '').trim();
  if (PRANT_ALIASES[`${withoutPrantSuffix} prant`]) return PRANT_ALIASES[`${withoutPrantSuffix} prant`];
  if (PRANT_NAME_TO_KEY[withoutPrantSuffix]) return PRANT_NAME_TO_KEY[withoutPrantSuffix];
  if (PRANT_KEY_LOOKUP[withoutPrantSuffix]) return PRANT_KEY_LOOKUP[withoutPrantSuffix];

  return 'unknown';
}

/**
 * Aggregate payment rows by normalized prant key.
 * @param {Array<Record<string, unknown>>} rows
 */
function aggregatePaymentsByPrant(rows) {
  /** @type {Map<string, { count: number, success_count: number, success_amount_paise: number, rows: Array<Record<string, unknown>> }>} */
  const byPrant = new Map();

  for (const row of rows) {
    const key = normalizePrantKey(row.prant);
    if (!byPrant.has(key)) {
      byPrant.set(key, { count: 0, success_count: 0, success_amount_paise: 0, rows: [] });
    }
    const bucket = byPrant.get(key);
    bucket.count += 1;
    bucket.rows.push(row);
    if (String(row.payment_status || '').toUpperCase() === 'SUCCESS') {
      bucket.success_count += 1;
      bucket.success_amount_paise += Number(row.amount) || 0;
    }
  }

  return byPrant;
}

module.exports = { normalizePrantKey, aggregatePaymentsByPrant };
