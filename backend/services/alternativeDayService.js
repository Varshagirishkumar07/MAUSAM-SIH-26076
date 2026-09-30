/**
 * MAUSAM Backend - Alternative Day Recommendation Engine
 * Module 3.4: Actionable Guidance + Alternative Recommendations
 * 
 * Deterministic alternative-day calculation within the allowed 7-day forecast horizon.
 * - Evaluates candidate dates (Today + 1 through Today + 7).
 * - Reuses the exact same Module 3.3 Rule Engine (evaluateActivityWeather).
 * - Queries real Open-Meteo forecast data via fetchWeatherForecast.
 * - Returns candidate date only if it provides a favorable verdict (GO / score >= 70)
 *   or a substantial improvement over the current planned date.
 * - Explains why a candidate day was suggested or why no suitable day exists.
 * - Never invents dates, times, or weather values.
 */

import { evaluateActivityWeather } from './ruleEngine.js';
import { formatTime12h } from './bestTimeService.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Formats YYYY-MM-DD into a human-friendly string ("Saturday (3 Oct)")
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string}
 */
export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [yyyy, mm, dd] = dateStr.split('-').map(Number);
  const d = new Date(yyyy, mm - 1, dd, 12, 0, 0);
  const dayName = DAY_NAMES[d.getDay()];
  const monthName = MONTH_NAMES[d.getMonth()];
  return `${dayName} (${dd} ${monthName})`;
}

/**
 * Generates valid candidate forecast dates strictly within Today -> Today + 7 days
 * excluding the currently planned date.
 * @param {string} plannedDate - YYYY-MM-DD
 * @returns {Array<string>} List of candidate ISO date strings
 */
export function getCandidateForecastDates(plannedDate) {
  const now = new Date();
  const candidateDates = [];

  for (let offset = 1; offset <= 7; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12, 0, 0);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (iso !== plannedDate) {
      candidateDates.push(iso);
    }
  }

  return candidateDates;
}

/**
 * Evaluates candidate dates within the 7-day horizon to recommend a better day.
 * @param {Object} context - Plan context { purpose, activity, date, time, location }
 * @param {Object} currentAnalysis - Suitability analysis for current planned time
 * @param {Function} fetchWeatherFn - Service function to fetch weather for a candidate date
 * @returns {Promise<{ alternativeDay: Object|null, reason: string }>}
 */
export async function findAlternativeDay(context, currentAnalysis, fetchWeatherFn) {
  if (!context || !context.location || !currentAnalysis || typeof fetchWeatherFn !== 'function') {
    return {
      alternativeDay: null,
      reason: 'Incomplete plan context or missing weather lookup service.'
    };
  }

  const { date: plannedDate, time: plannedTime, location } = context;
  const currentScore = typeof currentAnalysis.score === 'number' ? currentAnalysis.score : 0;
  const currentVerdict = currentAnalysis.verdict || 'CAUTION';

  // If currently planned date & time already has a strong GO verdict (score >= 85),
  // alternative day recommendation is not needed.
  if (currentVerdict === 'GO' && currentScore >= 85) {
    return {
      alternativeDay: null,
      reason: 'Your planned day is already in optimal meteorological conditions.'
    };
  }

  const candidateDates = getCandidateForecastDates(plannedDate);
  const candidateEvaluations = [];

  for (const candDate of candidateDates) {
    try {
      const forecast = await fetchWeatherFn({
        latitude: location.latitude,
        longitude: location.longitude,
        date: candDate,
        time: plannedTime || '17:00'
      });

      if (forecast && forecast.weather) {
        const evalResult = evaluateActivityWeather(
          { ...context, date: candDate },
          forecast.weather
        );

        if (evalResult && evalResult.analysis) {
          const candScore = evalResult.analysis.score;
          const candVerdict = evalResult.analysis.verdict;

          candidateEvaluations.push({
            date: candDate,
            dateDisplay: formatDateDisplay(candDate),
            time: plannedTime || '17:00',
            timeDisplay: formatTime12h(plannedTime || '17:00'),
            score: candScore,
            verdict: candVerdict,
            deltaScore: candScore - currentScore,
            weather: forecast.weather,
            topFactors: evalResult.analysis.topFactors || []
          });
        }
      }
    } catch (e) {
      // Skip candidate date if forecast lookup fails (e.g. out of range or network timeout)
    }
  }

  if (candidateEvaluations.length === 0) {
    return {
      alternativeDay: null,
      reason: 'No additional forecast days available within the 7-day forecast horizon.'
    };
  }

  // Filter candidates that meet favorable criteria:
  // - Verdict must be GO (score >= 70)
  // - Must offer noticeable score increase over current planned date (deltaScore >= 10)
  const viableCandidates = candidateEvaluations.filter(c => c.verdict === 'GO' && c.deltaScore >= 10);

  if (viableCandidates.length === 0) {
    return {
      alternativeDay: null,
      reason: 'No significantly better alternative day found within the 7-day forecast horizon.'
    };
  }

  // Sort viable candidates: highest score first, then earliest date
  viableCandidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.date.localeCompare(b.date);
  });

  const bestDay = viableCandidates[0];

  // Build transparent rationale
  const reasons = [];
  const candRain = bestDay.weather.precipitationProbability;
  const candTemp = bestDay.weather.temperature;

  const currW = currentAnalysis.factors || [];
  const currRainF = currW.find(f => f.factor === 'precipitation');

  if (currRainF && typeof currRainF.value === 'number' && typeof candRain === 'number' && candRain < currRainF.value) {
    reasons.push(`lower rain probability (${candRain}% vs ${currRainF.value}%)`);
  }
  if (typeof candTemp === 'number') {
    reasons.push(`favorable temperature (${candTemp}°C)`);
  }

  const rationale = reasons.length > 0
    ? `Offers ${reasons.join(' and ')} with a favorable GO verdict.`
    : `Offers significantly more favorable weather (+${bestDay.deltaScore} points).`;

  return {
    alternativeDay: {
      date: bestDay.date,
      dateDisplay: bestDay.dateDisplay,
      time: bestDay.time,
      timeDisplay: bestDay.timeDisplay,
      score: bestDay.score,
      verdict: bestDay.verdict,
      deltaScore: bestDay.deltaScore,
      weather: bestDay.weather
    },
    reason: rationale
  };
}

export default {
  findAlternativeDay,
  formatDateDisplay,
  getCandidateForecastDates
};
