'use client';

/**
 * AuditForm Component
 * URL input with validation, industry vertical selector, and submit handler.
 */

import React, { useState, useCallback } from 'react';
import type { VerticalId } from '@/config/healthcare-verticals';
import { getVerticalOptionsByIndustry, VERTICAL_OPTIONS } from '@/config/healthcare-verticals';
import { isAppError, type AppError } from '@/utils/errors';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AuditFormProps {
  onSubmit: (url: string, vertical: VerticalId) => void | Promise<void>;
  isLoading?: boolean;
  progress?: number; // 0-100 progress percentage during audit
  error?: AppError | null;
}

// ---------------------------------------------------------------------------
// URL Validation
// ---------------------------------------------------------------------------

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeUrl(value: string): string {
  let trimmed = value.trim();
  if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AuditForm({ onSubmit, isLoading = false, progress = 0, error }: AuditFormProps) {
  const [url, setUrl] = useState('');
  const [vertical, setVertical] = useState<VerticalId>('dental');
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (urlError) {
      setUrlError(null);
    }
  }, [urlError]);

  const handleVerticalChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setVertical(e.target.value as VerticalId);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const normalized = normalizeUrl(url);

      if (!normalized) {
        setUrlError('Please enter a website URL.');
        return;
      }

      if (!isValidUrl(normalized)) {
        setUrlError('Please enter a valid URL (e.g., https://example.com).');
        return;
      }

      setUrlError(null);
      onSubmit(normalized, vertical);
    },
    [url, vertical, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      {/* URL Input */}
      <div>
        <label htmlFor="audit-url" className="block text-sm font-medium text-gray-700 mb-1">
          Website URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          </div>
          <input
            id="audit-url"
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com"
            disabled={isLoading}
            className={`block w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm ${
              urlError ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
            }`}
          />
        </div>
        {urlError && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {urlError}
          </p>
        )}
      </div>

      {/* Vertical Selector */}
      <div>
        <label htmlFor="audit-vertical" className="block text-sm font-medium text-gray-700 mb-1">
          Industry Vertical
        </label>
        <select
          id="audit-vertical"
          value={vertical}
          onChange={handleVerticalChange}
          disabled={isLoading}
          className="block w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
        >
          {getVerticalOptionsByIndustry().map((group) => (
            <optgroup key={group.industry} label={group.label}>
              {group.verticals.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {VERTICAL_OPTIONS.find((o) => o.value === vertical)?.description ?? ''}
        </p>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing...
            </>
          ) : (
            'Run Audit'
          )}
        </button>
      </div>

      {/* Loading Progress */}
      {isLoading && progress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Audit progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {isAppError(error) ? error.userMessage : 'An unexpected error occurred.'}
              </h3>
              {isAppError(error) && error.code !== 'UNKNOWN' && (
                <p className="mt-1 text-xs text-red-600">
                  Error code: {error.code}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
