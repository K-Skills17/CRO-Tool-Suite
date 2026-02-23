# CRO Tool Suite - Complete Setup & Usage Guide

## Table of Contents

1. [What Is This?](#what-is-this)
2. [Prerequisites](#prerequisites)
3. [Quick Start (5 Steps)](#quick-start-5-steps)
4. [Environment Variables](#environment-variables)
5. [The 4 Tools - Full Walkthrough](#the-4-tools---full-walkthrough)
6. [Supabase Setup (Optional Persistence)](#supabase-setup-optional-persistence)
7. [Brand Customization](#brand-customization)
8. [Available Commands](#available-commands)
9. [Deploying to Vercel](#deploying-to-vercel)
10. [Project Architecture](#project-architecture)
11. [Troubleshooting](#troubleshooting)

---

## What Is This?

The **CRO Tool Suite** is a Next.js web application for **Conversion Rate Optimization** (CRO). It bundles 4 professional tools into a single application that runs in your browser. There is no separate backend to manage -- everything (UI + API) is bundled together by Next.js.

The suite supports **25+ industry verticals** (healthcare, e-commerce, SaaS, legal, real estate, and more) with industry-specific scoring weights and conversion benchmarks.

**Key capabilities:**
- Audit any website with 200+ CRO checkpoints
- Analyze and rewrite conversion copy
- Build optimized landing pages from a component library
- Run A/B test calculations, funnel analysis, and ROI modeling

---

## Prerequisites

| Tool | Minimum Version | How to Install |
|------|----------------|----------------|
| **Node.js** | v18.0.0+ | [nodejs.org](https://nodejs.org) (LTS recommended) |
| **npm** | v9.0.0+ | Bundled with Node.js |
| **Git** | Any recent | [git-scm.com](https://git-scm.com) |

Verify your installations:

```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
git --version    # Any version works
```

---

## Quick Start (5 Steps)

### Step 1: Clone the repository

```bash
git clone https://github.com/K-Skills17/CRO-Tool-Suite.git
cd CRO-Tool-Suite
```

### Step 2: Install dependencies

```bash
npm install
```

This installs Next.js, React, Tailwind CSS, Cheerio (HTML parser), jsPDF (PDF export), Recharts (charts), and all other packages.

### Step 3: Configure environment variables (optional)

```bash
cp .env.local.example .env.local
```

The app works fully **without any environment variables**. See [Environment Variables](#environment-variables) for what each one does.

### Step 4: Start the development server

```bash
npm run dev
```

### Step 5: Open in your browser

Navigate to **http://localhost:3000**

You should see the **Conversion Intelligence Platform** (Tool 1) landing page with a URL input form and vertical selector.

---

## Environment Variables

Create a `.env.local` file (or copy from `.env.local.example`):

| Variable | Required? | Default | Description |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | None | Your Supabase project URL for persistent data storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | None | Your Supabase anonymous/public key |
| `NEXT_PUBLIC_BRAND_NAME` | No | `CRO Tool Suite` | Custom brand name shown in the header |
| `NEXT_PUBLIC_BRAND_PRIMARY_COLOR` | No | `#2563eb` | Primary brand color (hex format) |
| `NEXT_PUBLIC_BRAND_SECONDARY_COLOR` | No | `#1e40af` | Secondary brand color (hex format) |

**Without Supabase:** All data is stored in browser localStorage. Audit results, copy analyses, and funnel data persist across page refreshes but not across different browsers/devices.

**With Supabase:** Data is stored in a PostgreSQL database. You get cross-device persistence and can share results between team members. See [Supabase Setup](#supabase-setup-optional-persistence) for instructions.

---

## The 4 Tools - Full Walkthrough

### Tool 1: Conversion Intelligence Platform (`/`)

**What it does:** Audits any website against 200+ CRO checkpoints across 7 categories.

**How to use it:**

1. **Enter a URL** - Type any website URL (e.g., `https://example.com`)
2. **Select your industry vertical** - Choose from 25+ options (dental, e-commerce, SaaS, etc.). This adjusts scoring weights so a healthcare site is scored differently than an e-commerce site.
3. **Choose mode** - "Internal" shows all technical details; "Client" shows a cleaner report for client delivery.
4. **Click "Run Audit"** - The app fetches the page server-side (no CORS issues), parses the HTML, and runs every checkpoint.

**What you get:**
- **Overall score** (0-100) with letter grade (A+ through F)
- **7 category breakdowns:**
  - Visual Hierarchy & UX (layout, typography, images)
  - Copy Effectiveness (headlines, benefits, emotional triggers)
  - Trust & Credibility (testimonials, credentials, reviews)
  - Conversion Friction (forms, CTAs, checkout flow)
  - Mobile Optimization (responsive design, touch targets)
  - CTA Optimization (button placement, copy, design)
  - Compliance & Privacy (GDPR, disclaimers, HTTPS)
- **Industry benchmark comparison** - How you compare to average/good/excellent for your vertical
- **Prioritized recommendations** - Sorted by potential impact

**Competitor Analysis:**
1. Run an audit on your site first
2. Add competitor URLs and run audits on them
3. The Competitor View shows side-by-side score comparison, a radar chart, competitive gaps, and improvement opportunities

---

### Tool 2: Conversion Copy Laboratory (`/copy-lab`)

**What it does:** Analyzes copy effectiveness and generates optimized variations.

**3 tabs:**

#### Tab 1: Copy Analyzer
1. **Paste your copy** - Headlines, body text, CTAs, or full page copy
2. **Select industry vertical** (optional) - For industry-specific analysis
3. **Click "Analyze Copy"**

**What you get:**
- Overall copy score (0-100)
- 5 category scores: Clarity, Persuasion, Emotional Impact, Readability, CTA Strength
- Analysis highlights (power words, emotional triggers, benefit phrases, reading level)
- Improvement suggestions
- Recommended copywriting framework

#### Tab 2: Copy Rewriter
1. **Paste original copy**
2. **Select framework** - PAS (Problem-Agitate-Solve), AIDA (Attention-Interest-Desire-Action), BAB (Before-After-Bridge), or 4Ps
3. **Click "Generate Variations"**

**What you get:** 3+ A/B test variations rewritten using the selected framework, ready to test.

#### Tab 3: Language Extractor
1. **Paste customer reviews, testimonials, or support tickets**
2. **Select source type** (Google Reviews, Testimonials, Support Tickets)
3. **Click "Extract Language"**

**What you get:**
- Pain points extracted in customers' own words
- Desires and goals
- Emotional triggers
- Objections and concerns
- Common phrases
- Click "Suggest Headlines" to generate headlines using the extracted language

---

### Tool 3: Landing Page Assembly System (`/page-builder`)

**What it does:** Builds conversion-optimized landing pages from a component library.

**2 builder modes:**

#### Smart Builder (Recommended)
1. Answer 5 questions:
   - Business type (vertical)
   - Primary conversion goal (appointment, consultation, purchase, etc.)
   - Audience awareness level (unaware → most aware)
   - Available assets (testimonials, before/after photos, credentials)
   - Primary offer
2. The system recommends the optimal page structure based on your answers

#### Manual Builder
1. Browse the component library (10+ component types)
2. Select components: Hero sections, testimonials, features, CTAs, FAQ, pricing, etc.
3. Each component shows conversion data from past tests
4. Reorder sections as needed

**After building:**
- **Preview** your page in desktop or mobile view
- **Export as HTML/CSS** - Download a single HTML file ready to deploy
- **Copy HTML** to clipboard
- **Customize branding** - Colors, company name, fonts

---

### Tool 4: Optimization Command Center (`/command-center`)

**What it does:** 5 tools for managing your optimization program.

#### Tab 1: Testing Prioritizer
1. **Add test ideas** with a name, hypothesis, and category
2. **Score each test** on PIE framework:
   - **Potential** (1-10): How much room for improvement?
   - **Importance** (1-10): How valuable is this page/element?
   - **Ease** (1-10): How easy is this to implement?
3. Tests are automatically sorted by priority (Critical → Low)

#### Tab 2: A/B Test Calculator
- **Sample Size Calculator**: Enter baseline conversion rate, minimum detectable effect, confidence level, and power to get required sample size
- **Results Analyzer**: Enter control/variation visitors and conversions to get statistical significance, confidence level, p-value, lift, and revenue impact
- **Duration Estimator**: Enter daily traffic to estimate test duration

#### Tab 3: Funnel Visualizer
1. **Add funnel data** manually or import CSV
   - CSV format: `period,page_visits,form_starts,form_completions,conversions`
2. **Visualize the funnel** - See drop-off percentages between each stage
3. **Identify the biggest leak** - Highlighted in red
4. **Get recommendations** based on where drop-offs exceed thresholds
5. **Compare periods** - Add multiple months to see trends

#### Tab 4: ROI Calculator
1. Enter: Monthly traffic, current conversion rate, projected CR lift, average transaction value, monthly service fee
2. Get: Current vs projected conversions, additional monthly/annual revenue, service fee ROI percentage

#### Tab 5: Report Generator
1. **Configure the report**: Project name, period, mode (client/internal), sections to include
2. **Generate** - Creates a formatted report with performance summary, test results, wins & learnings, roadmap, and ROI data
3. **Export PDF** - Downloads as a PDF file
4. **Copy HTML** - For embedding in emails or documents

---

## Supabase Setup (Optional Persistence)

Supabase provides a free PostgreSQL database for persistent storage. Without it, data is stored in browser localStorage only.

### Step 1: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Choose a name, set a database password, select a region
4. Wait for the project to initialize

### Step 2: Get your credentials

1. Go to **Project Settings > API**
2. Copy the **Project URL** (e.g., `https://xxxx.supabase.co`)
3. Copy the **anon/public key** (starts with `eyJ...`)

### Step 3: Create the database tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the following SQL (also found in `src/lib/supabase.ts`):

```sql
-- Audit results
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

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  vertical TEXT NOT NULL,
  website_url TEXT,
  monthly_traffic INTEGER DEFAULT 0,
  current_cr DECIMAL(5,2) DEFAULT 0,
  avg_transaction_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy analyses
CREATE TABLE IF NOT EXISTS copy_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  original_copy TEXT NOT NULL,
  analysis JSONB NOT NULL,
  improvements JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer language
CREATE TABLE IF NOT EXISTS customer_language (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  source_type TEXT NOT NULL,
  original_text TEXT NOT NULL,
  extracted_phrases JSONB NOT NULL,
  pain_points JSONB,
  desires JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B tests
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  hypothesis TEXT,
  test_type TEXT DEFAULT 'a/b',
  status TEXT DEFAULT 'draft',
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
  html_template TEXT,
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_url ON audit_results(url);
CREATE INDEX IF NOT EXISTS idx_audit_vertical ON audit_results(vertical);
CREATE INDEX IF NOT EXISTS idx_copy_project ON copy_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_language_project ON customer_language(project_id);
CREATE INDEX IF NOT EXISTS idx_tests_project ON ab_tests(project_id);
CREATE INDEX IF NOT EXISTS idx_funnel_project ON funnel_data(project_id);
```

### Step 4: Add credentials to your environment

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Restart the dev server

```bash
# Stop the server (Ctrl+C) then restart
npm run dev
```

The app will automatically detect Supabase and start persisting data.

---

## Brand Customization

You can customize the brand in two ways:

### Option 1: Environment Variables

```bash
NEXT_PUBLIC_BRAND_NAME=Your Agency Name
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=#2563eb
NEXT_PUBLIC_BRAND_SECONDARY_COLOR=#1e40af
```

### Option 2: In-App Customizer (Tool 3)

The Landing Page Assembly System includes a **Brand Customizer** panel where you can set:
- Company name
- Primary and secondary colors
- These settings apply to exported landing pages

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload (port 3000) |
| `npm run build` | Create a production build |
| `npm start` | Run the production build locally |
| `npm run lint` | Run the ESLint linter |
| `npm run test` | Run the test suite |

### Production Build

To create and run a production build locally:

```bash
npm run build
npm start
```

The production build is faster and optimized. Open **http://localhost:3000** to use it.

---

## Deploying to Vercel

### Step 1: Push to GitHub

Make sure your code is pushed to a GitHub repository.

### Step 2: Deploy

1. Sign up at [vercel.com](https://vercel.com) using your GitHub account
2. Click **"Add New Project"**
3. Import the `CRO-Tool-Suite` repository
4. Vercel auto-detects Next.js -- click **"Deploy"**
5. Your app will be live at a URL like `cro-tool-suite.vercel.app`

### Step 3: Add environment variables (if using Supabase)

1. Go to **Project Settings > Environment Variables**
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy for the changes to take effect

---

## Project Architecture

```
src/
├── pages/                    # Next.js routes
│   ├── index.tsx             # Tool 1: Audit
│   ├── copy-lab.tsx          # Tool 2: Copy Lab
│   ├── page-builder.tsx      # Tool 3: Page Builder
│   ├── command-center.tsx    # Tool 4: Command Center
│   └── api/fetch-page.ts    # Server-side HTML fetcher
├── components/               # React components by tool
│   ├── common/               # Shared (Layout, Tabs, ScoreGauge, etc.)
│   ├── tool1-audit/          # Audit components
│   ├── tool2-copy/           # Copy lab components
│   ├── tool3-landing/        # Page builder components
│   └── tool4-command/        # Command center components
├── lib/                      # Core business logic
│   ├── audit-engine.ts       # 200+ CRO checkpoint evaluation
│   ├── copy-engine.ts        # Copy analysis & scoring
│   ├── component-library.ts  # Landing page templates
│   ├── competitor-analyzer.ts# Competitor comparison logic
│   └── language-library.ts   # Customer language extraction
├── config/                   # Configuration
│   ├── healthcare-verticals.ts # 25+ industry verticals
│   ├── audit-checklist.ts    # 200+ audit checkpoints
│   └── brand.ts              # Brand settings
├── utils/                    # Helpers
│   ├── html-analyzer.ts      # HTML parsing & structure analysis
│   ├── text-analysis.ts      # Readability, sentiment, power words
│   ├── scoring.ts            # Score calculations & grading
│   ├── statistics.ts         # A/B test statistics & sample size
│   └── errors.ts             # Error handling
└── hooks/                    # Custom React hooks
    ├── useLocalStorage.ts    # Persist state to localStorage
    └── useClipboard.ts       # Copy-to-clipboard
```

**Tech Stack:** Next.js 14 + React 18 + TypeScript + Tailwind CSS + Recharts + jsPDF + Cheerio

---

## Troubleshooting

### Port 3000 already in use

```bash
npx kill-port 3000
npm run dev
```

Or use a different port:

```bash
npm run dev -- -p 3001
```

### Node version too old

```bash
node --version
```

If below v18, update from [nodejs.org](https://nodejs.org).

### Dependencies fail to install

```bash
rm -rf node_modules package-lock.json
npm install
```

### Site audit not working / "Failed to fetch page"

The audit feature uses a server-side API route (`/api/fetch-page`) to fetch external websites. This avoids CORS restrictions.

**Common causes:**
- Dev server not running (start it with `npm run dev`)
- Target website blocks automated requests (some sites return 403)
- Target website is behind a login/paywall
- Network/firewall issues

### Build fails with TypeScript errors

```bash
npm run build
```

If you see type errors, ensure you have the correct dependency versions:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Supabase not connecting

1. Verify your `.env.local` file has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Make sure the Supabase project is running (check the Supabase dashboard)
3. Restart the dev server after changing `.env.local`
4. Check the browser console for connection errors

### PDF export not working

The PDF export uses `jspdf` and `html2canvas` which are included in the dependencies. If it fails:

```bash
npm install jspdf html2canvas
```

Then restart the dev server.
