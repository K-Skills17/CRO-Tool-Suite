'use client';

import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTool?: string;
  mode?: 'internal' | 'client';
  onModeChange?: (mode: 'internal' | 'client') => void;
}

const TOOLS = [
  { id: 'audit', label: 'Conversion Audit', path: '/' },
  { id: 'copy', label: 'Copy Lab', path: '/copy-lab' },
  { id: 'landing', label: 'Page Builder', path: '/page-builder' },
  { id: 'command', label: 'Command Center', path: '/command-center' },
];

export default function Layout({ children, activeTool, mode = 'internal', onModeChange }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CRO</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">
                CRO Tool Suite
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {TOOLS.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTool === tool.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tool.label}
                </a>
              ))}
            </nav>

            {/* Mode Toggle + Mobile Menu */}
            <div className="flex items-center gap-3">
              {onModeChange && (
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => onModeChange('internal')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      mode === 'internal'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Internal
                  </button>
                  <button
                    onClick={() => onModeChange('client')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      mode === 'client'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Client
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-3 border-t border-gray-100 pt-2">
              {TOOLS.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.path}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    activeTool === tool.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tool.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-xs text-gray-400 text-center">
            CRO Tool Suite &mdash; Conversion Rate Optimization for Any Industry
          </p>
        </div>
      </footer>
    </div>
  );
}
