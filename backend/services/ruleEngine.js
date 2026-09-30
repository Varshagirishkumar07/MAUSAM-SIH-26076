/**
 * MAUSAM Backend - Weather Analysis + Personalization Rule Engine
 * Module 3.3: Weather Analysis + Personalization Rule Engine
 * 
 * Deterministic, explainable, rule-based suitability engine.
 * - Evaluates real Open-Meteo weather metrics against activity-specific profiles.
 * - Produces weighted suitability scores (0-100) and verdicts (GO, CAUTION, AVOID).
 * - Generates clear factor-level impact explanations.
 * - Safely handles missing data (re-normalizes weights or flags insufficient_data).
 * - Prepared for future official warning overrides (officialWarning: null).
 * - Zero AI, zero ML, zero random decisions.
 */

import { getActivityProfile } from '../config/activityProfiles.js';
import { VERDICT_THRESHOLDS, getVerdictFromScore } from '../config/verdictThresholds.js';

/**
 * Extracts raw numeric value and display unit for a factor key
 * @param {string} factorKey
 * @param {Object} weather
 * @returns {{ value: number|null, unit: string }}
 */
function extractFactorRawValue(factorKey, weather) {
  if (!weather || typeof weather !== 'object') return { value: null, unit: '' };

  switch (factorKey) {
    case 'temperature':
      return { value: weather.temperature !== undefined ? weather.temperature : null, unit: '°C' };
    case 'precipitation':
      return { value: weather.precipitationProbability !== undefined ? weather.precipitationProbability : null, unit: '%' };
    case 'wind':
      return { value: weather.windSpeed !== undefined ? weather.windSpeed : null, unit: 'km/h' };
    case 'uv':
      return { value: weather.uvIndex !== undefined ? weather.uvIndex : null, unit: 'UVI' };
    case 'humidity':
      return { value: weather.humidity !== undefined ? weather.humidity : null, unit: '%' };
    default:
      return { value: null, unit: '' };
  }
}

/**
 * Evaluates real weather data against the user's plan context
 * @param {Object} context - { purpose, activity, language, location, date, time }
 * @param {Object} weather - Normalized Open-Meteo weather object from Module 3.2
 * @returns {Object} Complete analysis result
 */
export function evaluateActivityWeather(context, weather) {
  if (!context || !context.purpose) {
    const err = new Error('Valid purpose is required for analysis');
    err.code = 'INVALID_CONTEXT';
    throw err;
  }

  const profile = getActivityProfile(context.purpose, context.activity);
  if (!profile) {
    const err = new Error(`No activity profile found for purpose: ${context.purpose}, activity: ${context.activity}`);
    err.code = 'PROFILE_NOT_FOUND';
    throw err;
  }

  if (!weather || typeof weather !== 'object') {
    const err = new Error('Valid weather data object is required for analysis');
    err.code = 'INVALID_WEATHER';
    throw err;
  }

  const evaluatedFactors = [];
  let totalWeightedScore = 0;
  let availableWeight = 0;

  for (const factorItem of profile.factors) {
    const { key, name, weight, unit } = factorItem;
    const { value } = extractFactorRawValue(key, weather);

    const evalResult = factorItem.evaluate(weather);
    const isAvailable = evalResult.impact !== 'unavailable' && evalResult.score !== null;

    if (isAvailable) {
      totalWeightedScore += evalResult.score * weight;
      availableWeight += weight;
    }

    evaluatedFactors.push({
      factor: key,
      name,
      value,
      unit: unit || '',
      weight,
      score: evalResult.score,
      impact: evalResult.impact, // 'positive' | 'neutral' | 'negative' | 'unavailable'
      reason: evalResult.reason
    });
  }

  // Handle missing data: verify data quality threshold
  if (availableWeight < VERDICT_THRESHOLDS.DATA_QUALITY_MIN_WEIGHT) {
    return {
      success: true,
      analysis: {
        score: null,
        verdict: 'CAUTION',
        verdictMeta: VERDICT_THRESHOLDS.VERDICTS.CAUTION,
        profile: {
          id: profile.id,
          name: profile.name,
          purpose: profile.purpose
        },
        dataQuality: 'insufficient_data',
        message: 'Insufficient meteorological data to evaluate activity safety with confidence.',
        factors: evaluatedFactors,
        topFactors: [],
        officialWarning: null,
        analyzedAt: new Date().toISOString()
      }
    };
  }

  // Calculate normalized weighted score (0 to 100)
  const normalizedRaw = totalWeightedScore / availableWeight;
  const finalScore = Math.max(0, Math.min(100, Math.round(normalizedRaw)));
  const verdict = getVerdictFromScore(finalScore);

  // Derive top influencing factors
  // If verdict is AVOID or CAUTION: prioritize negative and neutral factors
  // If verdict is GO: prioritize positive factors
  const availableFactors = evaluatedFactors.filter(f => f.impact !== 'unavailable');
  let sortedFactors;

  if (verdict === 'AVOID' || verdict === 'CAUTION') {
    sortedFactors = [...availableFactors].sort((a, b) => (a.score ?? 100) - (b.score ?? 100));
  } else {
    sortedFactors = [...availableFactors].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  const topFactors = sortedFactors.slice(0, 3).map(f => ({
    factor: f.factor,
    name: f.name,
    impact: f.impact,
    value: f.value,
    unit: f.unit,
    reason: f.reason
  }));

  return {
    success: true,
    analysis: {
      score: finalScore,
      verdict,
      verdictMeta: VERDICT_THRESHOLDS.VERDICTS[verdict],
      profile: {
        id: profile.id,
        name: profile.name,
        purpose: profile.purpose
      },
      dataQuality: 'good',
      factors: evaluatedFactors,
      topFactors,
      officialWarning: null, // Prepared for future official warning integration
      analyzedAt: new Date().toISOString()
    }
  };
}

export default {
  evaluateActivityWeather
};
