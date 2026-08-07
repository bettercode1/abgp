/** English display names for prant keys (CSV export, reports). */
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

function prantKeyToDisplayName(key) {
  if (!key) return 'Unknown';
  return PRANT_DISPLAY_NAMES[key] || key;
}

module.exports = { PRANT_DISPLAY_NAMES, prantKeyToDisplayName };
