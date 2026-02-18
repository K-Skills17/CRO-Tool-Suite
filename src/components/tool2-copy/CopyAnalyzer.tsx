'use client';

/**
 * CopyAnalyzer Component
 * Tool 2: Conversion Copy Laboratory - Copy Analysis Panel
 *
 * Provides a textarea for pasting copy, optional vertical selector,
 * and displays a full CopyReport with scores, category breakdowns,
 * and actionable improvement suggestions.
 */

import React, { useState, useCallback } from 'react';
import { analyzeAndScore, type CopyReport } from '@/lib/copy-engine';
import { getVerticalOptionsByIndustry } from '@/config/healthcare-verticals';
import { isAppError } from '@/utils/errors';

// ---------------------------------------------------------------------------
// Score gauge helper
// ---------------------------------------------------------------------------

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-lime-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-500';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-lime-500';
  if (score >= 40) return 'bg-yellow-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  if (score >= 20) return 'Weak';
  return 'Poor';
}

// ---------------------------------------------------------------------------
// Category bar sub-component
// ---------------------------------------------------------------------------

interface CategoryBarProps {
  label: string;
  score: number;
}

function CategoryBar({ label, score }: CategoryBarProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${getScoreBg(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CopyAnalyzer() {
  const [copyText, setCopyText] = useState('');
  const [selectedVertical, setSelectedVertical] = useState('');
  const [report, setReport] = useState<CopyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(() => {
    if (!copyText.trim()) {
      setError('Please paste some copy text to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const result = analyzeAndScore(
        copyText,
        selectedVertical || undefined,
      );
      setReport(result);
    } catch (err: unknown) {
      if (isAppError(err)) {
        setError(err.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [copyText, selectedVertical]);

  const handleClear = useCallback(() => {
    setCopyText('');
    setReport(null);
    setError(null);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Copy Analyzer</h2>
        <p className="text-gray-600 mt-1">
          Paste your website copy below to get a detailed effectiveness analysis
          with actionable improvement suggestions.
        </p>
      </div>

      {/* Input area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <label
            htmlFor="copy-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Paste your copy
          </label>
          <textarea
            id="copy-input"
            value={copyText}
            onChange={(e) => setCopyText(e.target.value)}
            placeholder="Paste your headline, body copy, CTA text, or full page copy here..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-y"
          />
          <p className="text-xs text-gray-500 mt-1">
            {copyText.length > 0 ? `${copyText.split(/\s+/).filter(Boolean).length} words` : 'No text entered'}
          </p>
        </div>

        {/* Vertical selector */}
        <div className="mb-4">
          <label
            htmlFor="vertical-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Industry vertical (optional)
          </label>
          <select
            id="vertical-select"
            value={selectedVertical}
            onChange={(e) => setSelectedVertical(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          >
            <option value="">-- No vertical (general analysis) --</option>
            {getVerticalOptionsByIndustry().map((group) => (
              <optgroup key={group.industry} label={group.label}>
                {group.verticals.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !copyText.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Copy'}
          </button>
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Overall score gauge */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Copy Score</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke={report.overallScore >= 80 ? '#22c55e' : report.overallScore >= 60 ? '#84cc16' : report.overallScore >= 40 ? '#eab308' : report.overallScore >= 20 ? '#f97316' : '#ef4444'}
                    strokeWidth="10"
                    strokeDasharray={`${(report.overallScore / 100) * 327} 327`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(report.overallScore)}`}>
                    {report.overallScore}
                  </span>
                  <span className="text-xs text-gray-500">/ 100</span>
                </div>
              </div>
              <div>
                <p className={`text-xl font-semibold ${getScoreColor(report.overallScore)}`}>
                  {getScoreLabel(report.overallScore)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Based on clarity, persuasion, emotional impact, readability, and CTA strength.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {report.analysis.wordCount} words
                  </span>
                  <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {report.analysis.sentenceCount} sentences
                  </span>
                  <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    Grade {report.analysis.gradeLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <CategoryBar label="Clarity" score={report.categoryScores.clarity} />
            <CategoryBar label="Persuasion" score={report.categoryScores.persuasion} />
            <CategoryBar label="Emotional Impact" score={report.categoryScores.emotional} />
            <CategoryBar label="Readability" score={report.categoryScores.readability} />
            <CategoryBar label="CTA Strength" score={report.categoryScores.ctaStrength} />
          </div>

          {/* Side by side: original vs analysis highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original text */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Copy</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {report.original}
              </div>
            </div>

            {/* Analysis highlights */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis Highlights</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 w-40 flex-shrink-0">Power Words:</span>
                  <span className={report.analysis.powerWordCount >= 3 ? 'text-green-600' : 'text-orange-600'}>
                    {report.analysis.powerWordCount} found ({report.analysis.powerWordDensity}% density)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 w-40 flex-shrink-0">Emotional Triggers:</span>
                  <span className={report.analysis.emotionalTriggerCount >= 2 ? 'text-green-600' : 'text-orange-600'}>
                    {report.analysis.emotionalTriggerCount} found
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 w-40 flex-shrink-0">Benefit Phrases:</span>
                  <span className={report.analysis.benefitIndicatorCount >= 2 ? 'text-green-600' : 'text-orange-600'}>
                    {report.analysis.benefitIndicatorCount} found
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 w-40 flex-shrink-0">Feature Phrases:</span>
                  <span className="text-gray-600">
                    {report.analysis.featureIndicatorCount} found
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 w-40 flex-shrink-0">Benefit:Feature Ratio:</span>
                  <span className={report.analysis.benefitToFeatureRatio >= 1 ? 'text-green-600' : 'text-orange-600'}>
                    {report.analysis.benefitToFeatureRatio}:1
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 w-40 flex-shrink-0">&quot;You/Your&quot; Usage:</span>
                  <span className={report.analysis.secondPersonCount >= 3 ? 'text-green-600' : 'text-orange-600'}>
                    {report.analysis.secondPersonCount} instances
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 w-40 flex-shrink-0">Avg. Sentence Length:</span>
                  <span className={report.analysis.avgWordsPerSentence <= 20 ? 'text-green-600' : 'text-orange-600'}>
                    {report.analysis.avgWordsPerSentence} words
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 w-40 flex-shrink-0">Flesch Reading Ease:</span>
                  <span className={report.analysis.readingEase >= 60 ? 'text-green-600' : 'text-orange-600'}>
                    {report.analysis.readingEase} / 100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Improvement suggestions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Improvement Suggestions</h3>
            {report.improvements.length > 0 ? (
              <ul className="space-y-2">
                {report.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="mt-1 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-600">
                Great job! No major improvement areas detected.
              </p>
            )}
          </div>

          {/* Framework suggestion */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Recommended Framework
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              {report.frameworkSuggestion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
