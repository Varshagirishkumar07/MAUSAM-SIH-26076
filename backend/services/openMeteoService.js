/**
 * MAUSAM Backend - Open-Meteo Weather Service
 * Module 3.2: Connect Real Weather API (Open-Meteo)
 * 
 * Fetches real weather forecast data from the public Open-Meteo API.
 * - Enforces timeout (default 8s) via AbortController.
 * - Uses timezone=auto so returned timestamps correspond to location local time.
 * - Normalizes data into clean MAUSAM schema matching selected date/time.
 * - Missing values are set to null (never simulated or faked).
 * - Integrates with safe in-memory cache.
 */

import config from '../config/index.js';
import { weatherCache } from '../utils/weatherCache.js';
import { getWeatherConditionDescription } from '../utils/weatherCodes.js';

const REQUIRED_HOURLY_VARS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation_probability',
  'precipitation',
  'rain',
  'weather_code',
  'wind_speed_10m',
  'wind_gusts_10m',
  'uv_index'
].join(',');

/**
 * Fetch raw hourly forecast from Open-Meteo or in-memory cache for a given date
 * @param {Object} params
 * @param {number} params.latitude
 * @param {number} params.longitude
 * @param {string} params.date - YYYY-MM-DD
 * @returns {Promise<{ rawData: Object, fetchedAt: string }>}
 */
export async function fetchRawHourlyForDate({ latitude, longitude, date }) {
  const cacheKey = weatherCache.generateKey(latitude, longitude, date);
  const cachedEntry = weatherCache.get(cacheKey);

  if (cachedEntry) {
    return {
      rawData: cachedEntry.rawData,
      fetchedAt: cachedEntry.fetchedAt
    };
  }

  // Build query URL
  const url = new URL(`${config.openMeteo.baseUrl}/forecast`);
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('hourly', REQUIRED_HOURLY_VARS);
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('wind_speed_unit', 'kmh');
  url.searchParams.set('precipitation_unit', 'mm');
  url.searchParams.set('start_date', date);
  url.searchParams.set('end_date', date);

  // Timeout mechanism
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.openMeteo.timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MAUSAM-SIH-26076/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      const error = new Error(`Open-Meteo returned HTTP ${response.status}`);
      error.code = 'UPSTREAM_ERROR';
      error.status = response.status;
      error.details = errorBody;
      throw error;
    }

    const rawData = await response.json();
    const fetchedAt = new Date().toISOString();

    // Store in cache
    weatherCache.set(cacheKey, rawData, fetchedAt);

    return { rawData, fetchedAt };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError' || err.code === 'ABORT_ERR') {
      const timeoutErr = new Error('Weather service request timed out');
      timeoutErr.code = 'TIMEOUT';
      throw timeoutErr;
    }

    if (!err.code) {
      err.code = 'NETWORK_ERROR';
    }
    throw err;
  }
}

/**
 * Extracts a normalized weather object from hourly records at a specific index
 * @param {Object} hourly
 * @param {number} index
 * @returns {Object}
 */
export function extractWeatherFromHourlyIndex(hourly, index) {
  const numOrNull = (val) => (typeof val === 'number' && !Number.isNaN(val) ? val : null);
  const weatherCode = numOrNull(hourly.weather_code?.[index]);

  return {
    temperature: numOrNull(hourly.temperature_2m?.[index]),
    feelsLike: numOrNull(hourly.apparent_temperature?.[index]),
    humidity: numOrNull(hourly.relative_humidity_2m?.[index]),
    precipitationProbability: numOrNull(hourly.precipitation_probability?.[index]),
    precipitation: numOrNull(hourly.precipitation?.[index]),
    rain: numOrNull(hourly.rain?.[index]),
    windSpeed: numOrNull(hourly.wind_speed_10m?.[index]),
    windGusts: numOrNull(hourly.wind_gusts_10m?.[index]),
    weatherCode,
    condition: getWeatherConditionDescription(weatherCode),
    uvIndex: numOrNull(hourly.uv_index?.[index])
  };
}

/**
 * Fetch and normalize weather data from Open-Meteo
 * @param {Object} params
 * @param {number} params.latitude
 * @param {number} params.longitude
 * @param {string} params.date - YYYY-MM-DD
 * @param {string} params.time - HH:mm
 * @returns {Promise<Object>} Normalized MAUSAM weather response
 */
export async function fetchWeatherForecast({ latitude, longitude, date, time }) {
  const { rawData, fetchedAt } = await fetchRawHourlyForDate({ latitude, longitude, date });

  // Validate that hourly data exists
  if (!rawData || !rawData.hourly || !Array.isArray(rawData.hourly.time) || rawData.hourly.time.length === 0) {
    const notFoundErr = new Error('Invalid or empty weather forecast response');
    notFoundErr.code = 'INVALID_RESPONSE';
    throw notFoundErr;
  }

  // Match the closest hourly entry to the user's selected date and time
  const matchResult = matchHourlyRecord(rawData.hourly, date, time);
  if (!matchResult) {
    const notFoundErr = new Error(`No forecast data found for ${date} at ${time}`);
    notFoundErr.code = 'NOT_FOUND';
    throw notFoundErr;
  }

  const { index, matchedTime } = matchResult;
  const weather = extractWeatherFromHourlyIndex(rawData.hourly, index);

  // Extract 6-slot hourly window surrounding planned time (-2h, -1h, planned, +1h, +2h, +3h)
  const windowOffsets = [
    { offset: -2, label: '-2h Slot', defaultLabel: 'Earlier' },
    { offset: -1, label: '-1h Slot', defaultLabel: '1h Before' },
    { offset: 0, label: 'Planned Time', defaultLabel: 'Planned Time' },
    { offset: 1, label: '+1h Slot', defaultLabel: '1h After' },
    { offset: 2, label: '+2h Slot', defaultLabel: '2h After' },
    { offset: 3, label: '+3h Slot', defaultLabel: '3h After' }
  ];

  const hourlyWindow = windowOffsets.map(({ offset, label, defaultLabel }) => {
    const targetIdx = index + offset;
    const isPlanned = (offset === 0);

    if (targetIdx >= 0 && targetIdx < rawData.hourly.time.length) {
      const slotWeather = extractWeatherFromHourlyIndex(rawData.hourly, targetIdx);
      const isoTime = rawData.hourly.time[targetIdx];
      const timePart = isoTime ? isoTime.split('T')[1] : null;

      return {
        offset,
        label,
        defaultLabel,
        isPlanned,
        time: timePart,
        isoTime,
        temperature: slotWeather.temperature,
        feelsLike: slotWeather.feelsLike,
        precipitationProbability: slotWeather.precipitationProbability,
        weatherCode: slotWeather.weatherCode,
        condition: slotWeather.condition,
        windSpeed: slotWeather.windSpeed
      };
    }

    return {
      offset,
      label,
      defaultLabel,
      isPlanned,
      time: null,
      isoTime: null,
      temperature: null,
      feelsLike: null,
      precipitationProbability: null,
      weatherCode: null,
      condition: null,
      windSpeed: null
    };
  });

  return {
    success: true,
    source: 'Open-Meteo',
    fetchedAt,
    location: {
      latitude: Number(latitude),
      longitude: Number(longitude)
    },
    date,
    time,
    matchedTime,
    weather,
    hourlyWindow
  };
}

/**
 * Finds the index of the hourly record closest to the target date and time.
 * @param {Object} hourly - Open-Meteo hourly object
 * @param {string} date - YYYY-MM-DD
 * @param {string} time - HH:mm
 * @returns {{ index: number, matchedTime: string }|null}
 */
export function matchHourlyRecord(hourly, date, time) {
  if (!hourly || !Array.isArray(hourly.time)) return null;

  const targetPrefix = `${date}T`;
  const [targetH, targetM] = time.split(':').map(Number);
  const targetTotalMinutes = targetH * 60 + (targetM || 0);

  let bestIndex = -1;
  let minDifference = Infinity;

  for (let i = 0; i < hourly.time.length; i++) {
    const tStr = hourly.time[i]; // e.g. "2026-10-01T17:00"
    if (!tStr.startsWith(targetPrefix)) continue;

    const timePart = tStr.split('T')[1]; // "17:00"
    if (!timePart) continue;

    const [h, m] = timePart.split(':').map(Number);
    const totalMinutes = h * 60 + (m || 0);
    const diff = Math.abs(totalMinutes - targetTotalMinutes);

    if (diff < minDifference) {
      minDifference = diff;
      bestIndex = i;
    }
  }

  if (bestIndex === -1) {
    // If start_date was not passed or day differs, try any entry matching date
    for (let i = 0; i < hourly.time.length; i++) {
      if (hourly.time[i].startsWith(targetPrefix)) {
        return { index: i, matchedTime: hourly.time[i] };
      }
    }
    return null;
  }

  return {
    index: bestIndex,
    matchedTime: hourly.time[bestIndex]
  };
}

export default {
  fetchWeatherForecast,
  matchHourlyRecord
};
