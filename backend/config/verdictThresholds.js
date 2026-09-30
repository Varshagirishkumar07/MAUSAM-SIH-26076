/**
 * MAUSAM Backend - Centralized Verdict Thresholds Configuration
 * Module 3.3: Weather Analysis + Personalization Rule Engine
 * 
 * IMPORTANT:
 * These thresholds are defined per the project TRD and design specifications.
 * They represent configurable heuristic baselines and are labeled internally
 * as CONFIGURABLE_THRESHOLD / TEAM_DEFAULT.
 * They should NOT be presented as official IMD scientific citations.
 */

export const VERDICT_THRESHOLDS = Object.freeze({
  thresholdType: 'CONFIGURABLE_THRESHOLD',
  
  // Score boundaries (0 to 100)
  GO_MIN_SCORE: 70,        // Score >= 70: Favorable conditions
  CAUTION_MIN_SCORE: 40,   // Score >= 40 and < 70: Notable weather factors
  // Score < 40: Adverse/Unfavorable conditions (AVOID)

  // Minimum fraction of total factor weight required to evaluate with confidence
  DATA_QUALITY_MIN_WEIGHT: 0.5,

  // Verdict definitions
  VERDICTS: Object.freeze({
    GO: {
      id: 'GO',
      label: 'GO',
      title: 'Favorable Conditions',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Weather conditions are well-suited for your planned activity.'
    },
    CAUTION: {
      id: 'CAUTION',
      label: 'CAUTION',
      title: 'Plan With Caution',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      description: 'Moderate weather friction or risks present. Plan with care.'
    },
    AVOID: {
      id: 'AVOID',
      label: 'AVOID',
      title: 'Adverse Conditions',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      description: 'Unfavorable or hazardous conditions for this specific activity.'
    }
  })
});

/**
 * Maps a calculated score (0-100) to its verdict
 * @param {number|null} score
 * @returns {'GO'|'CAUTION'|'AVOID'}
 */
export function getVerdictFromScore(score) {
  if (score === null || score === undefined || typeof score !== 'number' || Number.isNaN(score)) {
    return 'CAUTION';
  }
  if (score >= VERDICT_THRESHOLDS.GO_MIN_SCORE) {
    return 'GO';
  }
  if (score >= VERDICT_THRESHOLDS.CAUTION_MIN_SCORE) {
    return 'CAUTION';
  }
  return 'AVOID';
}

export default VERDICT_THRESHOLDS;
