/**
 * MAUSAM Backend - Weather Analysis & Guidance Controller
 * Module 3.3 & Module 3.4: Weather Analysis + Personalization Rule Engine + Guidance
 * 
 * Handles incoming analysis and guidance requests:
 * 1. Evaluates suitability with deterministic Rule Engine (Module 3.3)
 * 2. Generates prioritized, explainable Actionable Guidance (Module 3.4)
 * 3. Calculates Best Time on the same date (Module 3.4)
 * 4. Calculates Alternative Day recommendations within the 7-day horizon (Module 3.4)
 */

import { evaluateActivityWeather } from '../services/ruleEngine.js';
import { fetchWeatherForecast, fetchRawHourlyForDate } from '../services/openMeteoService.js';
import { generateActionableGuidance } from '../services/guidanceEngine.js';
import { findBestTime } from '../services/bestTimeService.js';
import { findAlternativeDay } from '../services/alternativeDayService.js';

/**
 * POST /api/analyze and POST /api/guidance
 * Body: { context: { purpose, activity, date, time, location }, weather: { ... } }
 */
export async function postAnalyze(req, res, next) {
  try {
    const context = req.body?.context || req.body?.plan;
    const weather = req.body?.weather || req.body?.weatherData;

    if (!context || typeof context !== 'object') {
      return res.status(400).json({
        error: true,
        message: 'Valid plan context object is required in request body'
      });
    }

    if (!context.purpose) {
      return res.status(400).json({
        error: true,
        message: 'Plan context must include a valid purpose'
      });
    }

    if (!weather || typeof weather !== 'object') {
      return res.status(400).json({
        error: true,
        message: 'Valid weather data object is required in request body'
      });
    }

    // Support both direct weather object or full normalized Module 3.2 payload
    const weatherData = weather.weather ? weather.weather : weather;

    // 1. Evaluate Activity Suitability (Module 3.3)
    const result = evaluateActivityWeather(context, weatherData);

    // 2. Generate Actionable Guidance (Module 3.4)
    const guidance = generateActionableGuidance(context, weatherData, result.analysis);

    // 3. Best-Time Recommendation (Module 3.4)
    let bestTimeResult = null;
    let alternativeDayResult = null;

    const loc = context.location;
    const hasCoords = loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number';

    if (hasCoords && context.date) {
      try {
        const { rawData } = await fetchRawHourlyForDate({
          latitude: loc.latitude,
          longitude: loc.longitude,
          date: context.date
        });

        if (rawData && rawData.hourly) {
          bestTimeResult = findBestTime(context, rawData.hourly, result.analysis);
        }

        // 4. Alternative-Day Recommendation (if current window is not already favorable GO >= 85)
        if (result.analysis.score < 85) {
          alternativeDayResult = await findAlternativeDay(context, result.analysis, fetchWeatherForecast);
        }
      } catch (lookupErr) {
        // If external lookup fails, guidance is still delivered with bestTime: null
      }
    }

    return res.status(200).json({
      ...result,
      verdict: result?.analysis?.verdict,
      score: result?.analysis?.score,
      guidance,
      bestTime: bestTimeResult ? bestTimeResult.bestTime : null,
      bestTimeReason: bestTimeResult ? bestTimeResult.reason : null,
      alternativeDay: alternativeDayResult ? alternativeDayResult.alternativeDay : null,
      alternativeDayReason: alternativeDayResult ? alternativeDayResult.reason : null
    });
  } catch (err) {
    if (err.code === 'INVALID_CONTEXT' || err.code === 'PROFILE_NOT_FOUND' || err.code === 'INVALID_WEATHER') {
      return res.status(400).json({
        error: true,
        message: err.message
      });
    }
    return next(err);
  }
}

/**
 * GET /api/analyze and GET /api/guidance
 * Query parameters: latitude, longitude, date, time, purpose, activity
 * Fetches real Open-Meteo weather, analyzes suitability, and generates guidance + recommendations.
 */
export async function getAnalyze(req, res, next) {
  try {
    const { latitude, longitude, date, time, purpose, activity } = req.query;

    if (!purpose) {
      return res.status(400).json({
        error: true,
        message: 'Purpose query parameter is required'
      });
    }

    if (!latitude || !longitude || !date || !time) {
      return res.status(400).json({
        error: true,
        message: 'Query parameters latitude, longitude, date, and time are required'
      });
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
      return res.status(400).json({
        error: true,
        message: 'Latitude and longitude must be valid numbers'
      });
    }

    // 1. Fetch raw hourly data from Open-Meteo via Module 3.2 service
    const { rawData, fetchedAt } = await fetchRawHourlyForDate({
      latitude: latNum,
      longitude: lonNum,
      date: date.trim()
    });

    const forecast = await fetchWeatherForecast({
      latitude: latNum,
      longitude: lonNum,
      date: date.trim(),
      time: time.trim()
    });

    // 2. Evaluate with Rule Engine (Module 3.3)
    const context = {
      purpose: purpose.trim(),
      activity: activity ? activity.trim() : null,
      location: { latitude: latNum, longitude: lonNum },
      date: date.trim(),
      time: time.trim()
    };

    const analysisResult = evaluateActivityWeather(context, forecast.weather);

    // 3. Generate Actionable Guidance (Module 3.4)
    const guidance = generateActionableGuidance(context, forecast.weather, analysisResult.analysis);

    // 4. Calculate Best Time on same date (Module 3.4)
    const bestTimeResult = findBestTime(context, rawData.hourly, analysisResult.analysis);

    // 5. Calculate Alternative Day if current time is not already optimal
    let alternativeDayResult = null;
    if (analysisResult.analysis.score < 85) {
      alternativeDayResult = await findAlternativeDay(context, analysisResult.analysis, fetchWeatherForecast);
    }

    return res.status(200).json({
      success: true,
      weather: forecast,
      ...analysisResult,
      guidance,
      bestTime: bestTimeResult ? bestTimeResult.bestTime : null,
      bestTimeReason: bestTimeResult ? bestTimeResult.reason : null,
      alternativeDay: alternativeDayResult ? alternativeDayResult.alternativeDay : null,
      alternativeDayReason: alternativeDayResult ? alternativeDayResult.reason : null
    });
  } catch (err) {
    if (err.code === 'TIMEOUT') {
      return res.status(504).json({ error: true, message: 'Weather service request timed out' });
    }
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: true, message: err.message });
    }
    if (err.code === 'UPSTREAM_ERROR') {
      return res.status(502).json({ error: true, message: 'Failed to retrieve weather data from Open-Meteo' });
    }
    if (err.code === 'PROFILE_NOT_FOUND' || err.code === 'INVALID_CONTEXT') {
      return res.status(400).json({ error: true, message: err.message });
    }
    return next(err);
  }
}

export default {
  postAnalyze,
  getAnalyze
};
