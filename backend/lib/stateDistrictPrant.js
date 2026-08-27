const fs = require('fs');
const path = require('path');

let cachedMap = null;

function loadMap() {
  if (cachedMap) return cachedMap;
  const filePath = path.join(__dirname, 'stateDistrictPrantMap.json');
  cachedMap = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return cachedMap;
}

/** @param {string} state @param {string} district @returns {string} */
function getPrantForStateDistrict(state, district) {
  const trimmedState = String(state || '').trim();
  const trimmedDistrict = String(district || '').trim();
  if (!trimmedState) return '';

  const { byStateDistrict, stateDefault } = loadMap();
  if (trimmedDistrict) {
    const key = `${trimmedState}|${trimmedDistrict}`;
    if (byStateDistrict[key]) return byStateDistrict[key];
  }
  return stateDefault[trimmedState] || '';
}

module.exports = { getPrantForStateDistrict };
