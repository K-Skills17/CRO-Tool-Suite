'use client';

/**
 * CopyRewriter Component
 * Tool 2: Conversion Copy Laboratory - Copy Rewriting & Variation Panel
 *
 * Allows users to rewrite copy using proven frameworks (PAS, AIDA, BAB, FAB)
 * and generate A/B test variations with predicted lift ranges.
 */

import React, { useState, useCallback } from 'react';
import {
  rewriteWithFramework,
  generateVariations,
  type CopyVariation,
} from '@/lib/copy-engine';
import { isAppError } from '@/utils/errors';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type CopyType = 'headline' | 'subheadline' | 'body' | 'cta';
type Framework = 'PAS' | 'AIDA' | 'BAB' | 'FAB';

const COPY_TYPE_OPTIONS: { value: CopyType; label: string }[] = [
  { value: 'headline', label: 'Headline' },
  { value: 'subheadline', label: 'Subheadline' },
  { value: 'body', label: 'Body Copy' },
  { value: 'cta', label: 'CTA (Call-to-Action)' },
];

const FRAMEWORK_OPTIONS: { value: Framework; label: string; description: string }[] = [
  {
    value: 'PAS',
    label: 'PAS',
    description: 'Problem - Agitate - Solve: Identify the pain, amplify it, then present your solution.',
  },
  {
    value: 'AIDA',
    label: 'AIDA',
    description: 'Attention - Interest - Desire - Action: Build a logical progression to conversion.',
  },
  {
    value: 'BAB',
    label: 'BAB',
    description: 'Before - After - Bridge: Paint the before/after picture with your service as the bridge.',
  },
  {
    value: 'FAB',
    label: 'FAB',
    description: 'Feature - Advantage - Benefit: Translate features into clear customer benefits.',
  },
];

// ---------------------------------------------------------------------------
// Clipboard helper
// ---------------------------------------------------------------------------

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// VariationCard sub-component
// ---------------------------------------------------------------------------

interface VariationCardProps {
  variation: CopyVariation;
  index: number;
}

function VariationCard({ variation, index }: VariationCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(variation.text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [variation.text]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-gray-700">{variation.framework}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
          {variation.text}
        </p>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <span className="font-medium text-gray-600 w-24 flex-shrink-0">Hypothesis:</span>
          <span className="text-gray-700">{variation.hypothesis}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600 w-24 flex-shrink-0">Focus Area:</span>
          <span className="text-gray-700">{variation.focusArea}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600 w-24 flex-shrink-0">Predicted Lift:</span>
          <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-semibold">
            +{variation.predictedLiftMin}% to +{variation.predictedLiftMax}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CopyRewriter() {
  const [originalText, setOriginalText] = useState('');
  const [copyType, setCopyType] = useState<CopyType>('headline');
  const [framework, setFramework] = useState<Framework>('PAS');
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);
  const [variations, setVariations] = useState<CopyVariation[]>([]);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rewriteCopied, setRewriteCopied] = useState(false);

  // --- Selected framework details ---
  const selectedFramework = FRAMEWORK_OPTIONS.find((f) => f.value === framework);

  // --- Rewrite handler ---
  const handleRewrite = useCallback(() => {
    if (!originalText.trim()) {
      setError('Please enter some copy text to rewrite.');
      return;
    }

    setIsRewriting(true);
    setError(null);
    setRewrittenText(null);

    try {
      const result = rewriteWithFramework(originalText, framework);
      setRewrittenText(result);
    } catch (err: unknown) {
      if (isAppError(err)) {
        setError(err.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during rewriting.');
      }
    } finally {
      setIsRewriting(false);
    }
  }, [originalText, framework]);

  // --- Generate variations handler ---
  const handleGenerateVariations = useCallback(() => {
    if (!originalText.trim()) {
      setError('Please enter some copy text to generate variations.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVariations([]);

    try {
      const result = generateVariations(originalText, copyType, 5);
      setVariations(result);
    } catch (err: unknown) {
      if (isAppError(err)) {
        setError(err.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while generating variations.');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [originalText, copyType]);

  // --- Copy rewrite to clipboard ---
  const handleCopyRewrite = useCallback(async () => {
    if (!rewrittenText) return;
    const success = await copyToClipboard(rewrittenText);
    if (success) {
      setRewriteCopied(true);
      setTimeout(() => setRewriteCopied(false), 2000);
    }
  }, [rewrittenText]);

  // --- Clear all ---
  const handleClear = useCallback(() => {
    setOriginalText('');
    setRewrittenText(null);
    setVariations([]);
    setError(null);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Copy Rewriter</h2>
        <p className="text-gray-600 mt-1">
          Rewrite your copy using proven conversion frameworks and generate
          A/B test variations with predicted lift ranges.
        </p>
      </div>

      {/* Input area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
        {/* Text input */}
        <div className="mb-4">
          <label
            htmlFor="rewrite-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Original copy
          </label>
          <textarea
            id="rewrite-input"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Enter your headline, body copy, CTA, or subheadline..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-y"
          />
        </div>

        {/* Type and framework selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="copy-type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Copy type
            </label>
            <select
              id="copy-type"
              value={copyType}
              onChange={(e) => setCopyType(e.target.value as CopyType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              {COPY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="framework-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Framework
            </label>
            <select
              id="framework-select"
              value={framework}
              onChange={(e) => setFramework(e.target.value as Framework)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              {FRAMEWORK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} - {opt.description.split(':')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Framework description */}
        {selectedFramework && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">{selectedFramework.label}:</span>{' '}
              {selectedFramework.description}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRewrite}
            disabled={isRewriting || !originalText.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRewriting ? 'Rewriting...' : 'Rewrite with Framework'}
          </button>
          <button
            onClick={handleGenerateVariations}
            disabled={isGenerating || !originalText.trim()}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate A/B Variations'}
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
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

      {/* Rewrite result (side by side) */}
      {rewrittenText && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Framework Rewrite: {framework}
            </h3>
            <button
              onClick={handleCopyRewrite}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {rewriteCopied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Rewrite
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Original</h4>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[120px]">
                {originalText}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Rewritten ({framework})</h4>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[120px]">
                {rewrittenText}
              </div>
            </div>
          </div>

          {/* Framework explanation */}
          {selectedFramework && (
            <div className="mt-4 bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">How {selectedFramework.label} works:</span>{' '}
                {selectedFramework.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* A/B Test Variations */}
      {variations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              A/B Test Variations ({variations.length})
            </h3>
            <span className="text-xs text-gray-500">
              Copy type: {COPY_TYPE_OPTIONS.find((o) => o.value === copyType)?.label}
            </span>
          </div>
          <div className="space-y-4">
            {variations.map((variation, idx) => (
              <VariationCard key={idx} variation={variation} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
