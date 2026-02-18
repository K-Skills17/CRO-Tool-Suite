'use client';

import React, { useState, useMemo, useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ReportMode = 'internal' | 'client';
type PeriodType = 'month' | 'quarter' | 'custom';

interface ReportSection {
  id: string;
  label: string;
  internalOnly?: boolean;
}

export interface FunnelDataInput {
  stages: { label: string; count: number }[];
  overallCR: number;
}

export interface TestResultInput {
  name: string;
  result: 'win' | 'loss' | 'inconclusive';
  lift?: number;
  confidence?: number;
  learning?: string;
}

export interface ROIDataInput {
  additionalMonthlyRevenue: number;
  additionalAnnualRevenue: number;
  serviceFeeROI?: number;
}

export interface ReportGeneratorProps {
  projectName?: string;
  period?: string;
  auditScore?: number;
  funnelData?: FunnelDataInput;
  testResults?: TestResultInput[];
  roiData?: ROIDataInput;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const REPORT_SECTIONS: ReportSection[] = [
  { id: 'performance', label: 'Performance Summary' },
  { id: 'tests', label: 'Tests Completed' },
  { id: 'wins', label: 'Wins & Learnings' },
  { id: 'roadmap', label: 'Next Month Roadmap' },
  { id: 'roi', label: 'ROI Delivered' },
  { id: 'profit', label: 'Profit Margins & Time Spent', internalOnly: true },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ReportGenerator({
  projectName: propProjectName,
  period: propPeriod,
  auditScore,
  funnelData,
  testResults,
  roiData,
}: ReportGeneratorProps) {
  /* Form state */
  const [projectName, setProjectName] = useState(propProjectName || '');
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [periodLabel, setPeriodLabel] = useState(propPeriod || '');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [mode, setMode] = useState<ReportMode>('client');
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(REPORT_SECTIONS.filter((s) => !s.internalOnly).map((s) => s.id)),
  );
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  /* Resolved period string */
  const resolvedPeriod = useMemo(() => {
    if (periodType === 'custom' && customStart && customEnd) {
      return `${customStart} - ${customEnd}`;
    }
    return periodLabel || 'Not specified';
  }, [periodType, periodLabel, customStart, customEnd]);

  /* Visible sections based on mode */
  const visibleSections = useMemo(
    () =>
      REPORT_SECTIONS.filter((s) => {
        if (s.internalOnly && mode === 'client') return false;
        return selectedSections.has(s.id);
      }),
    [selectedSections, mode],
  );

  /* ---- Handlers ---- */
  const toggleSection = (id: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = () => {
    if (!projectName.trim()) {
      setError('Please enter a project name.');
      return;
    }
    if (periodType !== 'custom' && !periodLabel.trim()) {
      setError('Please specify the report period.');
      return;
    }
    if (periodType === 'custom' && (!customStart || !customEnd)) {
      setError('Please specify both start and end dates for a custom range.');
      return;
    }
    if (visibleSections.length === 0) {
      setError('Please select at least one section to include.');
      return;
    }
    setError(null);
    setShowPreview(true);
  };

  const handleExportPDF = () => {
    alert(
      'PDF export requires the jsPDF library.\n\nInstall with: npm install jspdf\n\nThen integrate jsPDF to convert the report HTML to a downloadable PDF.',
    );
  };

  const handleCopyHTML = () => {
    if (!reportRef.current) return;
    const html = reportRef.current.innerHTML;
    navigator.clipboard.writeText(html).then(
      () => alert('Report HTML copied to clipboard.'),
      () => alert('Failed to copy. Please try again.'),
    );
  };

  /* ---------------------------------------------------------------- */
  /*  Report HTML builder                                              */
  /* ---------------------------------------------------------------- */
  const reportHTML = useMemo(() => {
    if (!showPreview) return '';

    const sections: string[] = [];

    /* Header */
    sections.push(`
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="font-size:28px;font-weight:700;color:#111827;margin:0;">
          CRO Performance Report
        </h1>
        <p style="font-size:16px;color:#6b7280;margin-top:4px;">
          ${projectName} &mdash; ${resolvedPeriod}
        </p>
        ${mode === 'client' ? '' : '<p style="font-size:12px;color:#ef4444;margin-top:2px;">INTERNAL USE ONLY</p>'}
      </div>
    `);

    /* Performance Summary */
    if (selectedSections.has('performance')) {
      sections.push(`
        <div style="margin-bottom:28px;">
          <h2 style="font-size:18px;font-weight:600;color:#111827;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:12px;">
            Performance Summary
          </h2>
          ${
            auditScore !== undefined
              ? `<p style="font-size:14px;color:#374151;">Audit Score: <strong>${auditScore}/100</strong></p>`
              : ''
          }
          ${
            funnelData
              ? `
            <p style="font-size:14px;color:#374151;">Overall Conversion Rate: <strong>${funnelData.overallCR}%</strong></p>
            <table style="width:100%;border-collapse:collapse;margin-top:8px;">
              <thead>
                <tr style="background:#f9fafb;">
                  ${funnelData.stages.map((s) => `<th style="text-align:left;padding:6px 10px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">${s.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                <tr>
                  ${funnelData.stages.map((s) => `<td style="padding:6px 10px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${s.count.toLocaleString()}</td>`).join('')}
                </tr>
              </tbody>
            </table>
          `
              : '<p style="font-size:14px;color:#9ca3af;">No performance data provided. Add data from the Funnel Visualizer to populate this section.</p>'
          }
        </div>
      `);
    }

    /* Tests Completed */
    if (selectedSections.has('tests')) {
      sections.push(`
        <div style="margin-bottom:28px;">
          <h2 style="font-size:18px;font-weight:600;color:#111827;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:12px;">
            Tests Completed
          </h2>
          ${
            testResults && testResults.length > 0
              ? `
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="text-align:left;padding:6px 10px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Test</th>
                  <th style="text-align:center;padding:6px 10px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Result</th>
                  <th style="text-align:right;padding:6px 10px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Lift</th>
                  <th style="text-align:right;padding:6px 10px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Confidence</th>
                </tr>
              </thead>
              <tbody>
                ${testResults
                  .map(
                    (t) => `
                  <tr>
                    <td style="padding:6px 10px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${t.name}</td>
                    <td style="text-align:center;padding:6px 10px;font-size:13px;border-bottom:1px solid #f3f4f6;">
                      <span style="padding:2px 8px;border-radius:9999px;font-size:12px;font-weight:600;${
                        t.result === 'win'
                          ? 'background:#d1fae5;color:#065f46;'
                          : t.result === 'loss'
                          ? 'background:#fee2e2;color:#991b1b;'
                          : 'background:#fef3c7;color:#92400e;'
                      }">
                        ${t.result.charAt(0).toUpperCase() + t.result.slice(1)}
                      </span>
                    </td>
                    <td style="text-align:right;padding:6px 10px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${t.lift !== undefined ? `${t.lift > 0 ? '+' : ''}${t.lift}%` : '-'}</td>
                    <td style="text-align:right;padding:6px 10px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${t.confidence !== undefined ? `${t.confidence}%` : '-'}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          `
              : '<p style="font-size:14px;color:#9ca3af;">No test results available. Run tests in the A/B Test Calculator and pass results here.</p>'
          }
        </div>
      `);
    }

    /* Wins & Learnings */
    if (selectedSections.has('wins')) {
      const wins = testResults?.filter((t) => t.result === 'win') || [];
      const learnings = testResults?.filter((t) => t.learning) || [];
      sections.push(`
        <div style="margin-bottom:28px;">
          <h2 style="font-size:18px;font-weight:600;color:#111827;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:12px;">
            Wins & Learnings
          </h2>
          ${
            wins.length > 0
              ? `
            <h3 style="font-size:15px;font-weight:600;color:#065f46;margin-bottom:8px;">Wins</h3>
            <ul style="list-style:disc;padding-left:20px;margin-bottom:16px;">
              ${wins.map((w) => `<li style="font-size:14px;color:#374151;margin-bottom:4px;">${w.name}${w.lift !== undefined ? ` (+${w.lift}% lift)` : ''}</li>`).join('')}
            </ul>
          `
              : '<p style="font-size:14px;color:#9ca3af;margin-bottom:16px;">No wins recorded this period.</p>'
          }
          ${
            learnings.length > 0
              ? `
            <h3 style="font-size:15px;font-weight:600;color:#1e40af;margin-bottom:8px;">Key Learnings</h3>
            <ul style="list-style:disc;padding-left:20px;">
              ${learnings.map((l) => `<li style="font-size:14px;color:#374151;margin-bottom:4px;"><strong>${l.name}:</strong> ${l.learning}</li>`).join('')}
            </ul>
          `
              : '<p style="font-size:14px;color:#9ca3af;">No learnings documented. Add learning notes to your test results.</p>'
          }
        </div>
      `);
    }

    /* Next Month Roadmap */
    if (selectedSections.has('roadmap')) {
      sections.push(`
        <div style="margin-bottom:28px;">
          <h2 style="font-size:18px;font-weight:600;color:#111827;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:12px;">
            Next Month Roadmap
          </h2>
          <p style="font-size:14px;color:#9ca3af;">
            Use the Testing Prioritizer to build your roadmap. Top-priority items from the PIE-scored queue will appear here when integrated.
          </p>
          <div style="border:1px dashed #d1d5db;border-radius:8px;padding:16px;margin-top:8px;text-align:center;">
            <p style="font-size:13px;color:#9ca3af;">Roadmap items will be populated from your Testing Prioritizer queue.</p>
          </div>
        </div>
      `);
    }

    /* ROI Delivered */
    if (selectedSections.has('roi')) {
      sections.push(`
        <div style="margin-bottom:28px;">
          <h2 style="font-size:18px;font-weight:600;color:#111827;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:12px;">
            ROI Delivered
          </h2>
          ${
            roiData
              ? `
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <div style="flex:1;min-width:180px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
                <div style="font-size:12px;color:#6b7280;">Additional Monthly Revenue</div>
                <div style="font-size:22px;font-weight:700;color:#166534;">$${roiData.additionalMonthlyRevenue.toLocaleString()}</div>
              </div>
              <div style="flex:1;min-width:180px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
                <div style="font-size:12px;color:#6b7280;">Additional Annual Revenue</div>
                <div style="font-size:22px;font-weight:700;color:#166534;">$${roiData.additionalAnnualRevenue.toLocaleString()}</div>
              </div>
              ${
                roiData.serviceFeeROI !== undefined
                  ? `
                <div style="flex:1;min-width:180px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;">
                  <div style="font-size:12px;color:#6b7280;">Service Fee ROI</div>
                  <div style="font-size:22px;font-weight:700;color:#1e40af;">${roiData.serviceFeeROI}%</div>
                </div>
              `
                  : ''
              }
            </div>
          `
              : '<p style="font-size:14px;color:#9ca3af;">No ROI data provided. Use the ROI Calculator to generate projections.</p>'
          }
        </div>
      `);
    }

    /* Internal-only: Profit Margins */
    if (mode === 'internal' && selectedSections.has('profit')) {
      sections.push(`
        <div style="margin-bottom:28px;">
          <h2 style="font-size:18px;font-weight:600;color:#111827;border-bottom:2px solid #ef4444;padding-bottom:8px;margin-bottom:12px;">
            Profit Margins & Time Spent
            <span style="font-size:11px;color:#ef4444;margin-left:8px;">INTERNAL</span>
          </h2>
          <div style="border:1px dashed #fca5a5;border-radius:8px;padding:16px;background:#fef2f2;">
            <p style="font-size:14px;color:#991b1b;">
              This section is for internal review only. Track hours worked, profit margins, and operational costs here.
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
              <div style="background:white;border:1px solid #fee2e2;border-radius:6px;padding:12px;">
                <div style="font-size:12px;color:#6b7280;">Hours Spent</div>
                <div style="font-size:18px;font-weight:600;color:#111827;">-- hrs</div>
              </div>
              <div style="background:white;border:1px solid #fee2e2;border-radius:6px;padding:12px;">
                <div style="font-size:12px;color:#6b7280;">Profit Margin</div>
                <div style="font-size:18px;font-weight:600;color:#111827;">--%</div>
              </div>
            </div>
          </div>
        </div>
      `);
    }

    /* Footer */
    sections.push(`
      <div style="text-align:center;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:32px;">
        <p style="font-size:12px;color:#9ca3af;">
          Generated by CRO Tool Suite &mdash; ${new Date().toLocaleDateString()}
        </p>
      </div>
    `);

    return sections.join('');
  }, [
    showPreview,
    projectName,
    resolvedPeriod,
    mode,
    selectedSections,
    auditScore,
    funnelData,
    testResults,
    roiData,
  ]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Report Generator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Generate professional CRO performance reports for internal review or client delivery.
        </p>
      </div>

      {/* ---- Configuration ---- */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-base font-medium text-gray-900">Report Configuration</h3>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Project Name */}
          <div>
            <label htmlFor="reportProject" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              id="reportProject"
              value={projectName}
              onChange={(e) => { setProjectName(e.target.value); setError(null); }}
              placeholder="e.g. Dental Clinic CRO"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Period Type */}
          <div>
            <label htmlFor="reportPeriodType" className="block text-sm font-medium text-gray-700 mb-1">
              Report Period
            </label>
            <select
              id="reportPeriodType"
              value={periodType}
              onChange={(e) => { setPeriodType(e.target.value as PeriodType); setError(null); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Period details */}
        {periodType !== 'custom' ? (
          <div>
            <label htmlFor="reportPeriodLabel" className="block text-sm font-medium text-gray-700 mb-1">
              {periodType === 'month' ? 'Month' : 'Quarter'} Label
            </label>
            <input
              id="reportPeriodLabel"
              value={periodLabel}
              onChange={(e) => { setPeriodLabel(e.target.value); setError(null); }}
              placeholder={periodType === 'month' ? 'e.g. February 2026' : 'e.g. Q1 2026'}
              className="w-full sm:w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reportStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="reportStartDate"
                type="date"
                value={customStart}
                onChange={(e) => { setCustomStart(e.target.value); setError(null); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="reportEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="reportEndDate"
                type="date"
                value={customEnd}
                onChange={(e) => { setCustomEnd(e.target.value); setError(null); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Mode
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
            {(['client', 'internal'] as ReportMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-5 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                  mode === m
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'internal'
              ? 'Internal mode includes profit margins and time spent (not visible to clients).'
              : 'Client mode shows a clean, branded report without internal metrics.'}
          </p>
        </div>

        {/* Sections */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sections to Include
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {REPORT_SECTIONS.map((section) => {
              const disabled = section.internalOnly && mode === 'client';
              return (
                <label
                  key={section.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                    disabled
                      ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                      : selectedSections.has(section.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.has(section.id)}
                    disabled={disabled}
                    onChange={() => toggleSection(section.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{section.label}</span>
                  {section.internalOnly && (
                    <span className="text-xs text-red-500 font-medium ml-auto">Internal</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Report
        </button>
      </div>

      {/* ---- Report Preview ---- */}
      {showPreview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">Report Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyHTML}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Copy HTML
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export PDF
              </button>
            </div>
          </div>

          <div
            ref={reportRef}
            className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm"
            style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
            dangerouslySetInnerHTML={{ __html: reportHTML }}
          />
        </div>
      )}
    </div>
  );
}
