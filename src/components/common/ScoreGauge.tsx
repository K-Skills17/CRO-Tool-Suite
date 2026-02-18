'use client';

import React from 'react';
import { getGrade, getScoreColor } from '@/utils/scoring';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showGrade?: boolean;
}

const SIZES = {
  sm: { svgSize: 80, strokeWidth: 6, fontSize: 'text-lg', gradeSize: 'text-xs' },
  md: { svgSize: 120, strokeWidth: 8, fontSize: 'text-3xl', gradeSize: 'text-sm' },
  lg: { svgSize: 160, strokeWidth: 10, fontSize: 'text-4xl', gradeSize: 'text-lg' },
};

export default function ScoreGauge({ score, size = 'md', label, showGrade = true }: ScoreGaugeProps) {
  const config = SIZES[size];
  const radius = (config.svgSize - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);
  const grade = getGrade(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.svgSize, height: config.svgSize }}>
        <svg
          width={config.svgSize}
          height={config.svgSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.svgSize / 2}
            cy={config.svgSize / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={config.strokeWidth}
          />
          {/* Score circle */}
          <circle
            cx={config.svgSize / 2}
            cy={config.svgSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="score-gauge"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${config.fontSize}`} style={{ color }}>
            {score}
          </span>
          {showGrade && (
            <span className={`font-semibold text-gray-500 ${config.gradeSize}`}>
              {grade}
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="mt-1 text-xs text-gray-500 text-center">{label}</span>
      )}
    </div>
  );
}
