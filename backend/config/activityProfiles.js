/**
 * MAUSAM Backend - Activity Profiles Configuration
 * Module 3.3: Weather Analysis + Personalization Rule Engine
 * 
 * Centralized registry of activity profiles for all 14 MVP activities across 4 purposes:
 * - outdoor_activity: walking, running, cycling, sports
 * - commute: college, office, daily_travel
 * - agriculture: field_work, farming, gardening, irrigation
 * - event: wedding, college_event, outdoor_function
 * 
 * NOTE:
 * All threshold values are heuristic developer baselines labeled as CONFIGURABLE_THRESHOLD.
 * They are NOT official IMD scientific citations.
 */

const THRESHOLD_TAG = 'CONFIGURABLE_THRESHOLD';

/**
 * Common factor evaluators used across profiles
 */
export const FACTOR_EVALUATORS = {
  // Temperature for general outdoor leisure (walking, daily travel, gardening)
  temperature_general: (temp) => {
    if (temp === null || temp === undefined) return { score: null, impact: 'unavailable', reason: 'Temperature data unavailable' };
    if (temp >= 18 && temp <= 28) return { score: 95, impact: 'positive', reason: `Comfortable ambient temperature (${temp}°C)` };
    if (temp >= 15 && temp < 18) return { score: 80, impact: 'neutral', reason: `Cool temperature (${temp}°C); mild outer layer recommended` };
    if (temp > 28 && temp <= 33) return { score: 70, impact: 'neutral', reason: `Warm temperature (${temp}°C); moderate thermal load` };
    if (temp > 33 && temp <= 38) return { score: 45, impact: 'negative', reason: `Hot conditions (${temp}°C); risk of heat fatigue` };
    if (temp > 38) return { score: 20, impact: 'negative', reason: `Extreme heat (${temp}°C); elevated heat exhaustion risk` };
    return { score: 35, impact: 'negative', reason: `Cold temperature (${temp}°C)` };
  },

  // Temperature for high-exertion athletic activities (running, cycling, sports)
  temperature_exertion: (temp) => {
    if (temp === null || temp === undefined) return { score: null, impact: 'unavailable', reason: 'Temperature data unavailable' };
    if (temp >= 14 && temp <= 24) return { score: 95, impact: 'positive', reason: `Optimal athletic performance thermal window (${temp}°C)` };
    if (temp > 24 && temp <= 29) return { score: 75, impact: 'neutral', reason: `Moderately warm for intense exertion (${temp}°C); hydration required` };
    if (temp > 29 && temp <= 34) return { score: 45, impact: 'negative', reason: `High thermal strain for cardio exertion (${temp}°C)` };
    if (temp > 34) return { score: 15, impact: 'negative', reason: `Dangerous heat index for strenuous workout (${temp}°C)` };
    return { score: 50, impact: 'neutral', reason: `Chilly for outdoor athletics (${temp}°C); warmup required` };
  },

  // Precipitation probability for outdoor recreation & events
  precipitation_probability_strict: (prob, precip = 0) => {
    if (prob === null || prob === undefined) return { score: null, impact: 'unavailable', reason: 'Precipitation probability data unavailable' };
    if (precip > 5.0 || prob >= 80) return { score: 15, impact: 'negative', reason: `High rain risk (${prob}% chance, ${precip} mm); rain interruptions highly probable` };
    if (precip > 1.5 || prob >= 60) return { score: 35, impact: 'negative', reason: `Elevated chance of rain showers (${prob}%)` };
    if (prob >= 35 || precip > 0) return { score: 65, impact: 'neutral', reason: `Moderate chance of scattered rain (${prob}%)` };
    if (prob >= 15) return { score: 85, impact: 'positive', reason: `Low probability of rain (${prob}%)` };
    return { score: 98, impact: 'positive', reason: `Dry weather expected (${prob}% rain chance)` };
  },

  // Precipitation probability for commute
  precipitation_probability_commute: (prob, precip = 0) => {
    if (prob === null || prob === undefined) return { score: null, impact: 'unavailable', reason: 'Precipitation probability data unavailable' };
    if (precip > 5.0 || prob >= 80) return { score: 25, impact: 'negative', reason: `Heavy rain chance (${prob}%); expect road waterlogging & transit delays` };
    if (precip > 1.0 || prob >= 50) return { score: 55, impact: 'neutral', reason: `Likely rain showers (${prob}%); allow extra commute travel time` };
    if (prob >= 20) return { score: 80, impact: 'positive', reason: `Mild rain chance (${prob}%); normal commute conditions` };
    return { score: 95, impact: 'positive', reason: `Clear transit conditions (${prob}% rain chance)` };
  },

  // Precipitation for irrigation (unique: high rain means irrigation is not needed / postponed)
  precipitation_irrigation: (prob, precip = 0) => {
    if (prob === null || prob === undefined) return { score: null, impact: 'unavailable', reason: 'Precipitation probability data unavailable' };
    if (precip > 5.0 || prob >= 75) return { score: 30, impact: 'negative', reason: `Heavy rainfall expected (${prob}%); artificial irrigation should be deferred` };
    if (precip > 1.0 || prob >= 45) return { score: 55, impact: 'neutral', reason: `Natural rain anticipated (${prob}%); partial or delayed irrigation advisable` };
    return { score: 95, impact: 'positive', reason: `Low precipitation expected (${prob}%); ideal window for scheduled irrigation` };
  },

  // Wind speed general
  wind_general: (wind, gusts = 0) => {
    if (wind === null || wind === undefined) return { score: null, impact: 'unavailable', reason: 'Wind speed data unavailable' };
    if (wind > 35 || gusts > 50) return { score: 25, impact: 'negative', reason: `Strong winds (${wind} km/h, gusts ${gusts} km/h); outdoor disruption` };
    if (wind > 22 || gusts > 35) return { score: 60, impact: 'neutral', reason: `Breezy conditions (${wind} km/h)` };
    return { score: 95, impact: 'positive', reason: `Gentle/calm breeze (${wind} km/h)` };
  },

  // Wind speed for cycling / open-air decor / spraying
  wind_sensitive: (wind, gusts = 0) => {
    if (wind === null || wind === undefined) return { score: null, impact: 'unavailable', reason: 'Wind speed data unavailable' };
    if (wind > 28 || gusts > 40) return { score: 20, impact: 'negative', reason: `High crosswinds & gusts (${wind} km/h); significant stability/decor hazard` };
    if (wind > 18 || gusts > 28) return { score: 55, impact: 'neutral', reason: `Moderate headwind/crosswind (${wind} km/h); increased riding resistance / spray drift` };
    return { score: 95, impact: 'positive', reason: `Low wind speed (${wind} km/h); favorable stability` };
  },

  // UV Index
  uv_index: (uv) => {
    if (uv === null || uv === undefined) return { score: null, impact: 'unavailable', reason: 'UV index unavailable or activity scheduled at night' };
    if (uv >= 8) return { score: 30, impact: 'negative', reason: `Very high UV radiation (${uv} UVI); severe sunburn risk during prolonged exposure` };
    if (uv >= 6) return { score: 60, impact: 'neutral', reason: `High UV index (${uv} UVI); sun protection recommended` };
    if (uv >= 3) return { score: 85, impact: 'positive', reason: `Moderate UV index (${uv} UVI)` };
    return { score: 100, impact: 'positive', reason: `Low/minimal UV exposure (${uv} UVI)` };
  },

  // Relative Humidity
  humidity: (hum) => {
    if (hum === null || hum === undefined) return { score: null, impact: 'unavailable', reason: 'Humidity data unavailable' };
    if (hum > 85) return { score: 40, impact: 'negative', reason: `Oppressive air humidity (${hum}%); reduces sweat evaporation and increases heat index` };
    if (hum > 70) return { score: 65, impact: 'neutral', reason: `High relative humidity (${hum}%)` };
    if (hum >= 35 && hum <= 70) return { score: 95, impact: 'positive', reason: `Comfortable relative humidity (${hum}%)` };
    return { score: 70, impact: 'neutral', reason: `Dry air (${hum}%)` };
  }
};

/**
 * Activity Profile Definitions
 */
export const ACTIVITY_PROFILES = Object.freeze({
  // --- Purpose 1: Outdoor Activity ---
  outdoor_activity: Object.freeze({
    walking: {
      id: 'walking',
      name: 'Walking',
      purpose: 'outdoor_activity',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'precipitation', name: 'Rain Probability', weight: 0.35, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_strict(w.precipitationProbability, w.precipitation) },
        { key: 'temperature', name: 'Air Temperature', weight: 0.25, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_general(w.temperature) },
        { key: 'wind', name: 'Wind Speed', weight: 0.20, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_general(w.windSpeed, w.windGusts) },
        { key: 'uv', name: 'UV Radiation', weight: 0.20, unit: 'UVI', evaluate: (w) => FACTOR_EVALUATORS.uv_index(w.uvIndex) }
      ]
    },
    running: {
      id: 'running',
      name: 'Running',
      purpose: 'outdoor_activity',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'temperature', name: 'Thermal Strain', weight: 0.35, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_exertion(w.temperature) },
        { key: 'precipitation', name: 'Rain Probability', weight: 0.30, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_strict(w.precipitationProbability, w.precipitation) },
        { key: 'uv', name: 'Solar UV Index', weight: 0.20, unit: 'UVI', evaluate: (w) => FACTOR_EVALUATORS.uv_index(w.uvIndex) },
        { key: 'wind', name: 'Wind Resistance', weight: 0.15, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_general(w.windSpeed, w.windGusts) }
      ]
    },
    cycling: {
      id: 'cycling',
      name: 'Cycling',
      purpose: 'outdoor_activity',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'wind', name: 'Crosswinds & Gusts', weight: 0.35, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_sensitive(w.windSpeed, w.windGusts) },
        { key: 'precipitation', name: 'Rain & Wet Road', weight: 0.35, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_strict(w.precipitationProbability, w.precipitation) },
        { key: 'temperature', name: 'Air Temperature', weight: 0.20, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_exertion(w.temperature) },
        { key: 'uv', name: 'UV Radiation', weight: 0.10, unit: 'UVI', evaluate: (w) => FACTOR_EVALUATORS.uv_index(w.uvIndex) }
      ]
    },
    sports: {
      id: 'sports',
      name: 'Sports',
      purpose: 'outdoor_activity',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'precipitation', name: 'Ground Moisture & Rain', weight: 0.40, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_strict(w.precipitationProbability, w.precipitation) },
        { key: 'temperature', name: 'Field Temperature', weight: 0.25, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_exertion(w.temperature) },
        { key: 'wind', name: 'Ball Trajectory Wind', weight: 0.20, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_sensitive(w.windSpeed, w.windGusts) },
        { key: 'uv', name: 'UV Radiation', weight: 0.15, unit: 'UVI', evaluate: (w) => FACTOR_EVALUATORS.uv_index(w.uvIndex) }
      ]
    }
  }),

  // --- Purpose 2: Commute ---
  commute: Object.freeze({
    college: {
      id: 'college',
      name: 'College Commute',
      purpose: 'commute',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'precipitation', name: 'Rain & Transit Delay', weight: 0.40, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_commute(w.precipitationProbability, w.precipitation) },
        { key: 'wind', name: 'Wind & Two-Wheeler Safety', weight: 0.25, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_sensitive(w.windSpeed, w.windGusts) },
        { key: 'temperature', name: 'Commute Temperature', weight: 0.20, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_general(w.temperature) },
        { key: 'humidity', name: 'Relative Humidity', weight: 0.15, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.humidity(w.humidity) }
      ]
    },
    office: {
      id: 'office',
      name: 'Office Commute',
      purpose: 'commute',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'precipitation', name: 'Waterlogging & Traffic Risk', weight: 0.45, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_commute(w.precipitationProbability, w.precipitation) },
        { key: 'wind', name: 'Wind Gusts', weight: 0.25, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_general(w.windSpeed, w.windGusts) },
        { key: 'temperature', name: 'Commute Temperature', weight: 0.15, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_general(w.temperature) },
        { key: 'humidity', name: 'Relative Humidity', weight: 0.15, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.humidity(w.humidity) }
      ]
    },
    daily_travel: {
      id: 'daily_travel',
      name: 'Daily Travel',
      purpose: 'commute',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'precipitation', name: 'Rain Probability', weight: 0.40, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_commute(w.precipitationProbability, w.precipitation) },
        { key: 'wind', name: 'Wind Speed', weight: 0.30, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_general(w.windSpeed, w.windGusts) },
        { key: 'temperature', name: 'Temperature', weight: 0.20, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_general(w.temperature) },
        { key: 'humidity', name: 'Humidity', weight: 0.10, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.humidity(w.humidity) }
      ]
    }
  }),

  // --- Purpose 3: Agriculture ---
  agriculture: Object.freeze({
    field_work: {
      id: 'field_work',
      name: 'Field Work',
      purpose: 'agriculture',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'precipitation', name: 'Field Soil Accessibility', weight: 0.35, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_strict(w.precipitationProbability, w.precipitation) },
        { key: 'temperature', name: 'Labor Heat Stress', weight: 0.30, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_exertion(w.temperature) },
        { key: 'wind', name: 'Wind Speed', weight: 0.20, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_general(w.windSpeed, w.windGusts) },
        { key: 'humidity', name: 'Relative Humidity', weight: 0.15, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.humidity(w.humidity) }
      ]
    },
    farming: {
      id: 'farming',
      name: 'Farming (Spray/Sowing)',
      purpose: 'agriculture',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'wind', name: 'Spray Drift & Wind', weight: 0.35, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_sensitive(w.windSpeed, w.windGusts) },
        { key: 'precipitation', name: 'Precipitation Risk', weight: 0.35, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_strict(w.precipitationProbability, w.precipitation) },
        { key: 'temperature', name: 'Air Temperature', weight: 0.20, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_general(w.temperature) },
        { key: 'humidity', name: 'Relative Humidity', weight: 0.10, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.humidity(w.humidity) }
      ]
    },
    gardening: {
      id: 'gardening',
      name: 'Gardening',
      purpose: 'agriculture',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'temperature', name: 'Ambient Temperature', weight: 0.35, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_general(w.temperature) },
        { key: 'precipitation', name: 'Rain Probability', weight: 0.30, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_strict(w.precipitationProbability, w.precipitation) },
        { key: 'uv', name: 'Solar UV Index', weight: 0.20, unit: 'UVI', evaluate: (w) => FACTOR_EVALUATORS.uv_index(w.uvIndex) },
        { key: 'wind', name: 'Wind Speed', weight: 0.15, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_general(w.windSpeed, w.windGusts) }
      ]
    },
    irrigation: {
      id: 'irrigation',
      name: 'Irrigation Scheduling',
      purpose: 'agriculture',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'precipitation', name: 'Natural Rain Forecast', weight: 0.50, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_irrigation(w.precipitationProbability, w.precipitation) },
        { key: 'temperature', name: 'Evaporative Temperature', weight: 0.20, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_general(w.temperature) },
        { key: 'humidity', name: 'Relative Humidity', weight: 0.20, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.humidity(w.humidity) },
        { key: 'wind', name: 'Wind Evaporation', weight: 0.10, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_general(w.windSpeed, w.windGusts) }
      ]
    }
  }),

  // --- Purpose 4: Event ---
  event: Object.freeze({
    wedding: {
      id: 'wedding',
      name: 'Wedding Gathering',
      purpose: 'event',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'precipitation', name: 'Rain Interruption Risk', weight: 0.50, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_strict(w.precipitationProbability, w.precipitation) },
        { key: 'temperature', name: 'Guest Thermal Comfort', weight: 0.25, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_general(w.temperature) },
        { key: 'wind', name: 'Canopy & Decor Wind', weight: 0.25, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_sensitive(w.windSpeed, w.windGusts) }
      ]
    },
    college_event: {
      id: 'college_event',
      name: 'College Event',
      purpose: 'event',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'precipitation', name: 'Open-Air Rain Risk', weight: 0.45, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_strict(w.precipitationProbability, w.precipitation) },
        { key: 'wind', name: 'Stage & Acoustic Wind', weight: 0.30, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_sensitive(w.windSpeed, w.windGusts) },
        { key: 'temperature', name: 'Ambient Temperature', weight: 0.25, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_general(w.temperature) }
      ]
    },
    outdoor_function: {
      id: 'outdoor_function',
      name: 'Outdoor Function',
      purpose: 'event',
      thresholdType: THRESHOLD_TAG,
      factors: [
        { key: 'precipitation', name: 'Rainfall Risk', weight: 0.45, unit: '%', evaluate: (w) => FACTOR_EVALUATORS.precipitation_probability_strict(w.precipitationProbability, w.precipitation) },
        { key: 'temperature', name: 'Crowd Temperature Comfort', weight: 0.30, unit: '°C', evaluate: (w) => FACTOR_EVALUATORS.temperature_general(w.temperature) },
        { key: 'wind', name: 'Tent & Banner Wind', weight: 0.25, unit: 'km/h', evaluate: (w) => FACTOR_EVALUATORS.wind_sensitive(w.windSpeed, w.windGusts) }
      ]
    }
  })
});

/**
 * Helper to fetch profile by purpose and activity
 * @param {string} purpose
 * @param {string} activity
 * @returns {Object|null}
 */
export function getActivityProfile(purpose, activity) {
  if (!purpose) return null;
  const cleanP = purpose.trim().toLowerCase();
  const normP = cleanP === 'outdoor' ? 'outdoor_activity' : cleanP;

  const purposeGroup = ACTIVITY_PROFILES[normP];
  if (!purposeGroup) return null;

  if (!activity) {
    // Return first activity in purpose as fallback
    const firstKey = Object.keys(purposeGroup)[0];
    return purposeGroup[firstKey] || null;
  }

  const cleanA = activity.trim().toLowerCase();
  return purposeGroup[cleanA] || Object.values(purposeGroup).find(p => p.id === cleanA) || null;
}

export default ACTIVITY_PROFILES;
