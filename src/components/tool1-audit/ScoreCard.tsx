'use client';

/**
 * ScoreCard Component
 * Displays the overall audit score as a circular gauge, grade letter,
 * category score bars, and benchmark comparison.
 */

import React from 'react';
import type { OverallScore, CategoryScore } from '@/utils/scoring';
import { getScoreColor } from '@/utils/scoring';
import type { VerticalConfig } from '@/config/healthcare-verticals';
import type { AuditCategory } from '@/config/audit-checklist';
import { AUDIT_CATEGORY_LABELS } from '@/config/audit-checklist';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ScoreCardProps {
  score: OverallScore;
  vertical: VerticalConfig;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Circular score gauge rendered with SVG */
function CircularGauge({ value, grade }: { value: number; grade: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = getScoreColor(value);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
        />
        {/* Score arc */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {value}
        </span>
        <span className="text-lg font-semibold text-gray-500">{grade}</span>
      </div>
    </div>
  );
}

/** Horizontal bar for a single category score */
function CategoryBar({
  category,
  categoryScore,
}: {
  category: AuditCategory;
  categoryScore: CategoryScore;
}) {
  const label = AUDIT_CATEGORY_LABELS[category];
  const color = getScoreColor(categoryScore.score);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-gray-700 truncate pr-2">{label}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500">
            {categoryScore.passedChecks}/{categoryScore.totalChecks}
          </span>
          <span className="text-sm font-semibold" style={{ color }}>
            {categoryScore.score}
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${categoryScore.score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/** Benchmark comparison section */
function BenchmarkSection({
  score,
  vertical,
}: {
  score: OverallScore;
  vertical: VerticalConfig;
}) {
  const bm = score.benchmarkComparison;

  const benchmarkLevels = [
    { label: 'Your estimated CR', value: `${bm.currentEstimatedCR}%`, highlight: true },
    { label: `${vertical.label} average`, value: `${bm.industryAverage}%`, highlight: false },
    { label: 'Good performance', value: `${bm.industryGood}%`, highlight: false },
    { label: 'Excellent performance', value: `${bm.industryExcellent}%`, highlight: false },
  ];

  // Position marker on benchmark scale
  const maxRate = bm.industryExcellent * 1.2;
  const markerPercent = Math.min(100, (bm.currentEstimatedCR / maxRate) * 100);
  const avgPercent = Math.min(100, (bm.industryAverage / maxRate) * 100);
  const goodPercent = Math.min(100, (bm.industryGood / maxRate) * 100);
  const excellentPercent = Math.min(100, (bm.industryExcellent / maxRate) * 100);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
        Industry Benchmark
      </h3>

      {/* Visual scale */}
      <div className="relative pt-6 pb-2">
        <div className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full" />

        {/* Markers */}
        <div
          className="absolute top-0 text-xs text-gray-500 -translate-x-1/2 text-center"
          style={{ left: `${avgPercent}%` }}
        >
          <span className="block">Avg</span>
          <div className="w-0.5 h-2 bg-gray-400 mx-auto" />
        </div>
        <div
          className="absolute top-0 text-xs text-gray-500 -translate-x-1/2 text-center"
          style={{ left: `${goodPercent}%` }}
        >
          <span className="block">Good</span>
          <div className="w-0.5 h-2 bg-gray-400 mx-auto" />
        </div>
        <div
          className="absolute top-0 text-xs text-gray-500 -translate-x-1/2 text-center"
          style={{ left: `${excellentPercent}%` }}
        >
          <span className="block">Great</span>
          <div className="w-0.5 h-2 bg-gray-400 mx-auto" />
        </div>

        {/* Current position indicator */}
        <div
          className="absolute top-5 -translate-x-1/2"
          style={{ left: `${markerPercent}%` }}
        >
          <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {benchmarkLevels.map((item) => (
          <div
            key={item.label}
            className={`px-3 py-2 rounded-lg ${
              item.highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}
          >
            <span className="block text-xs text-gray-500">{item.label}</span>
            <span
              className={`block text-lg font-semibold ${
                item.highlight ? 'text-blue-700' : 'text-gray-700'
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Percentile & potential */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
        <div>
          <span className="block text-xs text-gray-500">Industry percentile</span>
          <span className="text-lg font-semibold text-gray-800">{bm.percentile}th</span>
        </div>
        {bm.potentialRevenueGain > 0 && (
          <div className="text-right">
            <span className="block text-xs text-gray-500">Potential monthly gain</span>
            <span className="text-lg font-semibold text-green-600">
              +${bm.potentialRevenueGain.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ScoreCard({ score, vertical }: ScoreCardProps) {
  const categories = Object.entries(score.categories) as [AuditCategory, CategoryScore][];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Audit Score</h2>
        <p className="text-sm text-gray-500">
          {vertical.label} &mdash; weighted for your vertical
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Overall Score Gauge */}
        <div className="flex flex-col items-center">
          <CircularGauge value={score.total} grade={score.grade} />
          <p className="mt-2 text-sm text-gray-500">Overall CRO Score</p>
        </div>

        {/* Category Scores */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
            Category Breakdown
          </h3>
          <div className="space-y-3">
            {categories.map(([category, catScore]) => (
              <CategoryBar
                key={category}
                category={category}
                categoryScore={catScore}
              />
            ))}
          </div>
        </div>

        {/* Benchmark Comparison */}
        <BenchmarkSection score={score} vertical={vertical} />
      </div>
    </div>
  );
}
