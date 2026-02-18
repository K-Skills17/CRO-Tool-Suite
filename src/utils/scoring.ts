/**
 * Scoring Utilities
 * Handles score calculations, normalization, grading, and revenue impact estimation.
 */

import type { ScoringWeights, ConversionBenchmarks } from '@/config/healthcare-verticals';
import type { AuditCategory } from '@/config/audit-checklist';

export interface CategoryScore {
  category: AuditCategory;
  score: number;       // 0-100
  maxPossible: number;
  passedChecks: number;
  totalChecks: number;
  grade: ScoreGrade;
  details: CheckResult[];
}

export interface CheckResult {
  checkpointId: string;
  name: string;
  passed: boolean;
  score: number;
  maxScore: number;
  finding: string;
}

export interface OverallScore {
  total: number; // 0-100
  grade: ScoreGrade;
  categories: Record<AuditCategory, CategoryScore>;
  benchmarkComparison: BenchmarkComparison;
}

export interface BenchmarkComparison {
  currentEstimatedCR: number;
  industryAverage: number;
  industryGood: number;
  industryExcellent: number;
  percentile: number;
  gapToAverage: number;
  potentialRevenueGain: number;
}

export type ScoreGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

export function getGrade(score: number): ScoreGrade {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 78) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C+';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#84cc16'; // lime
  if (score >= 40) return '#eab308'; // yellow
  if (score >= 20) return '#f97316'; // orange
  return '#ef4444';                  // red
}

export function calculateWeightedTotal(
  categoryScores: Record<AuditCategory, CategoryScore>,
  weights: ScoringWeights
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  const weightMap: Record<AuditCategory, number> = {
    visualHierarchy: weights.visualHierarchy,
    copyEffectiveness: weights.copyEffectiveness,
    trustCredibility: weights.trustCredibility,
    conversionFriction: weights.conversionFriction,
    mobileOptimization: weights.mobileOptimization,
    ctaOptimization: weights.ctaOptimization,
    compliancePrivacy: weights.compliancePrivacy,
  };

  for (const [cat, catScore] of Object.entries(categoryScores)) {
    const weight = weightMap[cat as AuditCategory] || 0;
    weightedSum += catScore.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

export function estimateConversionRate(
  overallScore: number,
  benchmarks: ConversionBenchmarks
): number {
  // Map 0-100 score to conversion rate range for the vertical
  const minCR = benchmarks.average * 0.3; // worst case
  const maxCR = benchmarks.excellent * 1.1; // best case
  return Number((minCR + (maxCR - minCR) * (overallScore / 100)).toFixed(2));
}

export function calculateBenchmarkComparison(
  overallScore: number,
  benchmarks: ConversionBenchmarks,
  monthlyTraffic: number = 1000,
  avgTransactionValue: number = 500
): BenchmarkComparison {
  const estimatedCR = estimateConversionRate(overallScore, benchmarks);
  const gapToAverage = Math.max(0, benchmarks.average - estimatedCR);
  const potentialAdditionalConversions = monthlyTraffic * (gapToAverage / 100);
  const potentialRevenueGain = Math.round(potentialAdditionalConversions * avgTransactionValue);

  let percentile: number;
  if (estimatedCR >= benchmarks.excellent) percentile = 95;
  else if (estimatedCR >= benchmarks.good) percentile = 75;
  else if (estimatedCR >= benchmarks.average) percentile = 50;
  else percentile = Math.round((estimatedCR / benchmarks.average) * 50);

  return {
    currentEstimatedCR: estimatedCR,
    industryAverage: benchmarks.average,
    industryGood: benchmarks.good,
    industryExcellent: benchmarks.excellent,
    percentile,
    gapToAverage,
    potentialRevenueGain,
  };
}

export function generatePriorityRecommendations(
  categoryScores: Record<AuditCategory, CategoryScore>,
  weights: ScoringWeights
): { category: AuditCategory; impact: number; effort: string; recommendation: string }[] {
  const weightMap: Record<AuditCategory, number> = {
    visualHierarchy: weights.visualHierarchy,
    copyEffectiveness: weights.copyEffectiveness,
    trustCredibility: weights.trustCredibility,
    conversionFriction: weights.conversionFriction,
    mobileOptimization: weights.mobileOptimization,
    ctaOptimization: weights.ctaOptimization,
    compliancePrivacy: weights.compliancePrivacy,
  };

  return Object.entries(categoryScores)
    .map(([cat, catScore]) => {
      const category = cat as AuditCategory;
      const weight = weightMap[category] || 0;
      const improvementRoom = 100 - catScore.score;
      const impact = improvementRoom * weight;
      return {
        category,
        impact: Math.round(impact * 100) / 100,
        effort: improvementRoom > 40 ? 'High' : improvementRoom > 20 ? 'Medium' : 'Low',
        recommendation: getRecommendation(category, catScore.score),
      };
    })
    .sort((a, b) => b.impact - a.impact);
}

function getRecommendation(category: AuditCategory, score: number): string {
  const recommendations: Record<AuditCategory, Record<string, string>> = {
    visualHierarchy: {
      low: 'Redesign page layout with clear visual hierarchy. Ensure H1 is prominent and sections are well-separated.',
      mid: 'Improve spacing, typography consistency, and visual flow. Add directional cues toward CTAs.',
      high: 'Fine-tune visual details. Consider A/B testing layout variations.',
    },
    copyEffectiveness: {
      low: 'Rewrite copy to focus on patient benefits. Simplify reading level and add emotional triggers.',
      mid: 'Strengthen headlines, add objection handling, and include more benefit-focused language.',
      high: 'Test copy variations. Consider adding patient language from reviews.',
    },
    trustCredibility: {
      low: 'Add testimonials, credentials, and trust signals immediately. Display phone number and address.',
      mid: 'Enhance trust with more reviews, before/after photos, and professional bios.',
      high: 'Add video testimonials and detailed case studies for maximum trust.',
    },
    conversionFriction: {
      low: 'Simplify forms, add click-to-call, and remove unnecessary steps from conversion path.',
      mid: 'Reduce form fields, add WhatsApp, and improve booking flow.',
      high: 'Optimize micro-interactions and add sticky CTAs for seamless conversion.',
    },
    mobileOptimization: {
      low: 'Implement responsive design urgently. Mobile traffic is likely 60%+ of total.',
      mid: 'Fix touch targets, improve mobile navigation, and optimize load speed.',
      high: 'Fine-tune thumb-zone placement and test on multiple devices.',
    },
    ctaOptimization: {
      low: 'Add clear, action-oriented CTAs above the fold and throughout the page.',
      mid: 'Improve CTA copy specificity, add multiple CTAs, and test button design.',
      high: 'A/B test CTA copy, colors, and placement for optimization.',
    },
    compliancePrivacy: {
      low: 'Add privacy policy, cookie consent, and ensure HTTPS. Critical for trust.',
      mid: 'Improve data handling disclosures and add professional licensing information.',
      high: 'Review accessibility compliance and add LGPD-specific language.',
    },
  };

  const level = score < 40 ? 'low' : score < 70 ? 'mid' : 'high';
  return recommendations[category]?.[level] || 'Review and improve this area.';
}
