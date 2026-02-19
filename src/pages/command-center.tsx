/**
 * Tool 4: Optimization Command Center
 * Testing prioritization, A/B test calculation, funnel analysis, ROI, and reporting.
 */
import React, { useState } from 'react';
import Layout from '@/components/common/Layout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Tabs from '@/components/common/Tabs';
import TestingPrioritizer from '@/components/tool4-command/TestingPrioritizer';
import ABTestCalculator from '@/components/tool4-command/ABTestCalculator';
import FunnelVisualizer from '@/components/tool4-command/FunnelVisualizer';
import ROICalculator from '@/components/tool4-command/ROICalculator';
import ReportGenerator from '@/components/tool4-command/ReportGenerator';

export default function CommandCenterPage() {
  const [mode, setMode] = useState<'internal' | 'client'>('internal');

  return (
    <Layout activeTool="command" mode={mode} onModeChange={setMode}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Optimization Command Center</h1>
          <p className="text-gray-500 mt-1">
            Plan tests, analyze results, track funnels, and generate reports
          </p>
        </div>

        <ErrorBoundary>
          <Tabs
            tabs={[
              {
                id: 'prioritizer',
                label: 'Test Prioritizer',
                content: <TestingPrioritizer />,
              },
              {
                id: 'calculator',
                label: 'A/B Test Calculator',
                content: <ABTestCalculator />,
              },
              {
                id: 'funnel',
                label: 'Funnel Visualizer',
                content: <FunnelVisualizer />,
              },
              {
                id: 'roi',
                label: 'ROI Calculator',
                content: <ROICalculator />,
              },
              {
                id: 'reports',
                label: 'Reports',
                content: <ReportGenerator />,
              },
            ]}
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
