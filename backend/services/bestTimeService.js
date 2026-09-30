/**
 * MAUSAM Backend - Best Time Recommendation Engine
 * Module 3.4: Actionable Guidance + Alternative Recommendations
 * 
 * Deterministic best-time calculation on the SAME selected date.
 * - Evaluates available hourly forecast records from Open-Meteo.
 * - Reuses the exact same Module 3.3 Rule Engine (evaluateActivityWeather).
 * - Enforces activity-specific candidate operational windows.
 * - Strictly excludes past hours if the selected date is today.
 * - Does not invent times or use fake data.
 * - Explains why a better time was suggested or why no suitable time exists.
 */

import { evaluateActivityWeather } from './ruleEngine.js';
import { extractWeatherFromHourlyIndex } from './openMeteoService.js';

// Sensible operational daytime windows per activity
const ACTIVITY_TIME_WINDOWS = {
  running: { startHour: 5, endHour: 21 },
  walking: { startHour: 6, endHour: 21 },
  cycling: { startHour: 5, endHour: 20 },
  sports: { startHour: 6, endHour: 21 },
  college: { startHour: 7, endHour: 20 },
  office: { startHour: 7, endHour: 22 },
  daily_travel: { startHour: 6, endHour: 23 },
  field_work: { startHour: 6, endHour: 18 },
  farming: { startHour: 6, endHour: 18 },
  gardening: { startHour: 6, endHour: 19 },
  irrigation: { startHour: 5, endHour: 21 },
  wedding: { startHour: 8, endHour: 23 },
  college_event: { startHour: 9, endHour: 22 },
  outdoor_function: { startHour: 9, endHour: 23 }
};

/**
 * Formats HH:mm into user-friendly 12-hour format ("6:00 PM")
 * @param {string} timeStr - HH:mm
 * @returns {string}
 */
export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${period}`;
}

/**
 * Evaluates candidate hours on the SAME date to recommend a better time window.
 * @param {Object} context - Plan context { purpose, activity, date, time, location }
 * @param {Object} rawHourly - Open-Meteo raw hourly object { time: [...], temperature_2m: [...] }
 * @param {Object} currentAnalysis - Suitability analysis for current planned time
 * @returns {Object|null} Best time recommendation or null
 */
export function findBestTime(context, rawHourly, currentAnalysis) {
  if (!context || !rawHourly || !Array.isArray(rawHourly.time) || !currentAnalysis) {
    return null;
  }

  const { date, time, activity, purpose } = context;
  const currentScore = typeof currentAnalysis.score === 'number' ? currentAnalysis.score : 0;
  const currentVerdict = currentAnalysis.verdict || 'CAUTION';

  // Determine operational window for this activity
  const windowConfig = (activity && ACTIVITY_TIME_WINDOWS[activity]) || { startHour: 6, endHour: 22 };

  // Parse planned time in minutes for proximity comparison
  const [plannedH, plannedM] = (time || '12:00').split(':').map(Number);
  const plannedMinutes = plannedH * 60 + (plannedM || 0);

  // Check if selected date is today (in local system time)
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = date === todayIso;
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const candidates = [];
  const targetPrefix = `${date}T`;

  for (let i = 0; i < rawHourly.time.length; i++) {
    const tStr = rawHourly.time[i];
    if (!tStr.startsWith(targetPrefix)) continue;

    const timePart = tStr.split('T')[1]; // e.g. "17:00"
    if (!timePart) continue;

    const [candH, candM] = timePart.split(':').map(Number);
    const candMinutes = candH * 60 + (candM || 0);

    // Rule 1: Exclude past hours if the selected date is today
    if (isToday && candMinutes <= currentTotalMinutes) {
      continue;
    }

    // Rule 2: Exclude hours outside the activity's operational window
    if (candH < windowConfig.startHour || candH > windowConfig.endHour) {
      continue;
    }

    // Rule 3: Skip the exact planned hour (we want an alternative slot)
    if (Math.abs(candMinutes - plannedMinutes) < 30) {
      continue;
    }

    // Extract weather for this candidate hour
    const candWeather = extractWeatherFromHourlyIndex(rawHourly, i);
    if (!candWeather || candWeather.temperature === null) continue;

    try {
      const evalResult = evaluateActivityWeather(
        { ...context, time: timePart },
        candWeather
      );

      if (evalResult && evalResult.analysis) {
        const candScore = evalResult.analysis.score;
        const candVerdict = evalResult.analysis.verdict;

        candidates.push({
          time: timePart,
          timeDisplay: formatTime12h(timePart),
          score: candScore,
          verdict: candVerdict,
          deltaScore: candScore - currentScore,
          diffMinutes: Math.abs(candMinutes - plannedMinutes),
          weather: candWeather,
          topFactors: evalResult.analysis.topFactors || []
        });
      }
    } catch (e) {
      // Ignore evaluation errors for malformed candidate hours
    }
  }

  // If no candidate hours were available on this date
  if (candidates.length === 0) {
    return {
      bestTime: null,
      reason: isToday
        ? 'No upcoming hours remain on today’s schedule within the active activity window.'
        : 'No alternative candidate hours available within the active activity window.'
    };
  }

  // If current planned time is already in a favorable GO state (score >= 80)
  // and no candidate offers a meaningful boost (delta < 6)
  const maxCandidateScore = Math.max(...candidates.map(c => c.score));
  if (currentScore >= 80 && currentVerdict === 'GO' && (maxCandidateScore - currentScore) < 6) {
    return {
      bestTime: null,
      reason: 'Your selected time is already within the most favorable window of the day.'
    };
  }

  // Filter candidates that offer an improvement:
  // - Either deltaScore >= 8 points
  // - Or upgrades verdict from AVOID -> CAUTION/GO, or CAUTION -> GO
  const isUpgraded = (cand) => {
    if (currentVerdict === 'AVOID' && (cand.verdict === 'CAUTION' || cand.verdict === 'GO')) return true;
    if (currentVerdict === 'CAUTION' && cand.verdict === 'GO') return true;
    return cand.deltaScore >= 8;
  };

  const improvedCandidates = candidates.filter(c => isUpgraded(c) && c.score >= 50);

  if (improvedCandidates.length === 0) {
    // If all hours are unfavorable (e.g. all AVOID or score < 40)
    if (maxCandidateScore < 40) {
      return {
        bestTime: null,
        reason: 'No suitable alternative time found on this date due to persistent unfavorable weather.'
      };
    }

    return {
      bestTime: null,
      reason: 'No other time slot on this date offers a significant improvement over your planned time.'
    };
  }

  // Sort improved candidates:
  // 1. Highest score first
  // 2. If equal score, closest in time to user's planned window
  improvedCandidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.diffMinutes - b.diffMinutes;
  });

  const best = improvedCandidates[0];

  // Generate an explainable, deterministic rationale
  const reasons = [];
  const currW = currentAnalysis.factors || [];
  const candRain = best.weather.precipitationProbability;
  const candTemp = best.weather.temperature;

  const currRainF = currW.find(f => f.factor === 'precipitation');
  const currTempF = currW.find(f => f.factor === 'temperature');

  if (currRainF && typeof currRainF.value === 'number' && typeof candRain === 'number' && candRain < currRainF.value) {
    reasons.push(`lower rain risk (${candRain}% vs ${currRainF.value}%)`);
  }
  if (currTempF && typeof currTempF.value === 'number' && typeof candTemp === 'number') {
    if (currTempF.value > 30 && candTemp < currTempF.value) {
      reasons.push(`cooler temperature (${candTemp}°C vs ${currTempF.value}°C)`);
    } else if (currTempF.value < 16 && candTemp > currTempF.value) {
      reasons.push(`milder temperature (${candTemp}°C vs ${currTempF.value}°C)`);
    }
  }

  const rationaleText = reasons.length > 0
    ? `Offers ${reasons.join(' and ')}.`
    : `Provides superior overall suitability (+${best.deltaScore} score points).`;

  return {
    bestTime: {
      date,
      time: best.time,
      timeDisplay: best.timeDisplay,
      score: best.score,
      verdict: best.verdict,
      deltaScore: best.deltaScore,
      weather: best.weather
    },
    reason: rationaleText
  };
}

export default {
  findBestTime,
  formatTime12h
};
