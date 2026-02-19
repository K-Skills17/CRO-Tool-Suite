/**
 * Tool 2: Conversion Copy Laboratory
 * Copy analysis, rewriting, language extraction, and A/B variant generation.
 */
import React, { useState } from 'react';
import Layout from '@/components/common/Layout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Tabs from '@/components/common/Tabs';
import CopyAnalyzer from '@/components/tool2-copy/CopyAnalyzer';
import CopyRewriter from '@/components/tool2-copy/CopyRewriter';
import LanguageExtractor from '@/components/tool2-copy/LanguageExtractor';

export default function CopyLabPage() {
  const [mode, setMode] = useState<'internal' | 'client'>('internal');

  return (
    <Layout activeTool="copy" mode={mode} onModeChange={setMode}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversion Copy Laboratory</h1>
          <p className="text-gray-500 mt-1">
            Analyze, rewrite, and optimize conversion copy for any industry
          </p>
        </div>

        <ErrorBoundary>
          <Tabs
            tabs={[
              {
                id: 'analyze',
                label: 'Copy Analyzer',
                content: <CopyAnalyzer />,
              },
              {
                id: 'rewrite',
                label: 'Copy Rewriter',
                content: <CopyRewriter />,
              },
              {
                id: 'language',
                label: 'Customer Language',
                content: <LanguageExtractor />,
              },
            ]}
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
