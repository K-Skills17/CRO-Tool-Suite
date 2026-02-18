'use client';

import React, { useState } from 'react';
import { getVerticalOptionsByIndustry } from '@/config/healthcare-verticals';
import type { QuestionnaireAnswers } from '@/lib/component-library';

interface PageQuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
}

const GOALS = [
  { value: 'appointment', label: 'Book Appointment' },
  { value: 'consultation', label: 'Schedule Consultation' },
  { value: 'call', label: 'Call for Info/Emergency' },
  { value: 'download', label: 'Download Guide/Resource' },
  { value: 'purchase', label: 'Purchase/Sign Up' },
];

const AWARENESS_LEVELS = [
  { value: 'unaware', label: 'Unaware', desc: 'Don\'t know they have a problem yet' },
  { value: 'problem_aware', label: 'Problem-Aware', desc: 'Know the problem, researching solutions' },
  { value: 'solution_aware', label: 'Solution-Aware', desc: 'Know solutions exist, comparing providers' },
  { value: 'most_aware', label: 'Most Aware', desc: 'Ready to book, just need a push' },
];

export default function PageQuestionnaire({ onComplete }: PageQuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({
    hasTestimonials: false,
    hasBeforeAfter: false,
    hasVideoTestimonials: false,
    hasCredentials: false,
  });

  const totalSteps = 5;

  const updateAnswer = (key: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!answers.vertical;
      case 1: return !!answers.primaryGoal;
      case 2: return !!answers.audienceAwareness;
      case 3: return true; // checkboxes are optional
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete(answers as QuestionnaireAnswers);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 0: Vertical */}
      {step === 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">What type of business?</h3>
          <p className="text-sm text-gray-500 mb-4">This determines component recommendations and scoring weights.</p>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {getVerticalOptionsByIndustry().map((group) => (
              <div key={group.industry}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">{group.label}</p>
                <div className="space-y-2">
                  {group.verticals.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => updateAnswer('vertical', v.value)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        answers.vertical === v.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{v.label}</span>
                      <span className="text-xs text-gray-400 ml-2">{v.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Goal */}
      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the primary conversion goal?</h3>
          <div className="space-y-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => updateAnswer('primaryGoal', g.value)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  answers.primaryGoal === g.value
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Awareness */}
      {step === 2 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Target audience awareness level?</h3>
          <p className="text-sm text-gray-500 mb-4">This determines page length and content strategy.</p>
          <div className="space-y-2">
            {AWARENESS_LEVELS.map((a) => (
              <button
                key={a.value}
                onClick={() => updateAnswer('audienceAwareness', a.value)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  answers.audienceAwareness === a.value
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="font-medium">{a.label}</span>
                <span className="text-xs text-gray-400 block mt-1">{a.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Available Assets */}
      {step === 3 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">What assets do you have available?</h3>
          <p className="text-sm text-gray-500 mb-4">Check all that apply. This affects which sections we include.</p>
          <div className="space-y-3">
            {[
              { key: 'hasTestimonials', label: 'Customer/client testimonials with names' },
              { key: 'hasBeforeAfter', label: 'Before/after photos' },
              { key: 'hasVideoTestimonials', label: 'Video testimonials' },
              { key: 'hasCredentials', label: 'Professional credentials/certifications' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!(answers as any)[item.key]}
                  onChange={(e) => updateAnswer(item.key, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Offer Type */}
      {step === 4 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">What&apos;s your primary offer?</h3>
          <p className="text-sm text-gray-500 mb-4">This shapes the CTA and value proposition.</p>
          <input
            type="text"
            placeholder="e.g., Free Consultation, 50% Off First Visit, Free Assessment"
            value={answers.offerType || ''}
            onChange={(e) => updateAnswer('offerType', e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {step === totalSteps - 1 ? 'Build My Page' : 'Next'}
        </button>
      </div>
    </div>
  );
}
