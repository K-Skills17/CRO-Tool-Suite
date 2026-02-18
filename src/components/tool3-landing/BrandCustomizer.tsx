'use client';

import React from 'react';
import type { BrandConfig } from '@/config/brand';

interface BrandCustomizerProps {
  brand: BrandConfig;
  onChange: (brand: BrandConfig) => void;
}

export default function BrandCustomizer({ brand, onChange }: BrandCustomizerProps) {
  const update = (key: keyof BrandConfig, value: string) => {
    onChange({ ...brand, [key]: value });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h3 className="font-semibold text-gray-900">Brand Settings</h3>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          value={brand.companyName}
          onChange={(e) => update('companyName', e.target.value)}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>

      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <input
          type="text"
          value={brand.tagline}
          onChange={(e) => update('tagline', e.target.value)}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brand.primaryColor}
              onChange={(e) => update('primaryColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200"
            />
            <input
              type="text"
              value={brand.primaryColor}
              onChange={(e) => update('primaryColor', e.target.value)}
              className="flex-1 p-2 border border-gray-200 rounded text-xs font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Secondary</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brand.secondaryColor}
              onChange={(e) => update('secondaryColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200"
            />
            <input
              type="text"
              value={brand.secondaryColor}
              onChange={(e) => update('secondaryColor', e.target.value)}
              className="flex-1 p-2 border border-gray-200 rounded text-xs font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Accent</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brand.accentColor}
              onChange={(e) => update('accentColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200"
            />
            <input
              type="text"
              value={brand.accentColor}
              onChange={(e) => update('accentColor', e.target.value)}
              className="flex-1 p-2 border border-gray-200 rounded text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <div style={{ background: brand.primaryColor }} className="p-4 text-white">
            <p className="font-bold">{brand.companyName}</p>
            <p className="text-sm opacity-80">{brand.tagline}</p>
          </div>
          <div className="p-4 bg-white">
            <p className="text-sm text-gray-600 mb-3">Sample body text with brand elements</p>
            <button
              style={{ background: brand.primaryColor }}
              className="px-4 py-2 text-white text-sm rounded-md font-medium"
            >
              Primary Button
            </button>
            <button
              style={{ background: brand.secondaryColor }}
              className="px-4 py-2 text-white text-sm rounded-md font-medium ml-2"
            >
              Secondary
            </button>
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (optional)</label>
        <input
          type="text"
          value={brand.logoUrl || ''}
          onChange={(e) => update('logoUrl', e.target.value)}
          placeholder="https://example.com/logo.png"
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
      </div>
    </div>
  );
}
