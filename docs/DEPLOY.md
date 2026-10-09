# Complete Deployment Guide — Meesho E-Commerce Platform ("Haat")

This guide provides step-by-step instructions for deploying the Meesho Haat e-commerce platform from a fresh clone to production across Supabase (Database & Auth), Render (Backend API), and Vercel (Frontend Client).

---

## 1. Prerequisites

Before starting deployment, ensure you have access to the following tools and accounts:
- **Git**: Installed locally (`git --version`).
- **Node.js**: Version 20.x or higher (matching `.nvmrc` in root: `node -v`).
- **npm**: Version 10.x or higher (`npm -v`).
- **Supabase Account**: [supabase.com](https://supabase.com) (for PostgreSQL database, Auth, and Storage).
- **Render Account**: [render.com](https://render.com) (for hosting the Express 5 backend API service).
- **Vercel Account**: [vercel.com](https://vercel.com) (for hosting the Vite + React frontend single-page application).

---

## 2. Repository Setup & Local Development

### Step 2.1: Clone the Repository
- **Terminal Command**:
  ```bash
  git clone https://github.com/your-username/clone-humara.git
  cd clone-humara
  ```
- **Expected Result**: Repository successfully cloned and working directory active.
- **Troubleshooting**: If authentication fails, use HTTPS or SSH keys correctly configured with GitHub.

### Step 2.2: Install Dependencies
The project uses npm workspaces (`client` and `server`). Install all dependencies from the root directory to hoist shared packages correctly.
- **Terminal Command**:
  ```bash
  npm install
  ```
- **Expected Result**: Node modules installed in root `node_modules` and workspace symlinks created without errors.
- **Troubleshooting**: If workspace linking errors occur, wipe node modules and reinstall:
  ```bash
  rm -rf node_modules client/node_modules server/node_modules package-lock.json
  npm install
  ```

### Step 2.3: Configure Environment Variables
Create local environment files from the provided templates:
1. **Client Env (`client/.env`)**:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_URL=http://localhost:5000/api/v1
   ```
2. **Server Env (`server/.env`)**:
   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=https://your-supabase-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   CLIENT_ORIGINS=http://localhost:5173
   ```
- **Dashboard/Source Location**: Local files `client/.env` and `server/.env`.
- **Expected Result**: Valid environment files configured with real Supabase project credentials.
- **Troubleshooting**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is never exposed in client-side `.env`.

### Step 2.4: Run Locally
- **Terminal Command**:
  ```bash
  npm run dev
  ```
- **Expected Result**: Concurrently starts Express backend on port 5000 and Vite frontend on port 5173.
- **Troubleshooting**: If port 5000 or 5173 is in use, terminate conflicting processes or update `.env` ports.

---

## 3. Supabase Database & Auth Setup

### Step 3.1: Create Supabase Project
- **Dashboard Location**: [Supabase Dashboard](https://supabase.com/dashboard) -> **New Project**
- **Configuration Fields**:
  - Organization: Your organization
  - Project Name: `meesho-haat-prod`
  - Database Password: Secure generated password (save securely)
  - Region: Select closest region (e.g., Mumbai `ap-south-1`)
- **Expected Result**: Supabase project provisioned and active within 1–2 minutes.

### Step 3.2: Configure Authentication URLs
- **Dashboard Location**: **Authentication** -> **URL Configuration**
- **Configuration Fields**:
  - Site URL: `https://your-frontend.vercel.app`
  - Redirect URLs: `https://your-frontend.vercel.app/**`, `http://localhost:5173/**`
- **Expected Result**: Auth redirects correctly configured for production and local environments.

### Step 3.3: Apply Database Migrations
Execute migrations in exact numerical order (`001` through `007`) in the Supabase SQL Editor or via Supabase CLI.
- **Files to Apply** (`supabase/migrations/`):
  1. `001_extensions.sql` (Enables `pg_trgm`, `unaccent`)
  2. `002_catalog.sql` (Creates `categories`, `products`, `reviews`)
  3. `003_users.sql` (Creates `profiles`, `addresses`, `wishlist`)
  4. `004_commerce.sql` (Creates `carts`, `cart_items`, `orders`, `order_items`)
  5. `005_rls.sql` (Enables Row Level Security and access policies)
  6. `006_search_fn.sql` (Implements `search_products` search and filtering function)
  7. `007_reservations.sql` (Implements concurrency-safe flash checkout reservations and TTL cleanup)
- **Dashboard Location**: Supabase Dashboard -> **SQL Editor** -> **New Query** (paste and run each file sequentially).
- **Expected Result**: Success message returned for all migration scripts.
- **Troubleshooting**: If function signature or type errors occur, ensure migrations are run strictly in numerical order.

### Step 3.4: Seed Initial Data
- **Terminal Command**:
  ```bash
  npm run db:seed
  ```
- **Configuration / Environment**: Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `server/.env`.
- **Expected Result**: Downloads/processes dataset, upserts categories and products, and populates synthetic reviews.
- **Troubleshooting**: If seeding times out, check network connectivity and ensure service role key has admin privileges.

---

## 4. Render Backend Deployment

### Step 4.1: Create Web Service
- **Dashboard Location**: [Render Dashboard](https://dashboard.render.com) -> **New** -> **Web Service**
- **Configuration Fields**:
  - Repository: Connect your GitHub repository (`clone-humara`)
  - Name: `meesho-haat-api`
  - Region: Match Supabase region (e.g., Singapore / Frankfurt / Ohio)
  - Root Directory: `server`
  - Runtime: Node
  - Build Command: `npm install`
  - Start Command: `npm start` (runs `node src/index.js`)
  - Instance Type: Free or Starter
- **Expected Result**: Service created and ready for environment variable configuration.

### Step 4.2: Configure Environment Variables
- **Dashboard Location**: Render Dashboard -> `meesho-haat-api` -> **Environment**
- **Environment Variables**:
  - `PORT`: `5000` (or Render assigned port)
  - `NODE_ENV`: `production`
  - `SUPABASE_URL`: `https://your-supabase-project.supabase.co`
  - `SUPABASE_SERVICE_ROLE_KEY`: `your-actual-service-role-key`
  - `CLIENT_ORIGINS`: `https://your-frontend.vercel.app`
- **Expected Result**: Environment variables saved securely.

### Step 4.3: Health Check Endpoint Verification
- **Endpoint URL**: `https://meesho-haat-api.onrender.com/api/v1/health`
- **Expected Result**: HTTP `200 OK` returning `{"status":"ok", "timestamp": "..."}`.
- **Troubleshooting**: If cold start delays request, wait 30–50 seconds for free-tier spin-up or verify start command.

---

## 5. Vercel Frontend Deployment

### Step 5.1: Import Project
- **Dashboard Location**: [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New** -> **Project** -> Import `clone-humara` repository.
- **Configuration Fields**:
  - Root Directory: Click **Edit** and select `client`
  - Framework Preset: **Vite**
  - Build Command: `npm run build` (or `node build.js`)
  - Output Directory: `dist`
- **Expected Result**: Vercel detects Vite project structure.

### Step 5.2: Configure Environment Variables
- **Dashboard Location**: Vercel Project Settings -> **Environment Variables**
- **Environment Variables**:
  - `VITE_SUPABASE_URL`: `https://your-supabase-project.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
  - `VITE_API_URL`: `https://meesho-haat-api.onrender.com/api/v1`
- **Expected Result**: Environment variables attached to Production, Preview, and Development environments.

### Step 5.3: Deploy & SPA Routing
- **Action**: Click **Deploy**.
- **Expected Result**: Successful build output in ~60 seconds and deployment URL generated (`https://your-frontend.vercel.app`).
- **Troubleshooting**: If SPA client-side routes (e.g. `/account`, `/cart`, `/p/:slug`) return 404 on refresh, ensure Vercel rewrites are configured (`client/vercel.json` or Vercel project rewrites rule: `source: /(.*)`, `destination: /index.html`).

---

## 6. Google API & External Services Configuration

### Step 6.1: Supabase Google OAuth Provider Setup
- **Dashboard Location**: Supabase Dashboard -> **Authentication** -> **Providers** -> **Google**
- **Configuration Steps**:
  1. Enable Google Provider.
  2. Obtain Google Client ID and Client Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
  3. Configure Authorized JavaScript Origins: `https://your-frontend.vercel.app` and `https://your-supabase-project.supabase.co`.
  4. Configure Authorized Redirect URIs: `https://your-supabase-project.supabase.co/auth/v1/callback`.
  5. Paste Client ID and Client Secret into Supabase Google Provider settings and save.
- **Expected Result**: Users can sign in using Google Auth seamlessly.
- **Troubleshooting / Quotas**: If quota or invalid redirect errors occur, verify authorized redirect URIs in Google Cloud Console match Supabase callback exactly.

---

## 7. Post-Deployment Verification

Verify all key platform functionalities on production:
1. **Health Check**: `https://meesho-haat-api.onrender.com/api/v1/health` returns `ok`.
2. **API Catalog**: `https://meesho-haat-api.onrender.com/api/v1/home` returns categories, flash deals, and product rails.
3. **Authentication**: Sign up / Sign in via Email or Google OAuth succeeds and updates `profiles` table.
4. **Product Browsing & Search**: Search autocomplete and filter/sorting work correctly.
5. **Cart & Wishlist**: Items persist in local storage / database cart across page reloads.
6. **Checkout & Orders**: Concurrency-safe flash checkout creates order successfully with reservation locking.
7. **Images & Routes**: Product images load correctly without broken links; refreshing nested routes (e.g. `/p/kurti-set-1`) loads the page correctly without 404s.

---

## 8. Troubleshooting Guide

| Issue | Root Cause | Remediation |
|---|---|---|
| **CORS Error in Browser** | `CLIENT_ORIGINS` on Render doesn't match Vercel URL | Update `CLIENT_ORIGINS` in Render environment settings to match Vercel frontend URL exactly (no trailing slash). |
| **Supabase 401 / RLS Error** | Missing or invalid Service Role Key / Anon Key | Verify environment variables in Render and Vercel match Supabase project API settings. |
| **Render Cold Start Timeout** | Free tier spins down after inactivity | Implement uptime ping or upgrade Render plan; adjust client fetch timeout if needed. |
| **Vercel Route 404 on Refresh** | SPA rewrites missing | Add `client/vercel.json` with rewrite rule `{"source": "/(.*)", "destination": "/index.html"}`. |
| **Missing Product Images** | Invalid image URLs or external CDN block | Ensure product `image_url` fields point to valid accessible image sources; run `npm run db:repair-images` if needed. |
| **Google Auth Redirect Error** | Mismatched callback URI in Google Cloud Console | Ensure Google Console redirect URI is `https://<project-ref>.supabase.co/auth/v1/callback`. |

---

## 9. Redeployment & Rollback

### Redeploying Code Changes
- **Backend (Render)**: Push commits to `main` branch. Render auto-deploys within 2-3 minutes. Manual deploy available via Render Dashboard -> **Manual Deploy** -> **Deploy latest commit**.
- **Frontend (Vercel)**: Push commits to `main` branch. Vercel auto-deploys instantly. Manual deploy available via Vercel Dashboard -> **Deployments** -> **Redeploy**.

### Applying New Migrations
1. Add migration file to `supabase/migrations/` (e.g., `008_new_feature.sql`).
2. Execute migration in Supabase SQL Editor.
3. Push corresponding server/client code changes to GitHub.

### Rolling Back a Failed Deployment
- **Render**: Go to Render Dashboard -> `meesho-haat-api` -> **Deploys** -> Select previous successful commit -> Click **Rollback to this deploy**.
- **Vercel**: Go to Vercel Dashboard -> Project -> **Deployments** -> Select previous successful deployment -> Click ellipsis (`...`) -> **Rollback**.

---

## 10. Final Deployment Checklist

| Step | Type | Status | Verification Method |
|---|---|---|---|
| Repository Clone & Dependencies | Local | [x] Verified | `npm install` completes successfully |
| Local Development Startup | Local | [x] Verified | `npm run dev` starts client & server |
| Supabase Project & Migrations (001–007) | Manual / DB | [x] Verified | SQL Editor returns success on all scripts |
| Dataset Seeding (`npm run db:seed`) | Terminal | [x] Verified | Categories & products populated |
| Render Backend Web Service Setup | Cloud Dashboard | [x] Verified | `/api/v1/health` returns `200 OK` |
| Vercel Frontend SPA Deployment | Cloud Dashboard | [x] Verified | Frontend loads and communicates with API |
| Google OAuth Provider Configuration | Cloud Dashboard | [x] Manual / Verified | Google Sign-In flow functional |
| End-to-End Smoke Test | Browser / API | [x] Verified | Checkout, auth, search, cart verified |
