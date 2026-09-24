/**
 * Kshetra WhatsApp invite links for the membership welcome email.
 * Hierarchy: ABGP क्षेत्र → प्रांत chart. Prant decides the group.
 * West Bengal is stored as the Bihar (Uttar) prant, so that state is matched first.
 */
const { normalizePrantKey } = require('../lib/prantNormalize');
const { getPrantForStateDistrict } = require('../lib/stateDistrictPrant');

const WHATSAPP_GROUPS = {
  dakshin: {
    name: 'Dakshin Kshetra',
    url: 'https://chat.whatsapp.com/G3EkpuiXs9KLubLReqDXNh?s=cl&p=a&mlu=4',
  },
  dakshinMadhya: {
    name: 'Dakshin Madhya Kshetra',
    url: 'https://chat.whatsapp.com/GpUq2iX0nnj4HB8VVM8AHh?s=sh&p=a&mlu=4',
  },
  paschim: {
    name: 'Paschim Kshetra',
    url: 'https://chat.whatsapp.com/JOnKZDfziYrDdTVCPe6d4a?s=cl&p=a&mlu=4',
  },
  madhya: {
    name: 'Madhya Kshetra',
    url: 'https://chat.whatsapp.com/JFIVTuFsyU9JVZusyOTp6X?s=cl&p=a&mlu=4',
  },
  uttarPaschim: {
    name: 'Uttar Paschim Kshetra',
    url: 'https://chat.whatsapp.com/HRy7U9LrcTx9zjyGNNHvZy?s=cl&p=a&mlu=4',
  },
  uttar: {
    name: 'Uttar Kshetra',
    url: 'https://chat.whatsapp.com/J3Hrat8KmTe2iGEAMzRpiB?s=cl&p=a&mlu=4',
  },
  paschimiUp: {
    name: 'Paschimi Uttar Pradesh',
    url: 'https://chat.whatsapp.com/CCb73UpsMwQCKOZPwZZFMj?s=cl&p=a&mlu=4',
  },
  purviUp: {
    name: 'Purvi Uttar Pradesh',
    url: 'https://chat.whatsapp.com/DJLpPVgfSpL2rUhtLV5L86?s=cl&p=a&mlu=4',
  },
  uttarPurva: {
    name: 'Uttar Purva Kshetra',
    url: 'https://chat.whatsapp.com/JeNNxl2bMzU2hX6LdWMjMi?s=sh&p=a&mlu=4',
  },
  purva: {
    name: 'Purva Kshetra',
    url: 'https://chat.whatsapp.com/CoeWPqqFj0IJiVrKmgkMcI?s=sh&p=a&mlu=4',
  },
};

/** Canonical prant key → kshetra group. Saurashtra districts are stored as gujarat. */
const PRANT_TO_GROUP = {
  kerala: 'dakshin',
  tamilnaduUttar: 'dakshin',
  tamilnaduDakshin: 'dakshin',

  karnataka: 'dakshinMadhya',
  andhra: 'dakshinMadhya',
  telangana: 'dakshinMadhya',

  maharashtraKonkan: 'paschim',
  madhyaMaharashtra: 'paschim',
  maharashtraDevgiri: 'paschim',
  maharashtraVidharbh: 'paschim',

  mpMalwa: 'madhya',
  mpMadhyabharat: 'madhya',
  mpMahakaushal: 'madhya',
  chattisgarh: 'madhya',

  gujarat: 'uttarPaschim',
  rajasthanChittor: 'uttarPaschim',
  rajasthanJaipur: 'uttarPaschim',
  rajasthanJodhpur: 'uttarPaschim',

  delhi: 'uttar',
  haryana: 'uttar',
  himachal: 'uttar',
  punjab: 'uttar',
  jammuKashmir: 'uttar',

  uttarakhand: 'paschimiUp',
  upMeerut: 'paschimiUp',
  upBraj: 'paschimiUp',

  upAvadh: 'purviUp',
  upKanpur: 'purviUp',
  upGoraksha: 'purviUp',
  upKashi: 'purviUp',

  biharUttar: 'uttarPurva',
  biharDakshin: 'uttarPurva',
  jharkhand: 'uttarPurva',

  odishaPurba: 'purva',
  odishaPashchim: 'purva',
  assam: 'purva',
  arunachal: 'purva',
  meghalaya: 'purva',
  sikkim: 'purva',
};

/** States whose stored prant would pick the wrong kshetra. */
const STATE_GROUP_OVERRIDE = {
  'west bengal': 'purva',
  bengal: 'purva',
};

function normalizeState(state) {
  return String(state || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * @param {{ state?: string, district?: string, prant?: string }} payment
 * @returns {{ name: string, url: string } | null}
 */
function resolveWhatsappGroup(payment) {
  const overrideId = STATE_GROUP_OVERRIDE[normalizeState(payment?.state)];
  if (overrideId && WHATSAPP_GROUPS[overrideId]) {
    return WHATSAPP_GROUPS[overrideId];
  }

  let prantKey = normalizePrantKey(payment?.prant);
  if (prantKey === 'unknown') {
    prantKey = normalizePrantKey(getPrantForStateDistrict(payment?.state, payment?.district));
  }

  const groupId = PRANT_TO_GROUP[prantKey];
  return groupId ? WHATSAPP_GROUPS[groupId] : null;
}

module.exports = {
  WHATSAPP_GROUPS,
  PRANT_TO_GROUP,
  resolveWhatsappGroup,
};
