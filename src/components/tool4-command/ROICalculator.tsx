'use client';

import React, { useState } from 'react';
import { calculateROI, type ROIResult } from '@/utils/statistics';
import {
  HEALTHCARE_VERTICALS,
  VERTICAL_OPTIONS,
  type VerticalId,
} from '@/config/healthcare-verticals';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ROICalculator() {
  const [form, setForm] = useState({
    monthlyTraffic: '',
    currentCR: '',
    projectedLift: '',
    avgTransactionValue: '',
    monthlyServiceFee: '',
    vertical: '' as VerticalId | '',
  });
  const [result, setResult] = useState<ROIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* Selected vertical config (for benchmarks) */
  const verticalConfig =
    form.vertical && form.vertical in HEALTHCARE_VERTICALS
      ? HEALTHCARE_VERTICALS[form.vertical as VerticalId]
      : null;

  /* ---- Handlers ---- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleCalculate = () => {
    const traffic = parseFloat(form.monthlyTraffic);
    const cr = parseFloat(form.currentCR);
    const lift = parseFloat(form.projectedLift);
    const atv = parseFloat(form.avgTransactionValue);
    const fee = form.monthlyServiceFee ? parseFloat(form.monthlyServiceFee) : 0;

    if (isNaN(traffic) || traffic <= 0) {
      setError('Monthly traffic must be a positive number.');
      return;
    }
    if (isNaN(cr) || cr <= 0 || cr >= 100) {
      setError('Current conversion rate must be between 0 and 100 (exclusive).');
      return;
    }
    if (isNaN(lift) || lift <= 0) {
      setError('Projected CR lift must be a positive percentage.');
      return;
    }
    if (isNaN(atv) || atv <= 0) {
      setError('Average transaction value must be a positive number.');
      return;
    }
    if (form.monthlyServiceFee && (isNaN(fee) || fee < 0)) {
      setError('Monthly service fee must be a non-negative number.');
      return;
    }

    try {
      const roi = calculateROI(traffic, cr, lift, atv, fee);
      setResult(roi);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Calculation error. Check your inputs.');
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">ROI Calculator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Project the revenue impact of conversion rate optimization for your healthcare practice.
        </p>
      </div>

      {/* ---- Input Form ---- */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-base font-medium text-gray-900">Enter Your Data</h3>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="monthlyTraffic" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Traffic
            </label>
            <input
              id="monthlyTraffic"
              name="monthlyTraffic"
              type="number"
              min="1"
              value={form.monthlyTraffic}
              onChange={handleChange}
              placeholder="e.g. 15000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

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
              value={form.currentCR}
              onChange={handleChange}
              placeholder="e.g. 3.5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="projectedLift" className="block text-sm font-medium text-gray-700 mb-1">
              Projected CR Lift (%)
            </label>
            <input
              id="projectedLift"
              name="projectedLift"
              type="number"
              step="0.1"
              min="0.1"
              value={form.projectedLift}
              onChange={handleChange}
              placeholder="e.g. 20"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="avgTransactionValue" className="block text-sm font-medium text-gray-700 mb-1">
              Avg Transaction Value ($)
            </label>
            <input
              id="avgTransactionValue"
              name="avgTransactionValue"
              type="number"
              step="0.01"
              min="0.01"
              value={form.avgTransactionValue}
              onChange={handleChange}
              placeholder="e.g. 350"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="monthlyServiceFee" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Service Fee ($)
              <span className="text-gray-400 font-normal ml-1">- optional</span>
            </label>
            <input
              id="monthlyServiceFee"
              name="monthlyServiceFee"
              type="number"
              step="0.01"
              min="0"
              value={form.monthlyServiceFee}
              onChange={handleChange}
              placeholder="e.g. 2500"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="vertical" className="block text-sm font-medium text-gray-700 mb-1">
              Healthcare Vertical
              <span className="text-gray-400 font-normal ml-1">- for benchmarks</span>
            </label>
            <select
              id="vertical"
              name="vertical"
              value={form.vertical}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select vertical...</option>
              {VERTICAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Benchmark hint */}
        {verticalConfig && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
            <span className="font-medium">{verticalConfig.label} benchmarks:</span>{' '}
            Average CR {verticalConfig.benchmarks.average}% | Good {verticalConfig.benchmarks.good}% | Excellent{' '}
            {verticalConfig.benchmarks.excellent}%
          </div>
        )}

        <button
          onClick={handleCalculate}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Calculate ROI
        </button>
      </div>

      {/* ---- Results ---- */}
      {result && (
        <div className="space-y-6">
          {/* Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ROICard
              label="Current Monthly Conversions"
              value={result.currentMonthlyConversions.toLocaleString()}
              subtext={`$${result.currentMonthlyRevenue.toLocaleString()} revenue`}
            />
            <ROICard
              label="Projected Monthly Conversions"
              value={result.projectedMonthlyConversions.toLocaleString()}
              subtext={`$${result.projectedMonthlyRevenue.toLocaleString()} revenue`}
              highlight
            />
            <ROICard
              label="Additional Conversions / Month"
              value={`+${result.additionalConversions.toLocaleString()}`}
              subtext={`+$${result.additionalMonthlyRevenue.toLocaleString()} / month`}
              highlight
            />
            <ROICard
              label="Additional Annual Revenue"
              value={`$${result.additionalAnnualRevenue.toLocaleString()}`}
              large
              highlight
            />
            {result.serviceFeeROI > 0 && (
              <ROICard
                label="Service Fee ROI"
                value={`${result.serviceFeeROI}%`}
                subtext={`${result.serviceFeeROI > 100 ? 'Positive' : 'Negative'} return on investment`}
                highlight={result.serviceFeeROI > 100}
              />
            )}
          </div>

          {/* Visual Bar Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-medium text-gray-900">Revenue Comparison</h3>

            {/* Current */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Monthly Revenue</span>
                <span className="font-semibold text-gray-900">
                  ${result.currentMonthlyRevenue.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      (result.currentMonthlyRevenue /
                        Math.max(result.projectedMonthlyRevenue, 1)) *
                        100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Projected */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Projected Monthly Revenue</span>
                <span className="font-semibold text-green-700">
                  ${result.projectedMonthlyRevenue.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Difference callout */}
            <div className="flex items-center justify-center pt-2">
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm font-medium text-green-800">
                +${result.additionalMonthlyRevenue.toLocaleString()} / month | +$
                {result.additionalAnnualRevenue.toLocaleString()} / year
              </div>
            </div>
          </div>

          {/* Benchmark comparison */}
          {verticalConfig && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h3 className="text-base font-medium text-gray-900">
                Benchmark Comparison: {verticalConfig.label}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <BenchmarkCell
                  label="Average"
                  benchmark={verticalConfig.benchmarks.average}
                  currentCR={parseFloat(form.currentCR) || 0}
                />
                <BenchmarkCell
                  label="Good"
                  benchmark={verticalConfig.benchmarks.good}
                  currentCR={parseFloat(form.currentCR) || 0}
                />
                <BenchmarkCell
                  label="Excellent"
                  benchmark={verticalConfig.benchmarks.excellent}
                  currentCR={parseFloat(form.currentCR) || 0}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ROICard({
  label,
  value,
  subtext,
  highlight = false,
  large = false,
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? 'bg-green-50 border-green-200'
          : 'bg-gray-50 border-gray-100'
      } ${large ? 'sm:col-span-2 lg:col-span-1' : ''}`}
    >
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className={`font-bold ${large ? 'text-2xl' : 'text-lg'} ${
          highlight ? 'text-green-700' : 'text-gray-900'
        }`}
      >
        {value}
      </div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  );
}

function BenchmarkCell({
  label,
  benchmark,
  currentCR,
}: {
  label: string;
  benchmark: number;
  currentCR: number;
}) {
  const isAbove = currentCR >= benchmark;
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-lg font-bold text-gray-900">{benchmark}%</div>
      <div
        className={`text-xs font-medium mt-1 ${
          isAbove ? 'text-green-600' : 'text-amber-600'
        }`}
      >
        {isAbove ? 'You exceed this' : 'Room to improve'}
      </div>
    </div>
  );
}
