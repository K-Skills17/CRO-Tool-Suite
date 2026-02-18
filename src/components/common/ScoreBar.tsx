'use client';

import React from 'react';
import { getScoreColor } from '@/utils/scoring';

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  showPercentage?: boolean;
}

export default function ScoreBar({ label, score, maxScore = 100, showPercentage = true }: ScoreBarProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const color = getScoreColor(percentage);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-40 shrink-0 truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {showPercentage && (
        <span className="text-sm font-medium w-12 text-right" style={{ color }}>
          {percentage}
        </span>
      )}
    </div>
  );
}
