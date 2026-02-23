'use client';

import React, { useState, useMemo } from 'react';
import type { PageLayout } from '@/lib/component-library';
import type { BrandConfig } from '@/config/brand';
import { assemblePageHTML } from '@/lib/component-library';
import { useClipboard } from '@/hooks/useClipboard';

interface PagePreviewProps {
  layout: PageLayout;
  brand: BrandConfig;
}

export default function PagePreview({ layout, brand }: PagePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const { copied, copyToClipboard } = useClipboard();

  const assembledHTML = useMemo(() => {
    try {
      return assemblePageHTML(layout, brand);
    } catch {
      return '<html><body><p>Error assembling page preview.</p></body></html>';
    }
  }, [layout, brand]);

  const handleExportHTML = () => {
    const blob = new Blob([assembledHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Mobile
            </button>
          </div>
          <span className="text-xs text-gray-400">
            Predicted CR: <span className="font-semibold text-green-600">{layout.predictedCR}</span>
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(assembledHTML)}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy HTML'}
          </button>
          <button
            onClick={handleExportHTML}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Export HTML
          </button>
        </div>
      </div>

      {/* Layout Info */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">{layout.sections.length} sections</span>
          {' '}&mdash; {layout.rationale}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {layout.sections.map((s, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">
              {s.component.name}
            </span>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div
        className="border border-gray-200 rounded-lg overflow-hidden bg-white mx-auto transition-all duration-300"
        style={{ maxWidth: viewMode === 'mobile' ? 375 : '100%' }}
      >
        <iframe
          srcDoc={assembledHTML}
          title="Page Preview"
          className="w-full border-0"
          style={{ height: 600 }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
