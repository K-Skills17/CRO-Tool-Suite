'use client';

/**
 * LanguageExtractor Component
 * Tool 2: Conversion Copy Laboratory - Customer Language Panel
 *
 * Extracts pain points, desires, emotional triggers, and objections
 * from pasted customer language (reviews, testimonials, support tickets).
 * Displays results in categorised tabs and generates copy suggestions.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  extractPhrases,
  buildLanguageProfile,
  suggestCopyFromLanguage,
  type ExtractedLanguage,
  type Phrase,
} from '@/lib/language-library';
import { isAppError } from '@/utils/errors';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type SourceType = 'google_reviews' | 'testimonials' | 'support_tickets' | 'other';

const SOURCE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: 'google_reviews', label: 'Google Reviews' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'support_tickets', label: 'Support Tickets' },
  { value: 'other', label: 'Other' },
];

type TabId = 'painPoints' | 'desires' | 'emotional' | 'objections';

const TABS: { id: TabId; label: string; color: string; bgColor: string }[] = [
  { id: 'painPoints', label: 'Pain Points', color: 'text-red-700', bgColor: 'bg-red-50' },
  { id: 'desires', label: 'Desires', color: 'text-green-700', bgColor: 'bg-green-50' },
  { id: 'emotional', label: 'Emotional Triggers', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  { id: 'objections', label: 'Objections', color: 'text-amber-700', bgColor: 'bg-amber-50' },
];

// ---------------------------------------------------------------------------
// Sentiment badge helper
// ---------------------------------------------------------------------------

function SentimentBadge({ sentiment }: { sentiment: Phrase['sentiment'] }) {
  const styles: Record<string, string> = {
    positive: 'bg-green-100 text-green-700',
    negative: 'bg-red-100 text-red-700',
    neutral: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[sentiment]}`}>
      {sentiment}
    </span>
  );
}

// ---------------------------------------------------------------------------
// PhraseList sub-component
// ---------------------------------------------------------------------------

interface PhraseListProps {
  phrases: Phrase[];
  emptyMessage: string;
  tabColor: string;
}

function PhraseList({ phrases, emptyMessage, tabColor }: PhraseListProps) {
  if (phrases.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">{emptyMessage}</p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {phrases.map((phrase, idx) => (
        <div key={idx} className="flex items-start justify-between py-3 px-1 gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 leading-relaxed break-words">
              &ldquo;{phrase.text}&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <SentimentBadge sentiment={phrase.sentiment} />
            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${tabColor}`}>
              {phrase.frequency}x
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function LanguageExtractor() {
  const [inputText, setInputText] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('google_reviews');
  const [extractedData, setExtractedData] = useState<ExtractedLanguage | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('painPoints');
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Tab counts for badges ---
  const tabCounts = useMemo(() => {
    if (!extractedData) return {};
    return {
      painPoints: extractedData.painPoints.length,
      desires: extractedData.desires.length,
      emotional: extractedData.emotional.length,
      objections: extractedData.objections.length,
    };
  }, [extractedData]);

  // --- Extract handler ---
  const handleExtract = useCallback(() => {
    if (!inputText.trim()) {
      setError('Please paste some customer text (reviews, testimonials, etc.) to extract language from.');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setExtractedData(null);
    setHeadlines([]);

    try {
      const result = extractPhrases(inputText);
      setExtractedData(result);

      // Default to the tab with the most results
      const counts = [
        { id: 'painPoints' as TabId, count: result.painPoints.length },
        { id: 'desires' as TabId, count: result.desires.length },
        { id: 'emotional' as TabId, count: result.emotional.length },
        { id: 'objections' as TabId, count: result.objections.length },
      ];
      const topTab = counts.sort((a, b) => b.count - a.count)[0];
      if (topTab.count > 0) {
        setActiveTab(topTab.id);
      }
    } catch (err: unknown) {
      if (isAppError(err)) {
        setError(err.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during extraction.');
      }
    } finally {
      setIsExtracting(false);
    }
  }, [inputText]);

  // --- Suggest headlines handler ---
  const handleSuggestHeadlines = useCallback(() => {
    if (!extractedData) {
      setError('Please extract language first before generating headline suggestions.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setHeadlines([]);

    try {
      const profile = buildLanguageProfile([extractedData]);
      const suggestions = suggestCopyFromLanguage(profile, 'headline');
      setHeadlines(suggestions);
    } catch (err: unknown) {
      if (isAppError(err)) {
        setError(err.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while generating suggestions.');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [extractedData]);

  // --- Clear all ---
  const handleClear = useCallback(() => {
    setInputText('');
    setExtractedData(null);
    setHeadlines([]);
    setError(null);
  }, []);

  // --- Total phrases found ---
  const totalPhrases = extractedData
    ? extractedData.painPoints.length +
      extractedData.desires.length +
      extractedData.emotional.length +
      extractedData.objections.length
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Language Extractor</h2>
        <p className="text-gray-600 mt-1">
          Paste customer reviews, testimonials, or support tickets to extract
          pain points, desires, emotional triggers, and objections in their
          own words.
        </p>
      </div>

      {/* Input area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <label
            htmlFor="language-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Paste customer language
          </label>
          <textarea
            id="language-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              'Paste Google reviews, testimonials, support tickets, or any customer feedback here...\n\n' +
              'Example:\n' +
              '"I was so scared of going to the dentist, but Dr. Smith made me feel comfortable and at ease. ' +
              'The treatment was painless and the results are amazing. I finally have the smile I always wanted!"'
            }
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-y"
          />
          <p className="text-xs text-gray-500 mt-1">
            {inputText.length > 0
              ? `${inputText.split(/\s+/).filter(Boolean).length} words`
              : 'No text entered'}
          </p>
        </div>

        {/* Source selector */}
        <div className="mb-4">
          <label
            htmlFor="source-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Source type
          </label>
          <select
            id="source-select"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExtract}
            disabled={isExtracting || !inputText.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExtracting ? 'Extracting...' : 'Extract Language'}
          </button>
          <button
            onClick={handleClear}
            disabled={isExtracting}
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
      {extractedData && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{totalPhrases}</span> phrases extracted
              </div>
              <div className="text-sm text-gray-600">
                Source: <span className="font-medium">{SOURCE_OPTIONS.find((s) => s.value === sourceType)?.label}</span>
              </div>
              {extractedData.commonPhrases.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{extractedData.commonPhrases.length}</span> common phrases
                </div>
              )}
            </div>
          </div>

          {/* Tabbed results */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Tab bar */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const count = tabCounts[tab.id] || 0;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                        border-b-2 transition-colors
                        ${isActive
                          ? `${tab.color} border-current`
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}
                      `}
                    >
                      {tab.label}
                      <span
                        className={`
                          inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold
                          ${isActive ? tab.bgColor + ' ' + tab.color : 'bg-gray-100 text-gray-500'}
                        `}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab content */}
            <div className="p-5">
              {activeTab === 'painPoints' && (
                <PhraseList
                  phrases={extractedData.painPoints}
                  emptyMessage="No pain point phrases detected. Try pasting more detailed reviews."
                  tabColor="bg-red-50 text-red-700"
                />
              )}
              {activeTab === 'desires' && (
                <PhraseList
                  phrases={extractedData.desires}
                  emptyMessage="No desire phrases detected. Try including positive reviews or testimonials."
                  tabColor="bg-green-50 text-green-700"
                />
              )}
              {activeTab === 'emotional' && (
                <PhraseList
                  phrases={extractedData.emotional}
                  emptyMessage="No emotional trigger phrases detected. Try including reviews with emotional language."
                  tabColor="bg-purple-50 text-purple-700"
                />
              )}
              {activeTab === 'objections' && (
                <PhraseList
                  phrases={extractedData.objections}
                  emptyMessage="No objection phrases detected. Try including negative reviews or support tickets."
                  tabColor="bg-amber-50 text-amber-700"
                />
              )}
            </div>
          </div>

          {/* Suggest Headlines button */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Generate Headlines from Customer Language
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Use the extracted phrases to create headlines that speak your
                  customers&apos; language.
                </p>
              </div>
              <button
                onClick={handleSuggestHeadlines}
                disabled={isGenerating || totalPhrases === 0}
                className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {isGenerating ? 'Generating...' : 'Suggest Headlines'}
              </button>
            </div>

            {headlines.length > 0 && (
              <div className="space-y-3 mt-4">
                {headlines.map((headline, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-lg p-4"
                  >
                    <span className="w-6 h-6 bg-indigo-200 text-indigo-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-indigo-900 leading-relaxed">
                      {headline}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
