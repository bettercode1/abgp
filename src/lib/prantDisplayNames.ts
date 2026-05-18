import type { PrantKey } from './prantKeys';

/** English display names for CSV export and name → key lookup */
export const PRANT_DISPLAY_NAMES: Record<PrantKey, string> = {
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

export const PRANT_NAME_TO_KEY: Record<string, PrantKey> = Object.fromEntries(
  Object.entries(PRANT_DISPLAY_NAMES).map(([key, name]) => [name, key as PrantKey])
) as Record<string, PrantKey>;

export function prantKeyToDisplayName(key: string): string {
  return PRANT_DISPLAY_NAMES[key as PrantKey] ?? key;
}

export function prantDisplayNameToKey(name: string): string {
  const trimmed = name.trim();
  return PRANT_NAME_TO_KEY[trimmed] ?? trimmed;
}
