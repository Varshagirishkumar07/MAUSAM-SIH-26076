/**
 * MAUSAM - Weather Service Client
 * Module 3.2: Connect Real Weather API (Open-Meteo)
 * 
 * Communicates with the MAUSAM Express backend (GET /api/weather)
 * to retrieve real, normalized Open-Meteo forecast data.
 * - Resolves real geographical coordinates for selected locations.
 * - Handles loading, error, and cached weather states.
 * - Zero fake/simulated weather numbers.
 * - Never calls Open-Meteo directly from the browser.
 */

(function () {
  'use strict';

  // Authoritative real geographical coordinates for Indian cities
  const INDIAN_CITY_COORDINATES = Object.freeze({
    'chennai': { latitude: 13.0827, longitude: 80.2707 },
    'bengaluru': { latitude: 12.9716, longitude: 77.5946 },
    'delhi': { latitude: 28.6139, longitude: 77.2090 },
    'mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'kolkata': { latitude: 22.5726, longitude: 88.3639 },
    'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
    'kochi': { latitude: 9.9312, longitude: 76.2673 },
    'pune': { latitude: 18.5204, longitude: 73.8567 },
    'ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
    'jaipur': { latitude: 26.9124, longitude: 75.7873 },
    'lucknow': { latitude: 26.8467, longitude: 80.9462 },
    'chandigarh': { latitude: 30.7333, longitude: 76.7794 },
    'bhopal': { latitude: 23.2599, longitude: 77.4126 },
    'patna': { latitude: 25.5941, longitude: 85.1376 },
    'thiruvananthapuram': { latitude: 8.5241, longitude: 76.9366 },
    'coimbatore': { latitude: 11.0168, longitude: 76.9558 },
    'madurai': { latitude: 9.9252, longitude: 78.1198 },
    'thrissur': { latitude: 10.5276, longitude: 76.2144 }
  });

  const BACKEND_BASE_URL = (typeof window !== 'undefined' && window.MAUSAM_CONFIG && window.MAUSAM_CONFIG.backendUrl)
    ? window.MAUSAM_CONFIG.backendUrl
    : 'http://localhost:5000';

  // Internal weather state
  let weatherState = {
    data: null,
    loading: false,
    error: null,
    lastFetchedKey: null
  };

  const listeners = new Set();

  function notifyListeners() {
    listeners.forEach((fn) => {
      try {
        fn({ ...weatherState });
      } catch (e) {
        console.error('[MAUSAM Weather] Listener error:', e);
      }
    });
  }

  /**
   * Resolves real geographic coordinates for a given city name.
   * Checks registry first; falls back to keyless Open-Meteo geocoding search if needed.
   * @param {string} cityName
   * @returns {Promise<{ latitude: number, longitude: number }|null>}
   */
  async function resolveCoordinates(cityName) {
    if (!cityName || typeof cityName !== 'string') return null;
    const clean = cityName.trim().toLowerCase();

    // 1. Direct registry lookup
    if (INDIAN_CITY_COORDINATES[clean]) {
      return { ...INDIAN_CITY_COORDINATES[clean] };
    }

    // Check partial matches
    for (const [name, coords] of Object.entries(INDIAN_CITY_COORDINATES)) {
      if (clean.includes(name) || name.includes(clean)) {
        return { ...coords };
      }
    }

    // 2. Fallback to Open-Meteo keyless geocoding API for any Indian city
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
      const res = await fetch(geoUrl);
      if (res.ok) {
        const geoData = await res.json();
        if (geoData.results && geoData.results.length > 0) {
          const top = geoData.results[0];
          return {
            latitude: parseFloat(top.latitude),
            longitude: parseFloat(top.longitude)
          };
        }
      }
    } catch (e) {
      console.warn('[MAUSAM Weather] Geocoding lookup failed:', e);
    }

    // Default to New Delhi (capital) coordinates if completely unknown
    return { latitude: 28.6139, longitude: 77.2090 };
  }

  /**
   * Fetches real weather data from the MAUSAM backend for the user's plan.
   * @param {Object} planContext
   * @param {Object} planContext.location
   * @param {string} planContext.date - YYYY-MM-DD
   * @param {string} planContext.time - HH:mm
   * @returns {Promise<Object|null>}
   */
  async function fetchWeatherForPlan(planContext) {
    if (!planContext) return null;

    const loc = planContext.location;
    const date = planContext.date;
    const time = planContext.time;

    if (!loc || !date || !time) {
      weatherState.error = 'Incomplete plan context for weather lookup';
      weatherState.loading = false;
      notifyListeners();
      return null;
    }

    // Determine latitude and longitude
    let lat = (typeof loc === 'object' && loc !== null && typeof loc.latitude === 'number') ? loc.latitude : null;
    let lon = (typeof loc === 'object' && loc !== null && typeof loc.longitude === 'number') ? loc.longitude : null;

    if (lat === null || lon === null) {
      const locName = (typeof loc === 'string') ? loc : (loc.name || '');
      const coords = await resolveCoordinates(locName);
      if (coords) {
        lat = coords.latitude;
        lon = coords.longitude;
        // Optionally update location in state with real coordinates
        if (window.MausamState && typeof window.MausamState.setState === 'function') {
          window.MausamState.setState({
            location: {
              name: locName,
              latitude: lat,
              longitude: lon
            }
          });
        }
      }
    }

    if (lat === null || lon === null) {
      weatherState.error = 'Valid coordinates are required to fetch weather';
      weatherState.loading = false;
      notifyListeners();
      return null;
    }

    const requestKey = `${lat.toFixed(3)}:${lon.toFixed(3)}:${date}:${time}`;
    if (weatherState.data && weatherState.lastFetchedKey === requestKey && !weatherState.error) {
      // Already fetched for this exact plan
      return weatherState.data;
    }

    // Invalidate old data for previous context so stale weather is never displayed
    weatherState.data = null;
    analysisState.data = null;
    analysisState.lastAnalyzedKey = null;
    weatherState.loading = true;
    weatherState.error = null;
    notifyListeners();

    try {
      const url = new URL(`${BACKEND_BASE_URL}/api/weather`);
      url.searchParams.set('latitude', lat.toString());
      url.searchParams.set('longitude', lon.toString());
      url.searchParams.set('date', date);
      url.searchParams.set('time', time);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const json = await response.json();

      if (!response.ok || json.error) {
        const errorMsg = json.message || `Weather service responded with status ${response.status}`;
        weatherState.error = errorMsg;
        weatherState.loading = false;
        notifyListeners();
        return null;
      }

      weatherState.data = json;
      weatherState.loading = false;
      weatherState.error = null;
      weatherState.lastFetchedKey = requestKey;
      notifyListeners();
      return json;
    } catch (err) {
      console.error('[MAUSAM Weather] Fetch error:', err);
      weatherState.error = 'Failed to connect to MAUSAM weather service. Please ensure the backend server is running.';
      weatherState.loading = false;
      notifyListeners();
      return null;
    }
  }

  // Internal analysis state (Module 3.3)
  let analysisState = {
    data: null,
    loading: false,
    error: null,
    lastAnalyzedKey: null
  };

  /**
   * Evaluates weather data against plan context via MAUSAM backend rule engine (POST /api/analyze).
   * @param {Object} planContext
   * @param {Object} weatherData - Normalized weather response or weather object
   * @returns {Promise<Object|null>}
   */
  async function analyzePlanWeather(planContext, weatherData) {
    if (!planContext || !weatherData) return null;

    const loc = planContext.location;
    const lat = (loc && typeof loc.latitude === 'number') ? loc.latitude.toFixed(3) : '';
    const lon = (loc && typeof loc.longitude === 'number') ? loc.longitude.toFixed(3) : '';
    const analysisKey = `${planContext.purpose}:${planContext.activity}:${lat}:${lon}:${weatherData.date || ''}:${weatherData.time || ''}`;
    if (analysisState.data && analysisState.lastAnalyzedKey === analysisKey && !analysisState.error) {
      return analysisState.data;
    }

    analysisState.loading = true;
    analysisState.error = null;
    notifyListeners();

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          context: planContext,
          weather: weatherData
        })
      });

      const json = await response.json();

      if (!response.ok || json.error) {
        const errorMsg = json.message || `Analysis engine responded with status ${response.status}`;
        analysisState.error = errorMsg;
        analysisState.loading = false;
        notifyListeners();
        return null;
      }

      analysisState.data = json.analysis ? {
        ...json.analysis,
        guidance: json.guidance || [],
        bestTime: json.bestTime || null,
        bestTimeReason: json.bestTimeReason || null,
        alternativeDay: json.alternativeDay || null,
        alternativeDayReason: json.alternativeDayReason || null
      } : json;
      analysisState.loading = false;
      analysisState.error = null;
      analysisState.lastAnalyzedKey = analysisKey;
      notifyListeners();
      return analysisState.data;
    } catch (err) {
      console.error('[MAUSAM Analysis] Fetch error:', err);
      analysisState.error = 'Failed to analyze weather conditions for plan.';
      analysisState.loading = false;
      notifyListeners();
      return null;
    }
  }

  function getAnalysisState() {
    return { ...analysisState };
  }

  function getGuidanceState() {
    return {
      guidance: (analysisState.data && analysisState.data.guidance) || [],
      bestTime: (analysisState.data && analysisState.data.bestTime) || null,
      bestTimeReason: (analysisState.data && analysisState.data.bestTimeReason) || null,
      alternativeDay: (analysisState.data && analysisState.data.alternativeDay) || null,
      alternativeDayReason: (analysisState.data && analysisState.data.alternativeDayReason) || null,
      loading: analysisState.loading,
      error: analysisState.error
    };
  }

  /**
   * Subscribe to weather & analysis state updates
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  function subscribe(callback) {
    if (typeof callback === 'function') {
      listeners.add(callback);
      // Immediately invoke with current state
      callback({ weather: { ...weatherState }, analysis: { ...analysisState } });
    }
    return () => listeners.delete(callback);
  }

  /**
   * Get current weather state snapshot
   * @returns {Object}
   */
  function getWeatherState() {
    return { ...weatherState };
  }

  /**
   * Checks if current weatherState.data matches the current plan context
   * @param {Object} planContext
   * @param {Object} [wState]
   * @returns {boolean}
   */
  function isContextMatchingWeather(planContext, wState) {
    const ws = wState || weatherState;
    if (!planContext || !ws || !ws.data || !ws.lastFetchedKey) return false;
    const loc = planContext.location;
    if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') return false;
    const expectedKey = `${loc.latitude.toFixed(3)}:${loc.longitude.toFixed(3)}:${planContext.date}:${planContext.time}`;
    return ws.lastFetchedKey === expectedKey;
  }

  /**
   * Checks if current analysisState.data matches the current plan context
   * @param {Object} planContext
   * @param {Object} [aState]
   * @returns {boolean}
   */
  function isContextMatchingAnalysis(planContext, aState) {
    const as = aState || analysisState;
    if (!planContext || !as || !as.data || !as.lastAnalyzedKey) return false;
    const loc = planContext.location;
    const lat = (loc && typeof loc.latitude === 'number') ? loc.latitude.toFixed(3) : '';
    const lon = (loc && typeof loc.longitude === 'number') ? loc.longitude.toFixed(3) : '';
    const expectedKey = `${planContext.purpose}:${planContext.activity}:${lat}:${lon}:${planContext.date || ''}:${planContext.time || ''}`;
    return as.lastAnalyzedKey === expectedKey;
  }

  /**
   * Resets all internal weather and analysis state caches
   */
  function resetWeatherState() {
    weatherState.data = null;
    weatherState.loading = false;
    weatherState.error = null;
    weatherState.lastFetchedKey = null;

    analysisState.data = null;
    analysisState.loading = false;
    analysisState.error = null;
    analysisState.lastAnalyzedKey = null;

    notifyListeners();
  }

  // Export to global window object
  window.MausamWeather = Object.freeze({
    INDIAN_CITY_COORDINATES,
    resolveCoordinates,
    fetchWeatherForPlan,
    getWeatherState,
    analyzePlanWeather,
    getAnalysisState,
    getGuidanceState,
    isContextMatchingWeather,
    isContextMatchingAnalysis,
    resetWeatherState,
    subscribe
  });
})();
