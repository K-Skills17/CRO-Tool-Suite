'use client';

/**
 * RecommendationList Component
 * Displays a prioritized list of CRO improvement recommendations
 * with impact levels, effort estimates, and expandable details.
 */

import React, { useState, useCallback } from 'react';
import type { AuditCategory } from '@/config/audit-checklist';
import { AUDIT_CATEGORY_LABELS } from '@/config/audit-checklist';
import type { CategoryScore } from '@/utils/scoring';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Recommendation {
  category: AuditCategory;
  impact: number;
  effort: string; // 'High' | 'Medium' | 'Low'
  recommendation: string;
}

interface RecommendationListProps {
  recommendations: Recommendation[];
  categoryScores: Record<AuditCategory, CategoryScore>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getImpactLevel(impact: number): 'High' | 'Medium' | 'Low' {
  if (impact >= 10) return 'High';
  if (impact >= 4) return 'Medium';
  return 'Low';
}

function getImpactBadgeClasses(level: string): string {
  switch (level) {
    case 'High':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getEffortBadgeClasses(effort: string): string {
  switch (effort) {
    case 'High':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Medium':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Low':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function getPriorityColor(index: number): string {
  if (index === 0) return 'border-l-red-500';
  if (index === 1) return 'border-l-orange-500';
  if (index === 2) return 'border-l-yellow-500';
  return 'border-l-gray-300';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RecommendationItem({
  rec,
  index,
  categoryScore,
  isExpanded,
  onToggle,
}: {
  rec: Recommendation;
  index: number;
  categoryScore: CategoryScore;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const impactLevel = getImpactLevel(rec.impact);
  const label = AUDIT_CATEGORY_LABELS[rec.category];
  const failedChecks = categoryScore.details.filter((d) => !d.passed);

  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden border-l-4 ${getPriorityColor(index)} transition-shadow hover:shadow-sm`}
    >
      {/* Header - always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">
              #{index + 1}
            </span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getImpactBadgeClasses(impactLevel)}`}
            >
              {impactLevel} Impact
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getEffortBadgeClasses(rec.effort)}`}
            >
              {rec.effort} Effort
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 line-clamp-1">{rec.recommendation}</p>
        </div>

        {/* Score + chevron */}
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          <span className="text-lg font-bold text-gray-400">
            {categoryScore.score}
            <span className="text-xs font-normal text-gray-400">/100</span>
          </span>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* Expandable details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100 space-y-3">
          {/* Full recommendation */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Recommendation
            </h4>
            <p className="text-sm text-gray-700">{rec.recommendation}</p>
          </div>

          {/* Impact score */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Impact Score
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, rec.impact * 3)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{rec.impact}</span>
            </div>
          </div>

          {/* Category score summary */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Category Score: {categoryScore.score}/100 ({categoryScore.grade})
            </h4>
            <p className="text-xs text-gray-500">
              {categoryScore.passedChecks} of {categoryScore.totalChecks} checks passed
            </p>
          </div>

          {/* Failed checks */}
          {failedChecks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Issues Found ({failedChecks.length})
              </h4>
              <ul className="space-y-1.5">
                {failedChecks.map((check) => (
                  <li
                    key={check.checkpointId}
                    className="flex items-start gap-2 text-sm"
                  >
                    <svg
                      className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <div>
                      <span className="font-medium text-gray-800">{check.name}</span>
                      <span className="text-gray-500"> &mdash; {check.finding}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function RecommendationList({
  recommendations,
  categoryScores,
}: RecommendationListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setExpandedIndex((current: number | null) => (current === index ? null : index));
  }, []);

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-green-400"
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
        <p className="mt-3 text-sm font-medium text-gray-700">
          No major recommendations. Your site scores well across all categories.
        </p>
      </div>
    );
  }

  const highImpact = recommendations.filter((r) => getImpactLevel(r.impact) === 'High');
  const mediumImpact = recommendations.filter((r) => getImpactLevel(r.impact) === 'Medium');
  const lowImpact = recommendations.filter((r) => getImpactLevel(r.impact) === 'Low');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Priority Recommendations</h2>
        <p className="text-sm text-gray-500">
          {recommendations.length} areas to improve, sorted by potential impact
        </p>
      </div>

      {/* Summary badges */}
      <div className="px-6 py-3 flex items-center gap-3 border-b border-gray-100 bg-white">
        {highImpact.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            {highImpact.length} High Impact
          </span>
        )}
        {mediumImpact.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            {mediumImpact.length} Medium Impact
          </span>
        )}
        {lowImpact.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            {lowImpact.length} Low Impact
          </span>
        )}
      </div>

      {/* Recommendation list */}
      <div className="p-4 space-y-3">
        {recommendations.map((rec, index) => (
          <RecommendationItem
            key={rec.category}
            rec={rec}
            index={index}
            categoryScore={categoryScores[rec.category]}
            isExpanded={expandedIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </div>
  );
}
