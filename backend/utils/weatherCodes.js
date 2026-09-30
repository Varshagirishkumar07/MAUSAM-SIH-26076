/**
 * MAUSAM Backend - WMO Weather Code Mapping
 * Module 3.2: Connect Real Weather API (Open-Meteo)
 * 
 * Reusable utility for display purposes only.
 * Maps standard WMO weather codes to human-readable condition descriptions.
 * NOTE: Strictly for UI display. Does NOT make any safety or recommendation decisions.
 */

const WMO_CODE_MAP = Object.freeze({
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
});

/**
 * Returns a human-friendly weather condition description for display only.
 * @param {number|null} code - WMO weather code
 * @returns {string} Condition text (e.g. "Clear sky", "Partly cloudy")
 */
export function getWeatherConditionDescription(code) {
  if (code === null || code === undefined || typeof code !== 'number') {
    return 'Unknown condition';
  }
  return WMO_CODE_MAP[code] || `Weather condition (Code ${code})`;
}

export default WMO_CODE_MAP;
