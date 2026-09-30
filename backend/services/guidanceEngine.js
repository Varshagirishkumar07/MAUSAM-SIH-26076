/**
 * MAUSAM Backend - Actionable Guidance Engine
 * Module 3.4: Actionable Guidance + Alternative Recommendations
 * 
 * Deterministic, explainable guidance engine.
 * - Evaluates activity, weather metrics, and Module 3.3 suitability analysis.
 * - Generates prioritized, factor-specific, and explainable recommendations.
 * - Zero AI, zero LLMs, zero ML, zero random decisions.
 * - Non-prescriptive, cautious public-service phrasing ("Consider...", "Conditions may be less suitable...").
 * - Zero medical claims and zero crop-specific yield guarantees.
 */

// Priority weight ordering for sorting
const PRIORITY_ORDER = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4
};

/**
 * Generates an array of prioritized, explainable guidance items.
 * @param {Object} context - Plan context { purpose, activity, date, time, location }
 * @param {Object} weather - Normalized Open-Meteo weather object { temperature, precipitationProbability, ... }
 * @param {Object} analysis - Suitability analysis result { score, verdict, factors, topFactors }
 * @returns {Array<Object>} List of guidance items sorted by priority
 */
export function generateActionableGuidance(context, weather, analysis) {
  if (!context || !analysis) return [];

  const guidanceItems = [];
  const purpose = context.purpose || 'outdoor_activity';
  const activity = context.activity || '';
  const score = typeof analysis.score === 'number' ? analysis.score : null;
  const verdict = analysis.verdict || 'CAUTION';

  const w = weather || {};
  const temp = typeof w.temperature === 'number' ? w.temperature : null;
  const feelsLike = typeof w.feelsLike === 'number' ? w.feelsLike : temp;
  const rainProb = typeof w.precipitationProbability === 'number' ? w.precipitationProbability : null;
  const precipMm = typeof w.precipitation === 'number' ? w.precipitation : 0;
  const windSpeed = typeof w.windSpeed === 'number' ? w.windSpeed : null;
  const windGusts = typeof w.windGusts === 'number' ? w.windGusts : null;
  const uvIndex = typeof w.uvIndex === 'number' ? w.uvIndex : null;
  const humidity = typeof w.humidity === 'number' ? w.humidity : null;

  // Helper to add guidance item
  const addGuidance = ({ id, message, reason, factor, value, unit, priority }) => {
    // Avoid duplicate IDs
    if (!guidanceItems.some(item => item.id === id)) {
      guidanceItems.push({
        id,
        message,
        reason,
        factor: factor || 'context',
        value: value !== undefined ? value : null,
        unit: unit || '',
        priority: priority || 'medium'
      });
    }
  };

  // =========================================================================
  // 1. PRECIPITATION & RAIN GUIDANCE RULES
  // =========================================================================
  if (rainProb !== null) {
    // High precipitation risk for general outdoor activities and events
    if ((rainProb >= 60 || precipMm >= 1.5) && (purpose === 'outdoor_activity' || purpose === 'event')) {
      addGuidance({
        id: 'rain_gear_outdoor',
        message: 'Consider carrying an umbrella or waterproof rain gear.',
        reason: `Elevated precipitation probability (${rainProb}%).`,
        factor: 'precipitation',
        value: rainProb,
        unit: '%',
        priority: 'high'
      });
    } else if (rainProb >= 35 && rainProb < 60 && (purpose === 'outdoor_activity' || purpose === 'event')) {
      addGuidance({
        id: 'moderate_rain_standby',
        message: 'Keep an umbrella handy in case of scattered showers.',
        reason: `Moderate chance of localized rain (${rainProb}%).`,
        factor: 'precipitation',
        value: rainProb,
        unit: '%',
        priority: 'medium'
      });
    }

    // Heavy precipitation impact for Commute
    if (purpose === 'commute') {
      if (rainProb >= 70 || precipMm >= 3.0) {
        addGuidance({
          id: 'commute_rain_delays',
          message: 'Allow extra transit travel time and prepare for potential road waterlogging.',
          reason: `High rain risk (${rainProb}%) likely to slow traffic and reduce road visibility.`,
          factor: 'precipitation',
          value: rainProb,
          unit: '%',
          priority: 'high'
        });
      } else if (rainProb >= 40) {
        addGuidance({
          id: 'commute_rain_gear',
          message: 'Carry rain protection and check local traffic routes before leaving.',
          reason: `Noticeable chance of rain showers (${rainProb}%).`,
          factor: 'precipitation',
          value: rainProb,
          unit: '%',
          priority: 'medium'
        });
      }
    }

    // Agriculture-specific precipitation guidance
    if (purpose === 'agriculture') {
      if (activity === 'farming' || activity === 'crop_drying') {
        if (rainProb >= 40 || precipMm > 0) {
          addGuidance({
            id: 'agri_rain_spray_warning',
            message: 'Consider postponing chemical spraying or outdoor grain drying.',
            reason: `Rainfall chance (${rainProb}%) could wash away foliar sprays or moisten harvested produce.`,
            factor: 'precipitation',
            value: rainProb,
            unit: '%',
            priority: 'high'
          });
        }
      } else if (activity === 'irrigation') {
        if (rainProb >= 60 || precipMm >= 2.0) {
          addGuidance({
            id: 'agri_rain_irrigation_defer',
            message: 'Consider delaying irrigation to leverage natural rainfall and prevent over-saturation.',
            reason: `Substantial precipitation forecast (${rainProb}% chance, ${precipMm} mm).`,
            factor: 'precipitation',
            value: rainProb,
            unit: '%',
            priority: 'medium'
          });
        }
      }
    }
  }

  // =========================================================================
  // 2. WIND & GUST GUIDANCE RULES
  // =========================================================================
  if (windSpeed !== null) {
    // Cycling & Two-wheeler safety in high wind
    if ((activity === 'cycling' || activity === 'sports' || activity === 'college') && (windSpeed >= 25 || (windGusts && windGusts >= 35))) {
      addGuidance({
        id: 'wind_cycling_stability',
        message: 'Exercise caution with cross-winds and maintain extra braking distance.',
        reason: `Brisk winds (${windSpeed} km/h${windGusts ? `, gusts up to ${windGusts} km/h` : ''}) may challenge vehicle or equipment control.`,
        factor: 'wind',
        value: windSpeed,
        unit: 'km/h',
        priority: 'high'
      });
    }

    // Farming spray drift
    if (purpose === 'agriculture' && activity === 'farming' && windSpeed >= 18) {
      addGuidance({
        id: 'agri_wind_spray_drift',
        message: 'Consider waiting for calm winds before pesticide or fertilizer spraying to avoid drift.',
        reason: `Wind speed of ${windSpeed} km/h exceeds recommended drift-safety threshold.`,
        factor: 'wind',
        value: windSpeed,
        unit: 'km/h',
        priority: 'high'
      });
    }

    // General high wind warning
    if (windSpeed >= 32) {
      addGuidance({
        id: 'general_high_wind',
        message: 'Secure loose outdoor items and anticipate strong wind gusts.',
        reason: `High sustained wind speed of ${windSpeed} km/h.`,
        factor: 'wind',
        value: windSpeed,
        unit: 'km/h',
        priority: 'medium'
      });
    }
  }

  // =========================================================================
  // 3. THERMAL & HEAT STRESS GUIDANCE RULES
  // =========================================================================
  if (temp !== null) {
    const isExertion = activity === 'running' || activity === 'cycling' || activity === 'sports' || activity === 'field_work';

    // High Heat Index for exertion activities
    if (isExertion && (temp >= 32 || (feelsLike !== null && feelsLike >= 36))) {
      addGuidance({
        id: 'heat_hydration_exertion',
        message: 'Carry extra fluids, hydrate proactively, and schedule frequent shaded rest periods.',
        reason: `Elevated thermal conditions (${temp}°C, feels like ${feelsLike}°C) amplify exertion dehydration risk.`,
        factor: 'temperature',
        value: temp,
        unit: '°C',
        priority: 'high'
      });
    } else if (temp >= 36) {
      addGuidance({
        id: 'heat_general_precautions',
        message: 'Stay hydrated and seek shade or climate-controlled environments when possible.',
        reason: `High ambient temperature (${temp}°C).`,
        factor: 'temperature',
        value: temp,
        unit: '°C',
        priority: 'medium'
      });
    }

    // Cool / Chilly weather guidance
    if (temp <= 15) {
      addGuidance({
        id: 'cool_weather_layers',
        message: 'Consider wearing breathable warm layers to stay comfortable.',
        reason: `Cool temperature (${temp}°C) during planned activity.`,
        factor: 'temperature',
        value: temp,
        unit: '°C',
        priority: 'low'
      });
    }
  }

  // =========================================================================
  // 4. SOLAR UV GUIDANCE RULES
  // =========================================================================
  if (uvIndex !== null && uvIndex >= 6) {
    addGuidance({
      id: 'solar_uv_protection',
      message: 'Apply broad-spectrum sunscreen and wear UV-protective headwear or sunglasses.',
      reason: `Very strong solar radiation (${uvIndex} UVI).`,
      factor: 'uv',
      value: uvIndex,
      unit: 'UVI',
      priority: uvIndex >= 8 ? 'high' : 'medium'
    });
  }

  // =========================================================================
  // 5. VERDICT-LEVEL OVERALL GUIDANCE
  // =========================================================================
  if (verdict === 'AVOID') {
    addGuidance({
      id: 'verdict_avoid_reconsider',
      message: 'Conditions appear unfavorable for this activity. Consider choosing an alternate time or day.',
      reason: `Overall suitability score is low (${score}/100) due to adverse weather factors.`,
      factor: 'overall',
      value: score,
      unit: 'score',
      priority: 'urgent'
    });
  } else if (verdict === 'CAUTION') {
    addGuidance({
      id: 'verdict_caution_prepare',
      message: 'Conditions are moderately suitable. Review active factors and prepare accordingly.',
      reason: `Suitability score is ${score}/100 with noticeable weather friction.`,
      factor: 'overall',
      value: score,
      unit: 'score',
      priority: 'medium'
    });
  } else if (verdict === 'GO') {
    addGuidance({
      id: 'verdict_go_favorable',
      message: 'Weather conditions are favorable. Proceed with your planned schedule with standard awareness.',
      reason: `Favorable suitability score (${score}/100) aligns well with your activity profile.`,
      factor: 'overall',
      value: score,
      unit: 'score',
      priority: 'low'
    });
  }

  // Sort guidance items by priority
  guidanceItems.sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority] || 99;
    const pB = PRIORITY_ORDER[b.priority] || 99;
    return pA - pB;
  });

  return guidanceItems;
}

export default {
  generateActionableGuidance
};
