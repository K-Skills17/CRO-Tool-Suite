'use client';

/**
 * CompetitorView Component
 * Side-by-side competitor comparison with score table, radar chart
 * visualization (div-based), gap analysis, and opportunity highlights.
 */

import React from 'react';
import type { CompetitorComparison, CompetitiveGap, Opportunity, SiteSummary } from '@/lib/competitor-analyzer';
import type { AuditCategory } from '@/config/audit-checklist';
import { AUDIT_CATEGORY_LABELS } from '@/config/audit-checklist';
import { getScoreColor } from '@/utils/scoring';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CompetitorViewProps {
  comparison: CompetitorComparison;
}

// ---------------------------------------------------------------------------
// Constants
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

const SITE_COLORS = [
  '#2563eb', // blue (primary)
  '#dc2626', // red
  '#16a34a', // green
  '#9333ea', // purple
  '#ea580c', // orange
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shortenUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.length > 30 ? url.slice(0, 30) + '...' : url;
  }
}

function getSeverityClasses(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'minor':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Summary header showing primary site rank */
function ComparisonHeader({ comparison }: { comparison: CompetitorComparison }) {
  const { summary } = comparison;
  const isFirst = summary.primaryRank === 1;

  return (
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Competitor Comparison</h2>
      <div className="mt-1 flex items-center gap-3 text-sm">
        <span className="text-gray-500">
          {shortenUrl(summary.primaryUrl)} ranks
        </span>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
            isFirst
              ? 'bg-green-100 text-green-800'
              : summary.primaryRank <= 2
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          #{summary.primaryRank} of {summary.totalSites}
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">
          Strongest: {AUDIT_CATEGORY_LABELS[summary.strongestCategory]}
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">
          Weakest: {AUDIT_CATEGORY_LABELS[summary.weakestCategory]}
        </span>
      </div>
    </div>
  );
}

/** Side-by-side score comparison table */
function ScoreComparisonTable({ sites }: { sites: SiteSummary[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
            {sites.map((site, i) => (
              <th key={site.url} className="px-4 py-3 text-center font-semibold" style={{ color: SITE_COLORS[i % SITE_COLORS.length] }}>
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: SITE_COLORS[i % SITE_COLORS.length] }}
                  />
                  <span className="truncate max-w-[120px]">{shortenUrl(site.url)}</span>
                </div>
                {i === 0 && (
                  <span className="block text-xs font-normal text-gray-400 mt-0.5">
                    (Your site)
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Overall score row */}
          <tr className="bg-gray-50 border-b border-gray-100 font-semibold">
            <td className="px-4 py-3 text-gray-900">Overall Score</td>
            {sites.map((site, i) => (
              <td key={site.url} className="px-4 py-3 text-center">
                <span className="text-lg" style={{ color: getScoreColor(site.overallScore) }}>
                  {site.overallScore}
                </span>
                <span className="ml-1 text-xs text-gray-400">{site.overallGrade}</span>
              </td>
            ))}
          </tr>
          {/* Category rows */}
          {ALL_CATEGORIES.map((category) => {
            const scores = sites.map((s) => s.categoryScores[category]);
            const maxScore = Math.max(...scores);

            return (
              <tr key={category} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2.5 text-gray-700">
                  {AUDIT_CATEGORY_LABELS[category]}
                </td>
                {sites.map((site, i) => {
                  const score = site.categoryScores[category];
                  const isBest = score === maxScore && scores.filter((s) => s === maxScore).length === 1;

                  return (
                    <td key={site.url} className="px-4 py-2.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className="font-medium"
                          style={{ color: getScoreColor(score) }}
                        >
                          {score}
                        </span>
                        {isBest && (
                          <svg
                            className="h-3.5 w-3.5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Div-based radar/spider chart visualization */
function RadarChart({ sites }: { sites: SiteSummary[] }) {
  // Render a div-based approximation of a radar chart using positioned bars
  // Each category gets a row; each site's score is shown as an overlapping bar

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
        Score Radar
      </h3>
      <div className="space-y-2">
        {ALL_CATEGORIES.map((category) => (
          <div key={category} className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-medium text-gray-600 truncate pr-2">
                {AUDIT_CATEGORY_LABELS[category]}
              </span>
            </div>
            <div className="relative h-6 bg-gray-100 rounded overflow-hidden">
              {sites.map((site, i) => {
                const score = site.categoryScores[category];
                const color = SITE_COLORS[i % SITE_COLORS.length];
                const opacity = i === 0 ? 0.85 : 0.45;

                return (
                  <div
                    key={site.url}
                    className="absolute inset-y-0 left-0 rounded transition-all duration-700 ease-out"
                    style={{
                      width: `${score}%`,
                      backgroundColor: color,
                      opacity,
                      zIndex: sites.length - i,
                    }}
                    title={`${shortenUrl(site.url)}: ${score}`}
                  />
                );
              })}
              {/* Score labels on the right */}
              <div className="absolute inset-y-0 right-2 flex items-center gap-2 z-10">
                {sites.map((site, i) => (
                  <span
                    key={site.url}
                    className="text-xs font-bold"
                    style={{ color: SITE_COLORS[i % SITE_COLORS.length] }}
                  >
                    {site.categoryScores[category]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {sites.map((site, i) => (
          <div key={site.url} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: SITE_COLORS[i % SITE_COLORS.length] }}
            />
            <span className="text-xs text-gray-600">
              {shortenUrl(site.url)}
              {i === 0 && ' (You)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Gap analysis display */
function GapAnalysis({ gaps }: { gaps: CompetitiveGap[] }) {
  if (gaps.length === 0) {
    return (
      <div className="text-center py-6">
        <svg
          className="mx-auto h-10 w-10 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          No competitive gaps detected. Your site leads or matches all competitors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
        Competitive Gaps
      </h3>
      <div className="space-y-2">
        {gaps.map((gap) => (
          <div
            key={gap.category}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg"
          >
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityClasses(gap.severity)}`}
            >
              {gap.severity}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{gap.label}</p>
              <p className="text-xs text-gray-500">
                Your score: {gap.primaryScore} vs best competitor: {gap.bestCompetitorScore}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="text-lg font-bold text-red-600">-{gap.gap}</span>
              <span className="block text-xs text-gray-400">points behind</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Opportunity highlights */
function OpportunityHighlights({ opportunities }: { opportunities: Opportunity[] }) {
  if (opportunities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
        Improvement Opportunities
      </h3>
      <div className="space-y-2">
        {opportunities.map((opp) => (
          <div
            key={opp.category}
            className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900">{opp.label}</p>
                <p className="mt-1 text-sm text-blue-700">{opp.recommendation}</p>
              </div>
              <div className="ml-4 flex-shrink-0 text-right">
                <span className="text-lg font-bold text-blue-600">+{opp.potentialGain}</span>
                <span className="block text-xs text-blue-500">potential pts</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-blue-600">
              <span>Your score: {opp.primaryScore}</span>
              <span>Competitor avg: {opp.competitorAverage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CompetitorView({ comparison }: CompetitorViewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <ComparisonHeader comparison={comparison} />

      <div className="p-6 space-y-8">
        {/* Score comparison table */}
        <ScoreComparisonTable sites={comparison.sites} />

        {/* Radar chart visualization */}
        <RadarChart sites={comparison.sites} />

        {/* Gap analysis */}
        <GapAnalysis gaps={comparison.gaps} />

        {/* Opportunities */}
        <OpportunityHighlights opportunities={comparison.opportunities} />
      </div>
    </div>
  );
}
