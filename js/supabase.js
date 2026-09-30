/**
 * MAUSAM - Supabase Database Client & Connection Service
 * Module 2.3: Database Setup + Connection Verification
 * 
 * Centralized, modular service for external PostgreSQL connectivity via Supabase.
 * Enforces strict client-side security:
 * 1. Only accepts public anonymous keys (never service_role keys).
 * 2. Does not bypass or disable Row Level Security (RLS).
 * 3. Gracefully reports missing/invalid configuration without crashing the application.
 * 4. Completely isolated from local MausamState (no premature auto-saving).
 */

(function () {
  'use strict';

  // Cached singleton client instance
  let clientInstance = null;
  let initError = null;

  /**
   * Safely read configuration without throwing
   * Looks up window.MAUSAM_CONFIG (from js/config.js) or localStorage fallbacks for tests
   * @returns {{ url: string|null, anonKey: string|null }}
   */
  function getConfig() {
    let url = null;
    let anonKey = null;

    if (typeof window !== 'undefined') {
      if (window.MAUSAM_CONFIG && typeof window.MAUSAM_CONFIG === 'object') {
        url = typeof window.MAUSAM_CONFIG.SUPABASE_URL === 'string' ? window.MAUSAM_CONFIG.SUPABASE_URL.trim() : null;
        anonKey = typeof window.MAUSAM_CONFIG.SUPABASE_ANON_KEY === 'string' ? window.MAUSAM_CONFIG.SUPABASE_ANON_KEY.trim() : null;
      }

      // Optional test/dev fallback from localStorage (if configured manually in browser)
      if (!url && window.localStorage) {
        url = window.localStorage.getItem('mausam_supabase_url');
      }
      if (!anonKey && window.localStorage) {
        anonKey = window.localStorage.getItem('mausam_supabase_anon_key');
      }
    }

    return {
      url: url && url.length > 0 ? url : null,
      anonKey: anonKey && anonKey.length > 0 ? anonKey : null
    };
  }

  /**
   * Security Check: Prevent accidental exposure of service_role key
   * @param {string} key
   * @returns {boolean} True if key appears to be a service_role key
   */
  function isPrivilegedKey(key) {
    if (!key || typeof key !== 'string') return false;
    // Check for common indicators of service_role JWT
    try {
      const parts = key.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload && payload.role === 'service_role') {
          return true;
        }
      }
    } catch (e) {
      // Ignore parsing errors for non-JWT keys
    }
    return key.toLowerCase().includes('service_role');
  }

  /**
   * Validates if a URL is structurally valid
   * @param {string} urlStr
   * @returns {boolean}
   */
  function isValidUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return false;
    try {
      const parsed = new URL(urlStr);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch (e) {
      return false;
    }
  }

  let cachedUrl = null;
  let cachedKey = null;

  /**
   * Initialize or retrieve the Supabase client singleton
   * Automatically invalidates cached client if configuration changes
   * @returns {Object|null}
   */
  function getClient() {
    const { url, anonKey } = getConfig();

    if (clientInstance && cachedUrl === url && cachedKey === anonKey) {
      return clientInstance;
    }

    clientInstance = null;
    cachedUrl = url;
    cachedKey = anonKey;

    // Check if Supabase JS SDK is loaded in the browser
    const sdkAvailable = typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function';

    if (!sdkAvailable) {
      initError = 'Supabase JS library not loaded. Check CDN script tag in index.html.';
      return null;
    }

    if (!url || !anonKey) {
      initError = 'Supabase credentials not configured. Please define SUPABASE_URL and SUPABASE_ANON_KEY in js/config.js.';
      return null;
    }

    if (!isValidUrl(url)) {
      initError = 'Invalid SUPABASE_URL format. Must be a valid HTTP/HTTPS URL.';
      console.warn('[MAUSAM Supabase] Configuration error:', initError);
      return null;
    }

    // Security enforcement: Reject service_role keys
    if (isPrivilegedKey(anonKey)) {
      initError = 'CRITICAL SECURITY ERROR: service_role key detected. Never use privileged keys in client-side code.';
      console.error('[MAUSAM Supabase]', initError);
      return null;
    }

    try {
      clientInstance = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
      initError = null;
      console.log('[MAUSAM Supabase] Client initialized successfully with anonymous public key.');
      return clientInstance;
    } catch (err) {
      initError = `Initialization error: ${err.message || err}`;
      console.error('[MAUSAM Supabase] Failed to initialize client:', err.message || err);
      return null;
    }
  }

  function resetClient() {
    clientInstance = null;
    cachedUrl = null;
    cachedKey = null;
    initError = null;
  }

  /**
   * Check configuration status
   * @returns {{ isConfigured: boolean, hasUrl: boolean, hasAnonKey: boolean, hasSdk: boolean, message: string }}
   */
  function getStatus() {
    const { url, anonKey } = getConfig();
    const hasSdk = typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function';
    const isConfigured = Boolean(hasSdk && url && anonKey && isValidUrl(url) && !isPrivilegedKey(anonKey));

    let message = 'Supabase client ready.';
    if (!hasSdk) message = 'Supabase SDK not loaded in browser.';
    else if (!url && !anonKey) message = 'Supabase is not configured. Add credentials to js/config.js.';
    else if (!url) message = 'SUPABASE_URL is missing in js/config.js.';
    else if (!anonKey) message = 'SUPABASE_ANON_KEY is missing in js/config.js.';
    else if (!isValidUrl(url)) message = 'SUPABASE_URL has invalid format.';
    else if (isPrivilegedKey(anonKey)) message = 'Security violation: service_role key must not be used in frontend.';

    return {
      isConfigured,
      hasUrl: Boolean(url),
      hasAnonKey: Boolean(anonKey),
      hasSdk: Boolean(hasSdk),
      message
    };
  }

  /**
   * Safe, non-destructive connection test
   * Tests reachability without modifying or deleting data.
   * Respects RLS and reports table-level security status accurately.
   * @returns {Promise<{ success: boolean, status: string, message: string, latencyMs?: number, httpStatus?: number }>}
   */
  async function checkConnection() {
    const status = getStatus();

    if (!status.isConfigured) {
      console.warn('[MAUSAM Supabase Connection Test] Not configured:', status.message);
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        message: status.message
      };
    }

    const client = getClient();
    if (!client) {
      return {
        success: false,
        status: 'INIT_FAILED',
        message: initError || 'Client initialization failed.'
      };
    }

    const startTime = Date.now();

    try {
      // Safe, non-destructive read checking 'saved_plans' table under RLS policies
      const { data, error, status: httpStatus } = await client
        .from('saved_plans')
        .select('id')
        .limit(1);

      const latencyMs = Date.now() - startTime;

      // Case A: Query succeeded cleanly (HTTP 200)
      if (!error && (httpStatus === 200 || httpStatus === 206)) {
        return {
          success: true,
          status: 'CONNECTED',
          message: 'Connected to Supabase successfully. Database responds with HTTP 200.',
          latencyMs,
          httpStatus,
          recordCount: Array.isArray(data) ? data.length : 0
        };
      }

      // Case B: Table-level RLS restrictions (Error 42501 / 403 or specific RLS denial)
      // As per Module 2.3 security specifications:
      // "If the connection test cannot safely query saved_plans because no anonymous SELECT policy exists,
      // report that the Supabase project/client connection is configured successfully but table-level anonymous access is intentionally not enabled yet."
      if (error && (error.code === '42501' || httpStatus === 403 || (error.message && error.message.toLowerCase().includes('row-level security')))) {
        return {
          success: true,
          status: 'CONNECTED_RLS_RESTRICTED',
          message: 'Supabase project connection verified successfully. Table "saved_plans" is secured with RLS (anonymous SELECT is intentionally restricted in Module 2.3).',
          latencyMs,
          httpStatus
        };
      }

      // Case C: Table does not exist (Error 42P01 / PGRST205 / 404)
      if (error && (error.code === '42P01' || error.code === 'PGRST205' || httpStatus === 404)) {
        return {
          success: false,
          status: 'TABLE_NOT_FOUND',
          message: 'Supabase endpoint reached, but table "saved_plans" was not found. Please run schema.sql in your Supabase SQL Editor.',
          latencyMs,
          httpStatus,
          error: error.message
        };
      }

      // Case D: Invalid public/anon API key (HTTP 401 Unauthorized)
      if (httpStatus === 401 || (error && error.message && error.message.toLowerCase().includes('invalid api key'))) {
        return {
          success: false,
          status: 'INVALID_KEY',
          message: 'Supabase authentication failed: 401 Unauthorized. Please verify your public anon key in js/config.js.',
          latencyMs,
          httpStatus
        };
      }

      // Case E: Network error returned in error object (e.g. Failed to fetch / DNS failure)
      if (error && error.message && (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network'))) {
        return {
          success: false,
          status: 'NETWORK_ERROR',
          message: 'Network request to Supabase endpoint failed. Please check network connection and SUPABASE_URL.',
          latencyMs,
          httpStatus
        };
      }

      // Case F: Other database error
      return {
        success: false,
        status: 'DATABASE_ERROR',
        message: error ? error.message : 'Unknown database error occurred.',
        latencyMs,
        httpStatus
      };

    } catch (netErr) {
      const latencyMs = Date.now() - startTime;
      console.warn('[MAUSAM Supabase] Network communication error:', netErr.message || netErr);
      return {
        success: false,
        status: 'NETWORK_ERROR',
        message: 'Network request to Supabase endpoint failed. Please check network connection and SUPABASE_URL.',
        latencyMs
      };
    }
  }

  // --- Module 2.4: Plan Persistence & State Mapping ---

  /**
   * Convert application MausamState structure into saved_plans database record format.
   * Ensures zero fake coordinates (null remains null).
   * @param {Object} state
   * @returns {Object}
   */
  function stateToDbPlan(state) {
    if (!state || typeof state !== 'object') {
      throw new Error('Invalid state provided to stateToDbPlan.');
    }
    const locName = typeof state.location === 'object' && state.location !== null
      ? (state.location.name || '')
      : (typeof state.location === 'string' ? state.location : '');

    const lat = (typeof state.location === 'object' && state.location !== null && typeof state.location.latitude === 'number')
      ? state.location.latitude
      : null;

    const lng = (typeof state.location === 'object' && state.location !== null && typeof state.location.longitude === 'number')
      ? state.location.longitude
      : null;

    let plannedTime = state.time || null;
    if (plannedTime && typeof plannedTime === 'string') {
      const match = plannedTime.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        plannedTime = `${match[1].padStart(2, '0')}:${match[2]}:00`;
      }
    }

    return {
      language: state.language || '',
      purpose: state.purpose || '',
      activity: state.activity || '',
      location_name: locName.trim(),
      latitude: lat,
      longitude: lng,
      planned_date: state.date || '',
      planned_time: plannedTime,
      status: 'active'
    };
  }

  /**
   * Convert saved_plans database record format back into MausamState structure.
   * @param {Object} row
   * @returns {Object}
   */
  function dbPlanToState(row) {
    if (!row || typeof row !== 'object') {
      throw new Error('Invalid row provided to dbPlanToState.');
    }

    let timeNormalized = null;
    if (row.planned_time) {
      const timeStr = String(row.planned_time);
      const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        timeNormalized = `${match[1].padStart(2, '0')}:${match[2]}`;
      }
    }

    return {
      language: row.language || null,
      purpose: row.purpose || null,
      activity: row.activity || null,
      location: {
        name: row.location_name || '',
        latitude: typeof row.latitude === 'number' ? row.latitude : null,
        longitude: typeof row.longitude === 'number' ? row.longitude : null
      },
      date: row.planned_date || null,
      time: timeNormalized
    };
  }

  /**
   * Validates if a state object has all 6 planning fields populated and structurally valid.
   * @param {Object} state
   * @returns {{ isValid: boolean, message: string }}
   */
  function validatePlanContext(state) {
    if (!state || typeof state !== 'object') {
      return { isValid: false, message: 'Invalid plan object.' };
    }
    if (typeof window !== 'undefined' && window.MausamState && typeof window.MausamState.isContextComplete === 'function') {
      const valid = window.MausamState.isContextComplete(state);
      return {
        isValid: valid,
        message: valid ? '' : 'Incomplete planning context. All 6 fields (language, purpose, activity, location, date, time) are required.'
      };
    }
    // Standalone fallback validation
    if (!state.language) return { isValid: false, message: 'Language is required.' };
    if (!state.purpose) return { isValid: false, message: 'Purpose is required.' };
    if (!state.activity) return { isValid: false, message: 'Activity is required.' };
    const locName = typeof state.location === 'object' && state.location !== null ? state.location.name : state.location;
    if (!locName || typeof locName !== 'string' || locName.trim().length === 0) return { isValid: false, message: 'Location is required.' };
    if (!state.date || !/^\d{4}-\d{2}-\d{2}$/.test(String(state.date).trim())) return { isValid: false, message: 'Valid date is required.' };
    if (!state.time) return { isValid: false, message: 'Time is required.' };
    return { isValid: true, message: '' };
  }

  /**
   * Explicitly save a completed plan to the Supabase database.
   * Never triggered automatically on state change.
   * If client is not configured, or if RLS restricts anonymous insertion,
   * returns a structured failure without crashing or wiping local state.
   * @param {Object} [planInput] - Optional plan snapshot; defaults to window.MausamState.getState()
   * @returns {Promise<{ success: boolean, planId?: string, data?: Object, error?: string, code?: string, message: string, localFallback: boolean }>}
   */
  async function savePlan(planInput) {
    const plan = planInput || (typeof window !== 'undefined' && window.MausamState ? window.MausamState.getState() : null);

    const validation = validatePlanContext(plan);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'VALIDATION_FAILED',
        message: validation.message,
        localFallback: true
      };
    }

    const client = getClient();
    if (!client) {
      return {
        success: false,
        error: 'NOT_CONFIGURED',
        message: 'Supabase credentials not configured. Your plan is preserved locally on this device.',
        localFallback: true
      };
    }

    try {
      const payload = stateToDbPlan(plan);
      const { data, error, status } = await client
        .from('saved_plans')
        .insert([payload])
        .select()
        .single();

      if (error) {
        const isRls = error.code === '42501' || status === 403 || (error.message && error.message.toLowerCase().includes('row-level security'));
        return {
          success: false,
          error: isRls ? 'RLS_RESTRICTED' : (error.code || 'DATABASE_ERROR'),
          code: error.code,
          status,
          message: 'Your plan could not be saved online. Your current plan is still available on this device.',
          detail: error.message,
          localFallback: true
        };
      }

      if (!data || !data.id) {
        return {
          success: false,
          error: 'NO_DATA_RETURNED',
          message: 'Plan saved, but no record ID was returned.',
          localFallback: true
        };
      }

      return {
        success: true,
        planId: data.id,
        data,
        message: 'Plan saved successfully.',
        localFallback: false
      };
    } catch (err) {
      console.warn('[MAUSAM Supabase] savePlan exception:', err.message || err);
      return {
        success: false,
        error: 'NETWORK_OR_CLIENT_ERROR',
        message: 'Your plan could not be saved online. Your current plan is still available on this device.',
        detail: err.message || String(err),
        localFallback: true
      };
    }
  }

  /**
   * Retrieve a saved plan from Supabase by its UUID.
   * Converts the database record back into a MausamState-compatible object.
   * @param {string} planId - UUID of the saved plan
   * @returns {Promise<{ success: boolean, planId?: string, state?: Object, raw?: Object, error?: string, message: string }>}
   */
  async function getSavedPlan(planId) {
    if (!planId || typeof planId !== 'string') {
      return {
        success: false,
        error: 'INVALID_ID',
        message: 'Plan ID must be a non-empty string.'
      };
    }

    const trimmedId = planId.trim();
    // Validate UUID structure (RFC 4122)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedId)) {
      return {
        success: false,
        error: 'INVALID_UUID_FORMAT',
        message: 'Plan ID is not a valid UUID.'
      };
    }

    const client = getClient();
    if (!client) {
      return {
        success: false,
        error: 'NOT_CONFIGURED',
        message: 'Supabase credentials not configured.'
      };
    }

    try {
      const { data, error, status } = await client
        .from('saved_plans')
        .select('*')
        .eq('id', trimmedId)
        .single();

      if (error) {
        const isRls = error.code === '42501' || status === 403 || (error.message && error.message.toLowerCase().includes('row-level security'));
        return {
          success: false,
          error: isRls ? 'RLS_RESTRICTED' : (error.code || 'DATABASE_ERROR'),
          status,
          message: isRls
            ? 'Access to this saved plan is restricted by Row Level Security.'
            : (error.message || 'Plan could not be retrieved.')
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'NOT_FOUND',
          status: 404,
          message: 'Saved plan not found.'
        };
      }

      const mappedState = dbPlanToState(data);
      return {
        success: true,
        planId: data.id,
        state: mappedState,
        raw: data,
        message: 'Saved plan retrieved successfully.'
      };
    } catch (err) {
      console.warn('[MAUSAM Supabase] getSavedPlan exception:', err.message || err);
      return {
        success: false,
        error: 'NETWORK_OR_CLIENT_ERROR',
        message: 'Failed to retrieve saved plan due to a network or client error.',
        detail: err.message || String(err)
      };
    }
  }

  /**
   * Retrieve a saved plan from Supabase and hydrate it into window.MausamState.
   * Updates in-memory state and localStorage.
   * @param {string} planId
   * @returns {Promise<{ success: boolean, state?: Object, error?: string, message: string }>}
   */
  async function loadSavedPlan(planId) {
    const result = await getSavedPlan(planId);
    if (!result.success) {
      return result;
    }

    if (typeof window !== 'undefined' && window.MausamState && typeof window.MausamState.setState === 'function') {
      window.MausamState.setState(result.state);
      return {
        success: true,
        planId: result.planId,
        state: window.MausamState.getState(),
        message: 'Saved plan loaded into application context successfully.'
      };
    }

    return {
      success: false,
      error: 'STATE_MANAGER_UNAVAILABLE',
      message: 'MausamState is not available to load plan.'
    };
  }

  // Export to global namespace
  window.MausamDb = Object.freeze({
    getClient,
    resetClient,
    getStatus,
    checkConnection,
    savePlan,
    getSavedPlan,
    loadSavedPlan,
    stateToDbPlan,
    dbPlanToState,
    validatePlanContext,
    getConfig: () => {
      // Expose sanitized config (never returns anonKey directly)
      const { url } = getConfig();
      return { url };
    }
  });

  // Log status on mount
  const initialStatus = getStatus();
  if (initialStatus.isConfigured) {
    console.log('[MAUSAM Supabase] Configuration detected. Database client ready.');
  } else {
    console.info('[MAUSAM Supabase] Initialized in local mode:', initialStatus.message);
  }

})();
