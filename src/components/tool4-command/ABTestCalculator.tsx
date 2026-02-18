'use client';

import React, { useState } from 'react';
import {
  calculateSampleSize,
  estimateTestDuration,
  analyzeTestResults,
  type SampleSizeResult,
  type TestResult,
} from '@/utils/statistics';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Mode = 'plan' | 'analyze';

const CONFIDENCE_OPTIONS = [80, 85, 90, 95, 99] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ABTestCalculator() {
  const [mode, setMode] = useState<Mode>('plan');

  /* Plan Test state ----------------------------------------------- */
  const [planForm, setPlanForm] = useState({
    currentCR: '',
    expectedLift: '',
    dailyTraffic: '',
    confidence: 95,
  });
  const [planResult, setPlanResult] = useState<
    (SampleSizeResult & { durationDays: number }) | null
  >(null);
  const [planError, setPlanError] = useState<string | null>(null);

  /* Analyze Results state ----------------------------------------- */
  const [analyzeForm, setAnalyzeForm] = useState({
    controlVisitors: '',
    controlConversions: '',
    variationVisitors: '',
    variationConversions: '',
    avgTransactionValue: '',
  });
  const [analyzeResult, setAnalyzeResult] = useState<TestResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  /* ---- Handlers: Plan ---- */
  const handlePlanChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setPlanForm((prev) => ({ ...prev, [name]: name === 'confidence' ? Number(value) : value }));
    setPlanError(null);
  };

  const handleCalculatePlan = () => {
    const cr = parseFloat(planForm.currentCR);
    const lift = parseFloat(planForm.expectedLift);
    const traffic = parseFloat(planForm.dailyTraffic);

    if (isNaN(cr) || cr <= 0 || cr >= 100) {
      setPlanError('Current conversion rate must be between 0 and 100 (exclusive).');
      return;
    }
    if (isNaN(lift) || lift <= 0) {
      setPlanError('Expected lift must be a positive number.');
      return;
    }
    if (isNaN(traffic) || traffic <= 0) {
      setPlanError('Daily traffic must be a positive number.');
      return;
    }

    try {
      const baselineRate = cr / 100;
      const mde = lift / 100;
      const result = calculateSampleSize(baselineRate, mde, planForm.confidence);
      const durationDays = estimateTestDuration(result.totalSample, traffic);
      setPlanResult({ ...result, durationDays });
      setPlanError(null);
    } catch (err: unknown) {
      setPlanError(err instanceof Error ? err.message : 'Calculation error. Check your inputs.');
    }
  };

  /* ---- Handlers: Analyze ---- */
  const handleAnalyzeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAnalyzeForm((prev) => ({ ...prev, [name]: value }));
    setAnalyzeError(null);
  };

  const handleAnalyze = () => {
    const cV = parseInt(analyzeForm.controlVisitors, 10);
    const cC = parseInt(analyzeForm.controlConversions, 10);
    const vV = parseInt(analyzeForm.variationVisitors, 10);
    const vC = parseInt(analyzeForm.variationConversions, 10);
    const atv = analyzeForm.avgTransactionValue
      ? parseFloat(analyzeForm.avgTransactionValue)
      : 0;

    if (isNaN(cV) || cV <= 0) {
      setAnalyzeError('Control visitors must be a positive integer.');
      return;
    }
    if (isNaN(cC) || cC < 0 || cC > cV) {
      setAnalyzeError('Control conversions must be between 0 and control visitors.');
      return;
    }
    if (isNaN(vV) || vV <= 0) {
      setAnalyzeError('Variation visitors must be a positive integer.');
      return;
    }
    if (isNaN(vC) || vC < 0 || vC > vV) {
      setAnalyzeError('Variation conversions must be between 0 and variation visitors.');
      return;
    }
    if (analyzeForm.avgTransactionValue && (isNaN(atv) || atv < 0)) {
      setAnalyzeError('Average transaction value must be a non-negative number.');
      return;
    }

    try {
      const result = analyzeTestResults(cV, cC, vV, vC, atv);
      setAnalyzeResult(result);
      setAnalyzeError(null);
    } catch (err: unknown) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis error. Check your inputs.');
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">A/B Test Calculator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Plan your test sample size or analyze results for statistical significance.
        </p>
      </div>

      {/* ---- Mode Tabs ---- */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {([
          { key: 'plan' as Mode, label: 'Plan Test' },
          { key: 'analyze' as Mode, label: 'Analyze Results' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/*  Plan Test Mode                                                  */}
      {/* ================================================================ */}
      {mode === 'plan' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-base font-medium text-gray-900">Sample Size Calculator</h3>

          {planError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {planError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="currentCR" className="block text-sm font-medium text-gray-700 mb-1">
                Current Conversion Rate (%)
              </label>
              <input
                id="currentCR"
                name="currentCR"
                type="number"
                step="0.01"
                min="0.01"
                max="99.99"
                value={planForm.currentCR}
                onChange={handlePlanChange}
                placeholder="e.g. 3.5"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="expectedLift" className="block text-sm font-medium text-gray-700 mb-1">
                Expected Lift (%)
              </label>
              <input
                id="expectedLift"
                name="expectedLift"
                type="number"
                step="0.1"
                min="0.1"
                value={planForm.expectedLift}
                onChange={handlePlanChange}
                placeholder="e.g. 15"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="dailyTraffic" className="block text-sm font-medium text-gray-700 mb-1">
                Daily Traffic (visitors)
              </label>
              <input
                id="dailyTraffic"
                name="dailyTraffic"
                type="number"
                step="1"
                min="1"
                value={planForm.dailyTraffic}
                onChange={handlePlanChange}
                placeholder="e.g. 500"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="confidence" className="block text-sm font-medium text-gray-700 mb-1">
                Confidence Level
              </label>
              <select
                id="confidence"
                name="confidence"
                value={planForm.confidence}
                onChange={handlePlanChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CONFIDENCE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCalculatePlan}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Calculate
          </button>

          {/* Plan Results */}
          {planResult && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <ResultCard
                label="Sample per Variation"
                value={planResult.samplePerVariation.toLocaleString()}
              />
              <ResultCard
                label="Total Sample Needed"
                value={planResult.totalSample.toLocaleString()}
              />
              <ResultCard
                label="Estimated Duration"
                value={
                  planResult.durationDays === Infinity
                    ? 'N/A'
                    : `${planResult.durationDays} days`
                }
              />
              <ResultCard
                label="Statistical Power"
                value={`${planResult.power}%`}
              />
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/*  Analyze Results Mode                                            */}
      {/* ================================================================ */}
      {mode === 'analyze' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-base font-medium text-gray-900">Test Results Analyzer</h3>

          {analyzeError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {analyzeError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="controlVisitors" className="block text-sm font-medium text-gray-700 mb-1">
                Control Visitors
              </label>
              <input
                id="controlVisitors"
                name="controlVisitors"
                type="number"
                step="1"
                min="1"
                value={analyzeForm.controlVisitors}
                onChange={handleAnalyzeChange}
                placeholder="e.g. 5000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="controlConversions" className="block text-sm font-medium text-gray-700 mb-1">
                Control Conversions
              </label>
              <input
                id="controlConversions"
                name="controlConversions"
                type="number"
                step="1"
                min="0"
                value={analyzeForm.controlConversions}
                onChange={handleAnalyzeChange}
                placeholder="e.g. 150"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="variationVisitors" className="block text-sm font-medium text-gray-700 mb-1">
                Variation Visitors
              </label>
              <input
                id="variationVisitors"
                name="variationVisitors"
                type="number"
                step="1"
                min="1"
                value={analyzeForm.variationVisitors}
                onChange={handleAnalyzeChange}
                placeholder="e.g. 5000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="variationConversions" className="block text-sm font-medium text-gray-700 mb-1">
                Variation Conversions
              </label>
              <input
                id="variationConversions"
                name="variationConversions"
                type="number"
                step="1"
                min="0"
                value={analyzeForm.variationConversions}
                onChange={handleAnalyzeChange}
                placeholder="e.g. 185"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="avgTransactionValue" className="block text-sm font-medium text-gray-700 mb-1">
                Average Transaction Value ($)
                <span className="text-gray-400 font-normal ml-1">- optional</span>
              </label>
              <input
                id="avgTransactionValue"
                name="avgTransactionValue"
                type="number"
                step="0.01"
                min="0"
                value={analyzeForm.avgTransactionValue}
                onChange={handleAnalyzeChange}
                placeholder="e.g. 250"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Analyze
          </button>

          {/* Analyze Results */}
          {analyzeResult && (
            <div className="space-y-5 pt-4 border-t border-gray-100">
              {/* Significance Badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${
                    analyzeResult.isSignificant
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {analyzeResult.isSignificant ? 'Statistically Significant' : 'Not Significant'}
                </span>
                <span className="text-sm text-gray-500">
                  p-value: {analyzeResult.pValue}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ResultCard
                  label="Control CR"
                  value={`${analyzeResult.controlCR}%`}
                />
                <ResultCard
                  label="Variation CR"
                  value={`${analyzeResult.variationCR}%`}
                  highlight={analyzeResult.variationCR > analyzeResult.controlCR}
                />
                <ResultCard
                  label="Absolute Lift"
                  value={`${analyzeResult.absoluteLift > 0 ? '+' : ''}${analyzeResult.absoluteLift}%`}
                  highlight={analyzeResult.absoluteLift > 0}
                />
                <ResultCard
                  label="Relative Lift"
                  value={`${analyzeResult.relativeLift > 0 ? '+' : ''}${analyzeResult.relativeLift}%`}
                  highlight={analyzeResult.relativeLift > 0}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  label="Confidence Level"
                  value={`${analyzeResult.confidence}%`}
                />
                {analyzeResult.revenueImpact > 0 && (
                  <ResultCard
                    label="Est. Monthly Revenue Impact"
                    value={`$${analyzeResult.revenueImpact.toLocaleString()}`}
                    highlight
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Result Card                                         */
/* ------------------------------------------------------------------ */

function ResultCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className={`text-lg font-bold ${highlight ? 'text-green-700' : 'text-gray-900'}`}
      >
        {value}
      </div>
    </div>
  );
}
