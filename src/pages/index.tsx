/**
 * Tool 1: Conversion Intelligence Platform
 * Main page for site audits, competitor analysis, and benchmarking.
 */
import React, { useState, useCallback } from 'react';
import Layout from '@/components/common/Layout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Tabs from '@/components/common/Tabs';
import AuditForm from '@/components/tool1-audit/AuditForm';
import ScoreCard from '@/components/tool1-audit/ScoreCard';
import RecommendationList from '@/components/tool1-audit/RecommendationList';
import CompetitorView from '@/components/tool1-audit/CompetitorView';
import { runAudit, AuditResult } from '@/lib/audit-engine';
import { compareAudits, CompetitorComparison } from '@/lib/competitor-analyzer';
import { getVerticalConfig } from '@/config/healthcare-verticals';
import type { VerticalId } from '@/config/healthcare-verticals';
import { handleError, logError } from '@/utils/errors';

export default function AuditPage() {
  const [mode, setMode] = useState<'internal' | 'client'>('internal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [competitorResults, setCompetitorResults] = useState<AuditResult[]>([]);
  const [comparison, setComparison] = useState<CompetitorComparison | null>(null);

  const handleAudit = useCallback(async (url: string, vertical: VerticalId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/fetch-page?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.statusText}`);
      }
      const { html } = await response.json();
      const result = runAudit(html, vertical, url);
      result.mode = mode;
      setAuditResult(result);
    } catch (err) {
      const appError = handleError(err);
      logError(appError);
      setError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const handleCompetitorAdd = useCallback(async (url: string, vertical: VerticalId) => {
    if (!auditResult) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/fetch-page?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      const { html } = await response.json();
      const result = runAudit(html, vertical, url);
      const allResults = [auditResult, ...competitorResults, result];
      setCompetitorResults([...competitorResults, result]);
      setComparison(compareAudits(allResults));
    } catch (err) {
      const appError = handleError(err);
      logError(appError);
      setError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  }, [auditResult, competitorResults]);

  const verticalConfig = auditResult
    ? getVerticalConfig(auditResult.vertical)
    : null;

  return (
    <Layout activeTool="audit" mode={mode} onModeChange={setMode}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversion Intelligence Platform</h1>
          <p className="text-gray-500 mt-1">
            Analyze healthcare websites against 200+ CRO checkpoints
          </p>
        </div>

        <ErrorBoundary>
          <Tabs
            tabs={[
              {
                id: 'audit',
                label: 'Site Audit',
                content: (
                  <div className="space-y-6">
                    <AuditForm
                      onSubmit={handleAudit}
                      loading={loading}
                      error={error}
                      onErrorDismiss={() => setError(null)}
                    />
                    {auditResult && verticalConfig && (
                      <>
                        <ScoreCard
                          score={auditResult.overallScore}
                          vertical={verticalConfig}
                          mode={mode}
                        />
                        <RecommendationList
                          recommendations={auditResult.recommendations}
                          categoryScores={auditResult.overallScore.categories}
                          mode={mode}
                        />
                      </>
                    )}
                  </div>
                ),
              },
              {
                id: 'competitor',
                label: 'Competitor Analysis',
                content: (
                  <div className="space-y-6">
                    {!auditResult ? (
                      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">Run a site audit first, then add competitors to compare.</p>
                      </div>
                    ) : (
                      <>
                        <AuditForm
                          onSubmit={handleCompetitorAdd}
                          loading={loading}
                          error={error}
                          onErrorDismiss={() => setError(null)}
                          buttonLabel="Add Competitor"
                          defaultVertical={auditResult.vertical}
                        />
                        {comparison && (
                          <CompetitorView comparison={comparison} mode={mode} />
                        )}
                      </>
                    )}
                  </div>
                ),
              },
              {
                id: 'benchmarks',
                label: 'Industry Benchmarks',
                content: (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Conversion Rate Benchmarks by Vertical</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Vertical</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500">Average CR%</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500">Good CR%</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500">Excellent CR%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(require('@/config/healthcare-verticals').HEALTHCARE_VERTICALS).map(
                            (v: any) => (
                              <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{v.label}</td>
                                <td className="py-3 px-4 text-center text-yellow-600">{v.benchmarks.average}%</td>
                                <td className="py-3 px-4 text-center text-green-600">{v.benchmarks.good}%</td>
                                <td className="py-3 px-4 text-center text-blue-600">{v.benchmarks.excellent}%</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
