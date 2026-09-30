/**
 * MAUSAM Backend - Weather Controller
 * Module 3.2: Connect Real Weather API (Open-Meteo)
 * 
 * Validates input query parameters (latitude, longitude, date, time),
 * communicates with Open-Meteo via openMeteoService,
 * and returns normalized real weather forecast data.
 * Zero fake weather data is created or returned.
 */

import { fetchWeatherForecast } from '../services/openMeteoService.js';

/**
 * Validates a date string in YYYY-MM-DD format
 * @param {string} dateStr
 * @returns {boolean}
 */
function isValidDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

/**
 * Validates a time string in HH:mm (24-hour) format
 * @param {string} timeStr
 * @returns {boolean}
 */
function isValidTime(timeStr) {
  if (typeof timeStr !== 'string') return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr.trim());
}

/**
 * GET /api/weather
 * Query Parameters:
 *   - latitude: number (-90 to 90)
 *   - longitude: number (-180 to 180)
 *   - date: YYYY-MM-DD
 *   - time: HH:mm
 */
export async function getWeather(req, res, next) {
  try {
    const { latitude, longitude, date, time } = req.query;

    // 1. Validate latitude and longitude presence
    if (latitude === undefined || latitude === null || latitude === '' ||
        longitude === undefined || longitude === null || longitude === '') {
      return res.status(400).json({
        error: true,
        message: 'Valid latitude and longitude are required'
      });
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      return res.status(400).json({
        error: true,
        message: 'Latitude must be a valid number between -90 and 90'
      });
    }

    if (Number.isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      return res.status(400).json({
        error: true,
        message: 'Longitude must be a valid number between -180 and 180'
      });
    }

    // 2. Validate date
    if (!date || typeof date !== 'string' || date.trim() === '') {
      return res.status(400).json({
        error: true,
        message: 'Date is required (format: YYYY-MM-DD)'
      });
    }

    const cleanDate = date.trim();
    if (!isValidDate(cleanDate)) {
      return res.status(400).json({
        error: true,
        message: 'Date must use YYYY-MM-DD format'
      });
    }

    // 3. Validate time
    if (!time || typeof time !== 'string' || time.trim() === '') {
      return res.status(400).json({
        error: true,
        message: 'Time is required (format: HH:mm)'
      });
    }

    const cleanTime = time.trim();
    if (!isValidTime(cleanTime)) {
      return res.status(400).json({
        error: true,
        message: 'Time must use HH:mm format'
      });
    }

    // 4. Retrieve real weather forecast from Open-Meteo
    const forecast = await fetchWeatherForecast({
      latitude: latNum,
      longitude: lonNum,
      date: cleanDate,
      time: cleanTime
    });

    return res.status(200).json(forecast);
  } catch (err) {
    // Handle controlled upstream & operational errors
    if (err.code === 'TIMEOUT') {
      return res.status(504).json({
        error: true,
        message: 'Weather service request timed out'
      });
    }

    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({
        error: true,
        message: err.message || 'No forecast data found for the selected date and time'
      });
    }

    if (err.code === 'UPSTREAM_ERROR') {
      return res.status(502).json({
        error: true,
        message: 'Failed to retrieve weather data from Open-Meteo'
      });
    }

    if (err.code === 'INVALID_RESPONSE') {
      return res.status(502).json({
        error: true,
        message: 'Invalid response received from weather provider'
      });
    }

    // Pass unexpected errors to centralized error handler without leaking internal details
    return next(err);
  }
}

// Retain alias for backward compatibility if referenced
export const getWeatherPlaceholder = getWeather;

export default {
  getWeather,
  getWeatherPlaceholder
};
