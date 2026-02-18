'use client';

import React, { useState, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FunnelStage {
  label: string;
  count: number;
}

interface FunnelPeriod {
  id: string;
  label: string;
  stages: FunnelStage[];
}

interface DropOffInfo {
  from: string;
  to: string;
  percentage: number;
  index: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STAGE_LABELS = ['Page Visits', 'Form Starts', 'Form Completions', 'Conversions'];

const STAGE_COLORS = [
  'bg-green-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-red-500',
];

const STAGE_BORDER_COLORS = [
  'border-green-400',
  'border-yellow-400',
  'border-orange-400',
  'border-red-400',
];

const RECOMMENDATIONS: {
  fromIdx: number;
  toIdx: number;
  threshold: number;
  message: string;
}[] = [
  {
    fromIdx: 0,
    toIdx: 1,
    threshold: 70,
    message:
      "Your page isn't compelling enough to start the form. Consider improving your hero section, value proposition, and above-the-fold content.",
  },
  {
    fromIdx: 1,
    toIdx: 2,
    threshold: 50,
    message:
      'Your form has too much friction. Reduce the number of fields, add progress indicators, or break the form into smaller steps.',
  },
  {
    fromIdx: 2,
    toIdx: 3,
    threshold: 30,
    message:
      'Post-submission experience needs work. Improve your thank-you page, confirmation messaging, and follow-up speed.',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId(): string {
  return `period_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function calcDropOffs(stages: FunnelStage[]): DropOffInfo[] {
  const dropOffs: DropOffInfo[] = [];
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].count;
    const curr = stages[i].count;
    const pct = prev > 0 ? ((prev - curr) / prev) * 100 : 0;
    dropOffs.push({
      from: stages[i - 1].label,
      to: stages[i].label,
      percentage: Math.round(pct * 10) / 10,
      index: i - 1,
    });
  }
  return dropOffs;
}

function parseCSV(raw: string): FunnelPeriod | null {
  const lines = raw
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  // Expect header row, then one or more data rows.
  // Format: period_label, page_visits, form_starts, form_completions, conversions
  const rows = lines.slice(1).map((line) =>
    line.split(',').map((cell) => cell.trim().replace(/^["']|["']$/g, '')),
  );

  if (rows.length === 0) return null;

  const firstRow = rows[0];
  if (firstRow.length < 5) return null;

  const label = firstRow[0];
  const counts = firstRow.slice(1, 5).map(Number);

  if (counts.some(isNaN)) return null;

  return {
    id: generateId(),
    label: label || 'Imported',
    stages: STAGE_LABELS.map((sl, i) => ({ label: sl, count: counts[i] })),
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FunnelVisualizer() {
  const [periods, setPeriods] = useState<FunnelPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  /* Manual form state */
  const [formLabel, setFormLabel] = useState('');
  const [formVisits, setFormVisits] = useState('');
  const [formStarts, setFormStarts] = useState('');
  const [formCompletions, setFormCompletions] = useState('');
  const [formConversions, setFormConversions] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  /* CSV state */
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);

  /* Active period for display */
  const activePeriod = useMemo(
    () => periods.find((p) => p.id === selectedPeriodId) || periods[0] || null,
    [periods, selectedPeriodId],
  );

  const dropOffs = useMemo(
    () => (activePeriod ? calcDropOffs(activePeriod.stages) : []),
    [activePeriod],
  );

  const biggestLeak = useMemo(
    () =>
      dropOffs.length > 0
        ? dropOffs.reduce((max, d) => (d.percentage > max.percentage ? d : max), dropOffs[0])
        : null,
    [dropOffs],
  );

  const recommendations = useMemo(() => {
    if (!activePeriod) return [];
    const dos = calcDropOffs(activePeriod.stages);
    return RECOMMENDATIONS.filter((r) => {
      const d = dos.find((d) => d.index === r.fromIdx);
      return d && d.percentage > r.threshold;
    });
  }, [activePeriod]);

  /* ---- Handlers: Manual ---- */
  const handleAddManual = () => {
    const visits = parseInt(formVisits, 10);
    const starts = parseInt(formStarts, 10);
    const completions = parseInt(formCompletions, 10);
    const conversions = parseInt(formConversions, 10);

    if (!formLabel.trim()) {
      setFormError('Please enter a period label (e.g. "January 2026").');
      return;
    }
    if ([visits, starts, completions, conversions].some(isNaN)) {
      setFormError('All stage values must be valid numbers.');
      return;
    }
    if ([visits, starts, completions, conversions].some((v) => v < 0)) {
      setFormError('Stage values cannot be negative.');
      return;
    }

    const period: FunnelPeriod = {
      id: generateId(),
      label: formLabel.trim(),
      stages: STAGE_LABELS.map((sl, i) => ({
        label: sl,
        count: [visits, starts, completions, conversions][i],
      })),
    };

    setPeriods((prev) => [...prev, period]);
    setSelectedPeriodId(period.id);
    setFormLabel('');
    setFormVisits('');
    setFormStarts('');
    setFormCompletions('');
    setFormConversions('');
    setFormError(null);
  };

  /* ---- Handlers: CSV ---- */
  const handleCSVImport = () => {
    const parsed = parseCSV(csvText);
    if (!parsed) {
      setCsvError(
        'Could not parse CSV. Expected format: header row, then rows with: period_label, page_visits, form_starts, form_completions, conversions',
      );
      return;
    }
    setPeriods((prev) => [...prev, parsed]);
    setSelectedPeriodId(parsed.id);
    setCsvText('');
    setCsvError(null);
  };

  const handleRemovePeriod = (id: string) => {
    setPeriods((prev) => prev.filter((p) => p.id !== id));
    if (selectedPeriodId === id) {
      setSelectedPeriodId(null);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Funnel Visualizer</h2>
        <p className="mt-1 text-sm text-gray-500">
          Visualize your conversion funnel, identify leaks, and get actionable recommendations.
        </p>
      </div>

      {/* ---- Data Entry ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-medium text-gray-900">Manual Entry</h3>

          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="funnelLabel" className="block text-sm font-medium text-gray-700 mb-1">
              Period Label
            </label>
            <input
              id="funnelLabel"
              value={formLabel}
              onChange={(e) => { setFormLabel(e.target.value); setFormError(null); }}
              placeholder="e.g. January 2026"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'funnelVisits', label: 'Page Visits', value: formVisits, setter: setFormVisits },
              { id: 'funnelStarts', label: 'Form Starts', value: formStarts, setter: setFormStarts },
              { id: 'funnelCompletions', label: 'Form Completions', value: formCompletions, setter: setFormCompletions },
              { id: 'funnelConversions', label: 'Conversions', value: formConversions, setter: setFormConversions },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-xs font-medium text-gray-600 mb-1">
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type="number"
                  min="0"
                  value={f.value}
                  onChange={(e) => { f.setter(e.target.value); setFormError(null); }}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleAddManual}
            className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Period
          </button>
        </div>

        {/* CSV Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-medium text-gray-900">CSV Import</h3>

          {csvError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {csvError}
            </div>
          )}

          <div>
            <label htmlFor="csvArea" className="block text-sm font-medium text-gray-700 mb-1">
              Paste CSV Data
            </label>
            <textarea
              id="csvArea"
              rows={6}
              value={csvText}
              onChange={(e) => { setCsvText(e.target.value); setCsvError(null); }}
              placeholder={`period,page_visits,form_starts,form_completions,conversions\nJanuary 2026,10000,3200,1800,540`}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleCSVImport}
            disabled={!csvText.trim()}
            className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Import CSV
          </button>
        </div>
      </div>

      {/* ---- Period Tabs ---- */}
      {periods.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <div key={p.id} className="flex items-center gap-1">
              <button
                onClick={() => setSelectedPeriodId(p.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  (selectedPeriodId || periods[0]?.id) === p.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
              <button
                onClick={() => handleRemovePeriod(p.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                title="Remove period"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---- Funnel Visualization ---- */}
      {activePeriod && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h3 className="text-base font-medium text-gray-900">
            Funnel: {activePeriod.label}
          </h3>

          {/* Bars */}
          <div className="space-y-3">
            {activePeriod.stages.map((stage, i) => {
              const maxCount = activePeriod.stages[0].count || 1;
              const widthPct = Math.max((stage.count / maxCount) * 100, 4);
              const drop = i > 0 ? dropOffs[i - 1] : null;
              const isBiggestLeak =
                biggestLeak !== null && drop !== null && drop.index === biggestLeak.index;

              return (
                <div key={stage.label}>
                  {/* Drop-off indicator */}
                  {drop && (
                    <div
                      className={`flex items-center gap-2 text-xs mb-1 ml-2 ${
                        isBiggestLeak ? 'text-red-600 font-semibold' : 'text-gray-500'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      {drop.percentage}% drop-off
                      {isBiggestLeak && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                          Biggest Leak
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bar */}
                  <div className="flex items-center gap-3">
                    <div className="w-36 text-sm text-gray-700 font-medium text-right flex-shrink-0">
                      {stage.label}
                    </div>
                    <div className="flex-1 relative">
                      <div className="w-full bg-gray-100 rounded-lg h-10 overflow-hidden">
                        <div
                          className={`h-full rounded-lg ${STAGE_COLORS[i]} ${
                            isBiggestLeak ? 'ring-2 ring-red-400 ring-offset-1' : ''
                          } transition-all duration-500`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-sm font-semibold text-gray-900 text-right flex-shrink-0">
                      {stage.count.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall conversion rate */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-100">
            <span className="text-sm text-gray-600">Overall Conversion Rate</span>
            <span className="text-lg font-bold text-blue-700">
              {activePeriod.stages[0].count > 0
                ? (
                    (activePeriod.stages[activePeriod.stages.length - 1].count /
                      activePeriod.stages[0].count) *
                    100
                  ).toFixed(2)
                : '0'}
              %
            </span>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Recommendations</h4>
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4"
                >
                  <svg
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-sm text-amber-800">{rec.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Trend Comparison ---- */}
      {periods.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-medium text-gray-900">Period Comparison</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Period</th>
                  {STAGE_LABELS.map((sl) => (
                    <th key={sl} className="text-right py-2 px-3 text-gray-600 font-medium">
                      {sl}
                    </th>
                  ))}
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">
                    Overall CR
                  </th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => {
                  const cr =
                    p.stages[0].count > 0
                      ? ((p.stages[p.stages.length - 1].count / p.stages[0].count) * 100).toFixed(
                          2,
                        )
                      : '0';
                  return (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 px-3 font-medium text-gray-900">{p.label}</td>
                      {p.stages.map((s) => (
                        <td key={s.label} className="py-2 px-3 text-right text-gray-700">
                          {s.count.toLocaleString()}
                        </td>
                      ))}
                      <td className="py-2 px-3 text-right font-semibold text-blue-700">
                        {cr}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {periods.length === 0 && (
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
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
          <p className="text-sm">No funnel data yet. Enter data manually or import CSV above.</p>
        </div>
      )}
    </div>
  );
}
