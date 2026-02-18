/**
 * Competitor Analyzer
 * Compares multiple audit results to identify competitive gaps and opportunities.
 * The first audit in the array is treated as the "primary" site (the client's site).
 */

import type { AuditResult } from './audit-engine';
import type { AuditCategory } from '@/config/audit-checklist';
import { AUDIT_CATEGORY_LABELS } from '@/config/audit-checklist';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SiteSummary {
  url: string;
  overallScore: number;
  overallGrade: string;
  categoryScores: Record<AuditCategory, number>;
}

export interface CategoryRanking {
  category: AuditCategory;
  label: string;
  rankings: { url: string; score: number; rank: number }[];
  bestSite: string;
  bestScore: number;
}

export interface CompetitiveGap {
  category: AuditCategory;
  label: string;
  primaryScore: number;
  bestCompetitorScore: number;
  gap: number;
  severity: 'critical' | 'moderate' | 'minor';
}

export interface Opportunity {
  category: AuditCategory;
  label: string;
  primaryScore: number;
  competitorAverage: number;
  potentialGain: number;
  recommendation: string;
}

export interface CompetitorComparison {
  sites: SiteSummary[];
  rankings: CategoryRanking[];
  gaps: CompetitiveGap[];
  opportunities: Opportunity[];
  summary: {
    primaryUrl: string;
    primaryRank: number;
    totalSites: number;
    strongestCategory: AuditCategory;
    weakestCategory: AuditCategory;
  };
}

// ---------------------------------------------------------------------------
// Category list (constant order)
// ---------------------------------------------------------------------------

const ALL_CATEGORIES: AuditCategory[] = [
  'visualHierarchy',
  'copyEffectiveness',
  'trustCredibility',
  'conversionFriction',
  'mobileOptimization',
  'ctaOptimization',
  'compliancePrivacy',
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compare multiple audit results and produce a structured competitive analysis.
 * The first element in `audits` is treated as the primary (client) site.
 *
 * @param audits - Array of AuditResult objects. Must contain at least 2 items.
 * @returns CompetitorComparison with rankings, gaps, and opportunities.
 */
export function compareAudits(audits: AuditResult[]): CompetitorComparison {
  if (audits.length < 2) {
    throw new Error(
      '[COMPETITOR_ERROR] At least 2 audit results are required for comparison.',
    );
  }

  // Build site summaries
  const sites: SiteSummary[] = audits.map((audit) => {
    const categoryScores = {} as Record<AuditCategory, number>;
    for (const cat of ALL_CATEGORIES) {
      categoryScores[cat] = audit.overallScore.categories[cat].score;
    }
    return {
      url: audit.url,
      overallScore: audit.overallScore.total,
      overallGrade: audit.overallScore.grade,
      categoryScores,
    };
  });

  // Build rankings per category
  const rankings: CategoryRanking[] = ALL_CATEGORIES.map((category) => {
    const ranked = sites
      .map((site) => ({ url: site.url, score: site.categoryScores[category] }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return {
      category,
      label: AUDIT_CATEGORY_LABELS[category],
      rankings: ranked,
      bestSite: ranked[0].url,
      bestScore: ranked[0].score,
    };
  });

  // Identify primary site
  const primary = sites[0];
  const competitors = sites.slice(1);

  // Identify gaps: categories where primary is behind the best competitor
  const gaps: CompetitiveGap[] = ALL_CATEGORIES
    .map((category) => {
      const primaryScore = primary.categoryScores[category];
      const bestCompetitorScore = Math.max(
        ...competitors.map((c) => c.categoryScores[category]),
      );
      const gap = bestCompetitorScore - primaryScore;

      let severity: CompetitiveGap['severity'];
      if (gap >= 30) severity = 'critical';
      else if (gap >= 15) severity = 'moderate';
      else severity = 'minor';

      return {
        category,
        label: AUDIT_CATEGORY_LABELS[category],
        primaryScore,
        bestCompetitorScore,
        gap,
        severity,
      };
    })
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap);

  // Identify opportunities: categories where primary is weakest and competitors are strong
  const opportunities: Opportunity[] = ALL_CATEGORIES
    .map((category) => {
      const primaryScore = primary.categoryScores[category];
      const competitorAvg =
        competitors.reduce((sum, c) => sum + c.categoryScores[category], 0) /
        competitors.length;
      const potentialGain = Math.max(0, competitorAvg - primaryScore);

      return {
        category,
        label: AUDIT_CATEGORY_LABELS[category],
        primaryScore,
        competitorAverage: Math.round(competitorAvg),
        potentialGain: Math.round(potentialGain),
        recommendation: getOpportunityRecommendation(category, primaryScore, competitorAvg),
      };
    })
    .filter((o) => o.potentialGain > 5) // Only show meaningful opportunities
    .sort((a, b) => b.potentialGain - a.potentialGain);

  // Determine primary site's overall rank
  const sortedByOverall = [...sites].sort((a, b) => b.overallScore - a.overallScore);
  const primaryRank = sortedByOverall.findIndex((s) => s.url === primary.url) + 1;

  // Find strongest and weakest categories for primary
  const primaryCategoryEntries = ALL_CATEGORIES.map((cat) => ({
    category: cat,
    score: primary.categoryScores[cat],
  }));
  primaryCategoryEntries.sort((a, b) => b.score - a.score);
  const strongestCategory = primaryCategoryEntries[0].category;
  const weakestCategory = primaryCategoryEntries[primaryCategoryEntries.length - 1].category;

  return {
    sites,
    rankings,
    gaps,
    opportunities,
    summary: {
      primaryUrl: primary.url,
      primaryRank,
      totalSites: sites.length,
      strongestCategory,
      weakestCategory,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getOpportunityRecommendation(
  category: AuditCategory,
  primaryScore: number,
  competitorAvg: number,
): string {
  const gap = competitorAvg - primaryScore;

  const templates: Record<AuditCategory, string> = {
    visualHierarchy:
      'Competitors have stronger visual hierarchy. Improve page layout, heading structure, and visual flow to match.',
    copyEffectiveness:
      'Competitor copy is more effective. Rewrite headlines to focus on benefits, simplify reading level, and add emotional triggers.',
    trustCredibility:
      'Competitors display stronger trust signals. Add testimonials, credentials, and review integrations.',
    conversionFriction:
      'Competitors offer smoother conversion paths. Simplify forms, add click-to-call, and provide multiple contact options.',
    mobileOptimization:
      'Competitors are better optimized for mobile. Ensure responsive design, tap targets, and mobile-friendly forms.',
    ctaOptimization:
      'Competitor CTAs are more effective. Use action-oriented language, add multiple CTAs, and make them visually prominent.',
    compliancePrivacy:
      'Competitors show better compliance signals. Add privacy policy, cookie consent, and professional licensing info.',
  };

  if (gap > 30) {
    return `URGENT: ${templates[category]}`;
  }
  return templates[category];
}
