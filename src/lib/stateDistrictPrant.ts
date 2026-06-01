import { PRANT_KEYS, type PrantKey } from './prantKeys';
import { STATE_DISTRICT_PRANT_MAP } from './stateDistrictPrantMap.generated';

const { stateDefault, byStateDistrict, prantPrimaryState, districtsByState } = STATE_DISTRICT_PRANT_MAP;

function buildMultiPrantStates(): Set<string> {
  const prantsPerState = new Map<string, Set<string>>();
  for (const key of Object.keys(byStateDistrict)) {
    const pipe = key.indexOf('|');
    if (pipe < 0) continue;
    const state = key.slice(0, pipe);
    const prant = byStateDistrict[key as keyof typeof byStateDistrict];
    if (!prant) continue;
    if (!prantsPerState.has(state)) prantsPerState.set(state, new Set());
    prantsPerState.get(state)?.add(String(prant));
  }
  return new Set(
    [...prantsPerState.entries()].filter(([, prants]) => prants.size > 1).map(([state]) => state)
  );
}

/** States with multiple prants — derived from DSP / CSV mapping */
export const MULTI_PRANT_STATES = buildMultiPrantStates();

/** District list for a state from DSP mapping (empty if not in map) */
export function getDistrictsForStateFromMap(state: string): string[] {
  if (!state || !districtsByState) return [];
  const list = districtsByState[state as keyof typeof districtsByState];
  return list ? [...list] : [];
}

/** All states present in the DSP mapping */
export function getStatesFromDspMap(): string[] {
  if (!districtsByState) return [];
  return Object.keys(districtsByState).sort((a, b) => a.localeCompare(b));
}

export function isMultiPrantState(state: string): boolean {
  return MULTI_PRANT_STATES.has(state);
}

/** State has exactly one prant — safe to auto-sync state ↔ prant */
export function shouldAutoSelectPrantForState(state: string): boolean {
  return Boolean(state) && !isMultiPrantState(state);
}

/** Prant → state: only when that prant’s home state has a single prant */
export function shouldAutoSelectStateForPrant(prant: string): boolean {
  if (!prant) return false;
  const homeState = getPrimaryStateForPrant(prant);
  return shouldAutoSelectPrantForState(homeState);
}

/** Default prant for a state (state-level only, ignores district) */
export function getPrantForState(state: string): PrantKey | '' {
  if (!state) return '';
  const fallback = stateDefault[state as keyof typeof stateDefault];
  return (fallback as PrantKey) || '';
}

/** If the state maps to exactly one prant, return it */
export function getSinglePrantForState(
  state: string,
  allDistrictsInState: string[]
): PrantKey | '' {
  const options = getPrantOptionsForState(state, allDistrictsInState);
  return options.length === 1 ? options[0] : '';
}

export function getPrantForStateDistrict(state: string, district: string): PrantKey | '' {
  if (!state) return '';
  if (district) {
    const key = `${state}|${district}`;
    const prant = byStateDistrict[key as keyof typeof byStateDistrict];
    if (prant) return prant as PrantKey;
  }
  const fallback = stateDefault[state as keyof typeof stateDefault];
  return (fallback as PrantKey) || '';
}

export function getPrimaryStateForPrant(prant: string): string {
  if (!prant) return '';
  return prantPrimaryState[prant as keyof typeof prantPrimaryState] || '';
}

/** Districts in a state that belong to the given prant */
export function getDistrictsForStateAndPrant(
  state: string,
  prant: string,
  allDistrictsInState: string[]
): string[] {
  if (!state || !prant) return allDistrictsInState;
  return allDistrictsInState.filter(
    (d) => getPrantForStateDistrict(state, d) === prant
  );
}

/** Prants that have at least one district in this state */
export function getPrantOptionsForState(
  state: string,
  allDistrictsInState: string[]
): PrantKey[] {
  if (!state) return [...PRANT_KEYS];
  const set = new Set<PrantKey>();
  for (const d of allDistrictsInState) {
    const p = getPrantForStateDistrict(state, d);
    if (p) set.add(p);
  }
  return PRANT_KEYS.filter((k) => set.has(k));
}
