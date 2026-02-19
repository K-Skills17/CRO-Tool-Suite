# CRO Tool Suite - Local Setup Guide

## What Is This?

The CRO Tool Suite is a **Next.js web application** that runs in your browser. You can either run it locally on your machine or deploy it to a cloud host like Vercel. There is no separate backend to manage -- everything (UI + API) is bundled together by Next.js.

---

## Prerequisites

- **Node.js 18+** - Download from [https://nodejs.org](https://nodejs.org) (LTS version recommended)
- **npm** - Comes bundled with Node.js
- **Git** - Download from [https://git-scm.com](https://git-scm.com)

Verify your installations:

```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
git --version
```

---

## Local Setup (Step by Step)

### 1. Clone the repository

```bash
git clone https://github.com/K-Skills17/CRO-Tool-Suite.git
cd CRO-Tool-Suite
```

### 2. Install dependencies

```bash
npm install
```

This installs Next.js, React, Tailwind CSS, and all other packages defined in `package.json`.

### 3. Configure environment variables (optional)

```bash
cp .env.local.example .env.local
```

Edit `.env.local` if needed:

| Variable | Required? | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Your Supabase project URL (for data persistence) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Your Supabase anonymous key |
| `NEXT_PUBLIC_BRAND_NAME` | No | Custom brand name (default: CRO Tool Suite) |
| `NEXT_PUBLIC_BRAND_PRIMARY_COLOR` | No | Primary brand color hex (default: #2563eb) |
| `NEXT_PUBLIC_BRAND_SECONDARY_COLOR` | No | Secondary brand color hex (default: #1e40af) |

The app works fully without any environment variables. Supabase adds persistent storage across sessions but is not required.

### 4. Start the development server

```bash
npm run dev
```

### 5. Open in your browser

Navigate to **http://localhost:3000**

---

## The 4 Tools

| Route | Tool Name | What It Does |
|---|---|---|
| `/` | Conversion Intelligence Platform | Site audits with 200+ CRO checkpoints, competitor analysis, industry benchmarks |
| `/copy-lab` | Conversion Copy Laboratory | Copy analysis, readability scoring, customer language extraction |
| `/page-builder` | Landing Page Assembly System | Questionnaire-based landing page builder with component library |
| `/command-center` | Optimization Command Center | A/B test planning, statistical calculators, funnel analysis, ROI modeling |

---

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload (port 3000) |
| `npm run build` | Create a production build |
| `npm start` | Run the production build locally |
| `npm run lint` | Run the Next.js linter |
| `npm run test` | Run the test suite |

---

## Deploying to Vercel (Recommended for Online Access)

1. Sign up at [vercel.com](https://vercel.com) using your GitHub account
2. Click **"Add New Project"**
3. Import the `K-Skills17/CRO-Tool-Suite` repository
4. Vercel auto-detects Next.js -- click **"Deploy"**
5. Your app is live at a URL like `cro-tool-suite.vercel.app`

To add environment variables on Vercel, go to **Project Settings > Environment Variables** and add the values from `.env.local.example`.

---

## Troubleshooting

**Port 3000 already in use:**
```bash
npx kill-port 3000
npm run dev
```

**Node version too old:**
```bash
node --version
```
If below v18, update Node.js from [https://nodejs.org](https://nodejs.org).

**Dependencies fail to install:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Page fetch / audit not working:**
The site audit feature uses an API route (`/api/fetch-page`) to fetch external websites server-side. This avoids CORS issues. Make sure the dev server is running -- the API route only works when the server is active.
