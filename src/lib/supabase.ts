/**
 * Supabase Client
 * Initializes and exports the Supabase client for database operations.
 * Falls back gracefully if Supabase is not configured (local-only mode).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let initError: string | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    initError = 'Supabase URL or Anon Key not configured. Running in local-only mode.';
    console.warn(`[SUPABASE_WARN] ${initError}`);
    return null;
  }

  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (err) {
    initError = `Failed to initialize Supabase client: ${err}`;
    console.error(`[SUPABASE_ERROR] ${initError}`);
    return null;
  }
}

export function getSupabaseStatus(): { connected: boolean; error: string | null } {
  return {
    connected: supabaseInstance !== null,
    error: initError,
  };
}

/**
 * SQL for creating the required tables.
 * Run this in Supabase SQL Editor during setup.
 */
export const SETUP_SQL = `
-- Audit results storage
CREATE TABLE IF NOT EXISTS audit_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  vertical TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  category_scores JSONB NOT NULL,
  html_analysis JSONB,
  recommendations JSONB,
  mode TEXT DEFAULT 'internal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  vertical TEXT NOT NULL,
  website_url TEXT,
  monthly_traffic INTEGER DEFAULT 0,
  current_cr NUMERIC(5,2) DEFAULT 0,
  avg_transaction_value NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy analysis history
CREATE TABLE IF NOT EXISTS copy_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  original_copy TEXT NOT NULL,
  analysis JSONB NOT NULL,
  improvements JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer language entries
CREATE TABLE IF NOT EXISTS customer_language (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  source_type TEXT NOT NULL,
  original_text TEXT NOT NULL,
  extracted_phrases JSONB,
  pain_points JSONB,
  desires JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B test records
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  hypothesis TEXT,
  test_type TEXT,
  status TEXT DEFAULT 'planned',
  pie_score JSONB,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Landing page components
CREATE TABLE IF NOT EXISTS lp_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  component_type TEXT NOT NULL,
  style TEXT NOT NULL,
  name TEXT NOT NULL,
  html_template TEXT NOT NULL,
  css_template TEXT,
  works_best_for JSONB,
  conversion_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funnel data
CREATE TABLE IF NOT EXISTS funnel_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  period TEXT NOT NULL,
  page_visits INTEGER DEFAULT 0,
  form_starts INTEGER DEFAULT 0,
  form_completions INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_results_url ON audit_results(url);
CREATE INDEX IF NOT EXISTS idx_audit_results_vertical ON audit_results(vertical);
CREATE INDEX IF NOT EXISTS idx_copy_analyses_project ON copy_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_project ON ab_tests(project_id);
CREATE INDEX IF NOT EXISTS idx_funnel_data_project ON funnel_data(project_id);
`;
