/**
 * Tool 3: Landing Page Assembly System
 * Component-based landing page builder with smart recommendations.
 */
import React, { useState } from 'react';
import Layout from '@/components/common/Layout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Tabs from '@/components/common/Tabs';
import PageQuestionnaire from '@/components/tool3-landing/PageQuestionnaire';
import ComponentSelector from '@/components/tool3-landing/ComponentSelector';
import PagePreview from '@/components/tool3-landing/PagePreview';
import BrandCustomizer from '@/components/tool3-landing/BrandCustomizer';
import { recommendLayout, getComponents, assemblePageHTML, assemblePageCSS } from '@/lib/component-library';
import type { QuestionnaireAnswers, PageLayout, LPComponent } from '@/lib/component-library';
import { getBrand, updateBrand, BrandConfig } from '@/config/brand';

export default function PageBuilderPage() {
  const [mode, setMode] = useState<'internal' | 'client'>('internal');
  const [layout, setLayout] = useState<PageLayout | null>(null);
  const [brand, setBrand] = useState<BrandConfig>(getBrand());
  const [selectedComponents, setSelectedComponents] = useState<LPComponent[]>([]);

  const handleQuestionnaireComplete = (answers: QuestionnaireAnswers) => {
    const recommended = recommendLayout(answers);
    setLayout(recommended);
    setSelectedComponents(recommended.sections.map((s) => s.component));
  };

  const handleBrandChange = (newBrand: BrandConfig) => {
    updateBrand(newBrand);
    setBrand(newBrand);
  };

  return (
    <Layout activeTool="landing" mode={mode} onModeChange={setMode}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Page Assembly System</h1>
          <p className="text-gray-500 mt-1">
            Build conversion-optimized landing pages with tested components
          </p>
        </div>

        <ErrorBoundary>
          <Tabs
            tabs={[
              {
                id: 'questionnaire',
                label: 'Smart Builder',
                content: (
                  <PageQuestionnaire onComplete={handleQuestionnaireComplete} />
                ),
              },
              {
                id: 'components',
                label: 'Component Library',
                content: (
                  <ComponentSelector
                    components={getComponents()}
                    onSelectionChange={setSelectedComponents}
                  />
                ),
              },
              {
                id: 'preview',
                label: 'Preview & Export',
                content: layout ? (
                  <PagePreview layout={layout} brand={brand} />
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">
                      Complete the Smart Builder questionnaire or select components to preview.
                    </p>
                  </div>
                ),
              },
              {
                id: 'brand',
                label: 'Brand Settings',
                content: (
                  <BrandCustomizer brand={brand} onChange={handleBrandChange} />
                ),
              },
            ]}
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
