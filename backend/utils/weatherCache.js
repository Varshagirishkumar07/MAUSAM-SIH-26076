/**
 * MAUSAM Backend - Simple In-Memory Weather Cache
 * Module 3.2: Connect Real Weather API (Open-Meteo)
 * 
 * Safe, minimal in-memory cache to prevent redundant external API hits.
 * - Cache key includes latitude (to 3 decimals / ~100m), longitude, and date.
 * - Explicit expiration timestamp (TTL).
 * - Preserves original fetchedAt timestamp so data is never misrepresented as fresh.
 * - Never serves one location's cache to another location.
 */

import config from '../config/index.js';

class WeatherCache {
  constructor(ttlMs = config.openMeteo.cacheTtlMs) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  /**
   * Generates a safe, location-specific cache key
   * @param {number} latitude
   * @param {number} longitude
   * @param {string} date - YYYY-MM-DD
   * @returns {string}
   */
  generateKey(latitude, longitude, date) {
    const latKey = Number(latitude).toFixed(3);
    const lonKey = Number(longitude).toFixed(3);
    return `${latKey}:${lonKey}:${date}`;
  }

  /**
   * Retrieves an item from cache if not expired
   * @param {string} key
   * @returns {Object|null}
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Stores an item with explicit expiration
   * @param {string} key
   * @param {Object} rawData - Open-Meteo raw response
   * @param {string} fetchedAt - ISO timestamp of fetch
   */
  set(key, rawData, fetchedAt) {
    const now = Date.now();
    this.store.set(key, {
      rawData,
      fetchedAt,
      cachedAt: new Date(now).toISOString(),
      expiresAt: now + this.ttlMs
    });

    // Clean up expired entries if store grows
    if (this.store.size > 200) {
      this.cleanup();
    }
  }

  /**
   * Evicts expired cache entries
   */
  cleanup() {
    const now = Date.now();
    for (const [k, v] of this.store.entries()) {
      if (now > v.expiresAt) {
        this.store.delete(k);
      }
    }
  }

  /**
   * Clears entire cache
   */
  clear() {
    this.store.clear();
  }

  /**
   * Current number of entries
   */
  get size() {
    return this.store.size;
  }
}

export const weatherCache = new WeatherCache();
export default weatherCache;
