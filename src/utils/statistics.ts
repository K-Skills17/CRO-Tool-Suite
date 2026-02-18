/**
 * Statistical Utilities
 * Sample size calculations, confidence intervals, and test duration estimates.
 * Used by Tool 4's A/B test calculator and testing prioritizer.
 */

export interface SampleSizeResult {
  samplePerVariation: number;
  totalSample: number;
  estimatedDays: number;
  confidence: number;
  power: number;
}

export interface TestResult {
  isSignificant: boolean;
  confidence: number;
  pValue: number;
  controlCR: number;
  variationCR: number;
  absoluteLift: number;
  relativeLift: number;
  revenueImpact: number;
}

// Z-scores for common confidence levels
const Z_SCORES: Record<number, number> = {
  80: 1.28,
  85: 1.44,
  90: 1.645,
  95: 1.96,
  99: 2.576,
};

/**
 * Calculate required sample size for an A/B test.
 */
export function calculateSampleSize(
  baselineRate: number,
  minimumDetectableEffect: number,
  confidenceLevel: number = 95,
  power: number = 80
): SampleSizeResult {
  if (baselineRate <= 0 || baselineRate >= 1) {
    throw new Error('[STATS_ERROR] Baseline rate must be between 0 and 1 (exclusive)');
  }
  if (minimumDetectableEffect <= 0) {
    throw new Error('[STATS_ERROR] Minimum detectable effect must be positive');
  }

  const zAlpha = Z_SCORES[confidenceLevel] || 1.96;
  const zBeta = Z_SCORES[power] || 0.84;

  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minimumDetectableEffect);
  const pAvg = (p1 + p2) / 2;

  const numerator = Math.pow(zAlpha * Math.sqrt(2 * pAvg * (1 - pAvg)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
  const denominator = Math.pow(p2 - p1, 2);

  const samplePerVariation = Math.ceil(numerator / denominator);

  return {
    samplePerVariation,
    totalSample: samplePerVariation * 2,
    estimatedDays: 0, // Calculated separately with traffic data
    confidence: confidenceLevel,
    power,
  };
}

/**
 * Estimate test duration based on daily traffic.
 */
export function estimateTestDuration(
  totalSampleNeeded: number,
  dailyTraffic: number,
  percentageAllocated: number = 100
): number {
  if (dailyTraffic <= 0) return Infinity;
  const effectiveTraffic = dailyTraffic * (percentageAllocated / 100);
  return Math.ceil(totalSampleNeeded / effectiveTraffic);
}

/**
 * Analyze A/B test results for statistical significance.
 */
export function analyzeTestResults(
  controlVisitors: number,
  controlConversions: number,
  variationVisitors: number,
  variationConversions: number,
  avgTransactionValue: number = 0
): TestResult {
  if (controlVisitors <= 0 || variationVisitors <= 0) {
    throw new Error('[STATS_ERROR] Visitor counts must be positive');
  }

  const p1 = controlConversions / controlVisitors;
  const p2 = variationConversions / variationVisitors;
  const pPool = (controlConversions + variationConversions) / (controlVisitors + variationVisitors);

  const se = Math.sqrt(pPool * (1 - pPool) * (1 / controlVisitors + 1 / variationVisitors));
  const zScore = se > 0 ? (p2 - p1) / se : 0;

  // Two-tailed p-value approximation
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  const absoluteLift = p2 - p1;
  const relativeLift = p1 > 0 ? (absoluteLift / p1) * 100 : 0;
  const monthlyRevenueImpact = avgTransactionValue > 0
    ? Math.round(absoluteLift * variationVisitors * 30 * avgTransactionValue)
    : 0;

  return {
    isSignificant: pValue < 0.05,
    confidence: Math.round((1 - pValue) * 100 * 100) / 100,
    pValue: Math.round(pValue * 10000) / 10000,
    controlCR: Math.round(p1 * 10000) / 100,
    variationCR: Math.round(p2 * 10000) / 100,
    absoluteLift: Math.round(absoluteLift * 10000) / 100,
    relativeLift: Math.round(relativeLift * 100) / 100,
    revenueImpact: monthlyRevenueImpact,
  };
}

// Standard normal CDF approximation (Abramowitz and Stegun)
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * PIE Framework scoring for test prioritization.
 */
export interface PIEScore {
  potential: number; // 1-10
  importance: number; // 1-10
  ease: number; // 1-10
  total: number; // average
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
}

export function calculatePIEScore(
  potential: number,
  importance: number,
  ease: number
): PIEScore {
  const total = Math.round(((potential + importance + ease) / 3) * 10) / 10;
  let priority: PIEScore['priority'];
  if (total >= 8) priority = 'Critical';
  else if (total >= 6) priority = 'High';
  else if (total >= 4) priority = 'Medium';
  else priority = 'Low';

  return { potential, importance, ease, total, priority };
}

/**
 * ROI Calculator
 */
export interface ROIResult {
  currentMonthlyConversions: number;
  projectedMonthlyConversions: number;
  additionalConversions: number;
  currentMonthlyRevenue: number;
  projectedMonthlyRevenue: number;
  additionalMonthlyRevenue: number;
  additionalAnnualRevenue: number;
  serviceFeeROI: number;
}

export function calculateROI(
  monthlyTraffic: number,
  currentCR: number,
  projectedCRLift: number,
  avgTransactionValue: number,
  monthlyServiceFee: number = 0
): ROIResult {
  const currentConversions = monthlyTraffic * (currentCR / 100);
  const newCR = currentCR * (1 + projectedCRLift / 100);
  const projectedConversions = monthlyTraffic * (newCR / 100);
  const additionalConversions = projectedConversions - currentConversions;
  const currentRevenue = currentConversions * avgTransactionValue;
  const projectedRevenue = projectedConversions * avgTransactionValue;
  const additionalMonthly = projectedRevenue - currentRevenue;

  return {
    currentMonthlyConversions: Math.round(currentConversions),
    projectedMonthlyConversions: Math.round(projectedConversions),
    additionalConversions: Math.round(additionalConversions),
    currentMonthlyRevenue: Math.round(currentRevenue),
    projectedMonthlyRevenue: Math.round(projectedRevenue),
    additionalMonthlyRevenue: Math.round(additionalMonthly),
    additionalAnnualRevenue: Math.round(additionalMonthly * 12),
    serviceFeeROI: monthlyServiceFee > 0 ? Math.round((additionalMonthly / monthlyServiceFee) * 100) : 0,
  };
}
