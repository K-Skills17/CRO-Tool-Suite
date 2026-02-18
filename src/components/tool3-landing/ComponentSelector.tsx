'use client';

import React, { useState, useMemo } from 'react';
import type { LPComponent, ComponentType } from '@/lib/component-library';

interface ComponentSelectorProps {
  components: LPComponent[];
  onSelectionChange: (selected: LPComponent[]) => void;
}

const TYPE_LABELS: Record<ComponentType, string> = {
  hero: 'Hero Sections',
  trust_bar: 'Trust Bars',
  testimonials: 'Testimonials',
  cta: 'CTAs',
  features: 'Features',
  process: 'Process',
  faq: 'FAQ',
  pricing: 'Pricing',
  team: 'Team',
  guarantee: 'Guarantee',
  footer: 'Footer',
};

export default function ComponentSelector({ components, onSelectionChange }: ComponentSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<ComponentType | 'all'>('all');

  const types = useMemo(() => {
    const found = new Set(components.map((c) => c.type));
    return Array.from(found) as ComponentType[];
  }, [components]);

  const filtered = useMemo(() => {
    if (filterType === 'all') return components;
    return components.filter((c) => c.type === filterType);
  }, [components, filterType]);

  const selected = useMemo(() => {
    return components.filter((c) => selectedIds.has(c.id));
  }, [components, selectedIds]);

  const toggleComponent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const nextSelected = components.filter((c) => next.has(c.id));
      onSelectionChange(nextSelected);
      return next;
    });
  };

  const moveSelected = (index: number, direction: 'up' | 'down') => {
    const arr = [...selected];
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
    onSelectionChange(arr);
  };

  return (
    <div className="space-y-6">
      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
            filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({components.length})
        </button>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
              filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {TYPE_LABELS[type]} ({components.filter((c) => c.type === type).length})
          </button>
        ))}
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((comp) => (
          <button
            key={comp.id}
            onClick={() => toggleComponent(comp.id)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              selectedIds.has(comp.id)
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                {TYPE_LABELS[comp.type]}
              </span>
              <span className="text-xs text-green-600 font-medium">+{comp.avgLift} lift</span>
            </div>
            <h4 className="font-medium text-gray-900 text-sm mb-1">{comp.name}</h4>
            <p className="text-xs text-gray-500">{comp.description}</p>
            <p className="text-xs text-gray-400 mt-2">Tested on {comp.testedOn} sites</p>
          </button>
        ))}
      </div>

      {/* Selected Components Order */}
      {selected.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Selected Components ({selected.length})</h4>
          <div className="space-y-2">
            {selected.map((comp, idx) => (
              <div key={comp.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-mono text-blue-400 w-6">{idx + 1}</span>
                <span className="flex-1 text-sm font-medium text-blue-900">{comp.name}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveSelected(idx, 'up')}
                    disabled={idx === 0}
                    className="text-xs px-2 py-1 bg-white rounded border border-blue-200 disabled:opacity-30"
                  >
                    Up
                  </button>
                  <button
                    onClick={() => moveSelected(idx, 'down')}
                    disabled={idx === selected.length - 1}
                    className="text-xs px-2 py-1 bg-white rounded border border-blue-200 disabled:opacity-30"
                  >
                    Dn
                  </button>
                  <button
                    onClick={() => toggleComponent(comp.id)}
                    className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded border border-red-200"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
