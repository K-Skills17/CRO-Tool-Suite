'use client';

import React, { useState, useMemo } from 'react';
import { calculatePIEScore, type PIEScore } from '@/utils/statistics';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TestType =
  | 'headline'
  | 'CTA'
  | 'form'
  | 'layout'
  | 'copy'
  | 'image'
  | 'pricing';

const TEST_TYPE_OPTIONS: { value: TestType; label: string }[] = [
  { value: 'headline', label: 'Headline' },
  { value: 'CTA', label: 'CTA' },
  { value: 'form', label: 'Form' },
  { value: 'layout', label: 'Layout' },
  { value: 'copy', label: 'Copy' },
  { value: 'image', label: 'Image' },
  { value: 'pricing', label: 'Pricing' },
];

export interface TestItem {
  id: string;
  name: string;
  description: string;
  testType: TestType;
  hypothesis: string;
  potential: number;
  importance: number;
  ease: number;
  pieScore: PIEScore;
  estimatedLift: string;
  estimatedDuration: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function estimateLiftFromPIE(score: number): string {
  if (score >= 8) return '15-30%';
  if (score >= 6) return '8-15%';
  if (score >= 4) return '3-8%';
  return '1-3%';
}

function estimateDurationFromEase(ease: number): string {
  if (ease >= 8) return '1-2 weeks';
  if (ease >= 6) return '2-3 weeks';
  if (ease >= 4) return '3-4 weeks';
  return '4-6 weeks';
}

const PRIORITY_STYLES: Record<PIEScore['priority'], string> = {
  Critical: 'bg-red-100 text-red-800 border-red-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-gray-100 text-gray-700 border-gray-200',
};

const EFFORT_LABEL: Record<string, string> = {
  '1-2 weeks': 'Low',
  '2-3 weeks': 'Medium',
  '3-4 weeks': 'High',
  '4-6 weeks': 'Very High',
};

/* ------------------------------------------------------------------ */
/*  Default form state                                                 */
/* ------------------------------------------------------------------ */

interface FormState {
  name: string;
  description: string;
  testType: TestType;
  hypothesis: string;
  potential: number;
  importance: number;
  ease: number;
}

const INITIAL_FORM: FormState = {
  name: '',
  description: '',
  testType: 'headline',
  hypothesis: '',
  potential: 5,
  importance: 5,
  ease: 5,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TestingPrioritizer() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  /* Sorted list ---------------------------------------------------- */
  const sortedTests = useMemo(
    () => [...tests].sort((a, b) => b.pieScore.total - a.pieScore.total),
    [tests],
  );

  /* Live PIE preview ---------------------------------------------- */
  const livePIE = useMemo(
    () => calculatePIEScore(form.potential, form.importance, form.ease),
    [form.potential, form.importance, form.ease],
  );

  /* Handlers ------------------------------------------------------ */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSlider = (field: 'potential' | 'importance' | 'ease', value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    if (!form.name.trim()) {
      setError('Please enter a test name.');
      return;
    }
    if (!form.hypothesis.trim()) {
      setError('Please enter a hypothesis for the test.');
      return;
    }

    const pieScore = calculatePIEScore(form.potential, form.importance, form.ease);

    const item: TestItem = {
      id: generateId(),
      name: form.name.trim(),
      description: form.description.trim(),
      testType: form.testType,
      hypothesis: form.hypothesis.trim(),
      potential: form.potential,
      importance: form.importance,
      ease: form.ease,
      pieScore,
      estimatedLift: estimateLiftFromPIE(pieScore.total),
      estimatedDuration: estimateDurationFromEase(form.ease),
    };

    setTests((prev) => [...prev, item]);
    setForm(INITIAL_FORM);
    setError(null);
  };

  const handleRemove = (id: string) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAll = () => {
    setTests([]);
  };

  const handleExport = () => {
    const rows = sortedTests.map((t, i) => ({
      rank: i + 1,
      name: t.name,
      type: t.testType,
      hypothesis: t.hypothesis,
      potential: t.potential,
      importance: t.importance,
      ease: t.ease,
      pieScore: t.pieScore.total,
      priority: t.pieScore.priority,
      estimatedLift: t.estimatedLift,
      estimatedDuration: t.estimatedDuration,
    }));

    const header = Object.keys(rows[0] || {}).join(',');
    const csv = [
      header,
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${v}"`)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'testing-priority-list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Testing Prioritizer</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add potential tests and score them using the PIE framework to prioritize your testing roadmap.
        </p>
      </div>

      {/* ---- Form ---- */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-base font-medium text-gray-900">Add a New Test</h3>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Name & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Test Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Hero headline variant B"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-1">
              Test Type
            </label>
            <select
              id="testType"
              name="testType"
              value={form.testType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TEST_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            placeholder="Short description of what will be tested..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Hypothesis */}
        <div>
          <label htmlFor="hypothesis" className="block text-sm font-medium text-gray-700 mb-1">
            Hypothesis <span className="text-red-500">*</span>
          </label>
          <textarea
            id="hypothesis"
            name="hypothesis"
            value={form.hypothesis}
            onChange={handleChange}
            rows={2}
            placeholder="If we change X, then Y will improve because Z..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* PIE Sliders */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">PIE Scoring</h4>

          {(['potential', 'importance', 'ease'] as const).map((field) => (
            <div key={field}>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor={`slider-${field}`} className="text-sm text-gray-600 capitalize">
                  {field}
                </label>
                <span className="text-sm font-semibold text-gray-900">
                  {form[field]}
                </span>
              </div>
              <input
                id={`slider-${field}`}
                type="range"
                min={1}
                max={10}
                step={1}
                value={form[field]}
                onChange={(e) => handleSlider(field, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          ))}

          {/* Live PIE preview */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm text-gray-600">PIE Score Preview:</span>
            <span className="text-lg font-bold text-blue-700">{livePIE.total}</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[livePIE.priority]}`}
            >
              {livePIE.priority}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Test to Queue
        </button>
      </div>

      {/* ---- Prioritized List ---- */}
      {sortedTests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">
              Prioritized Test Queue ({sortedTests.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sortedTests.map((test, idx) => (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm">
                  #{idx + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 truncate">{test.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      {test.testType}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[test.pieScore.priority]}`}
                    >
                      {test.pieScore.priority}
                    </span>
                  </div>
                  {test.description && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{test.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 italic truncate">
                    Hypothesis: {test.hypothesis}
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-700">{test.pieScore.total}</div>
                    <div className="text-xs text-gray-400">PIE Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-700">{test.estimatedLift}</div>
                    <div className="text-xs text-gray-400">Est. Lift</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-700">
                      {EFFORT_LABEL[test.estimatedDuration] || test.estimatedDuration}
                    </div>
                    <div className="text-xs text-gray-400">Effort</div>
                  </div>
                  <div className="text-center text-xs text-gray-400">
                    <div className="font-medium text-gray-600">{test.estimatedDuration}</div>
                    <div>Duration</div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(test.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Remove test"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {sortedTests.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <svg
            className="mx-auto w-12 h-12 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm">No tests in the queue yet. Add your first test above.</p>
        </div>
      )}
    </div>
  );
}
