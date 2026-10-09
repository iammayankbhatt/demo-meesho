# Operational Deployment Checklist — Meesho E-Commerce Platform ("Haat")

Use this concise operational checklist for future code updates, environment configuration changes, and production deployments.

---

## 1. Pre-Deployment & Local Verification
- [ ] Pull latest changes from repository main branch.
- [ ] Run `npm install` from root to ensure dependencies are synchronized.
- [ ] Run test suite (`npm test`) and verify all tests pass (`3/3 passed`).
- [ ] Run linter (`npm run lint`) and resolve any errors or warnings.
- [ ] Verify local build (`npm run build`) completes successfully without compilation errors.

## 2. Database & Migrations
- [ ] Identify any new migration files in `supabase/migrations/` (e.g., `008_...`).
- [ ] Apply migrations in numerical order via Supabase SQL Editor or Supabase CLI (`supabase db push`).
- [ ] Run database seeding script if schema requires fresh mock data (`npm run db:seed`).
- [ ] Verify RLS policies and table permissions in Supabase dashboard.

## 3. Backend Deployment (Render)
- [ ] Verify environment variables are up-to-date in Render Dashboard (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLIENT_ORIGINS`).
- [ ] Trigger deployment in Render (`Manual Deploy` -> `Deploy latest commit`) or push to `main`.
- [ ] Monitor build logs for successful installation and startup.
- [ ] Verify health endpoint: `GET https://meesho-haat-api.onrender.com/api/v1/health` -> returns `200 OK`.

## 4. Frontend Deployment (Vercel)
- [ ] Verify environment variables are up-to-date in Vercel Dashboard (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`).
- [ ] Trigger deployment in Vercel or push to `main`.
- [ ] Verify build output and SPA routing rewrites (`client/vercel.json`).

## 5. Post-Deployment Smoke Tests
- [ ] **Home & Catalog**: Browse home page, categories, and product rails.
- [ ] **Search**: Test search box autocomplete and filtering/sorting.
- [ ] **Authentication**: Test Email and Google OAuth sign-in / sign-up.
- [ ] **Cart & Wishlist**: Add items to cart and wishlist, verify persistence.
- [ ] **Checkout**: Complete test checkout with concurrency-safe flash reservation.
- [ ] **Deep Links**: Refresh nested route (e.g., `/p/kurti-set-1`, `/account`, `/cart`) to confirm no 404 errors.

## 6. Rollback Readiness
- [ ] **Render Rollback**: Keep previous working commit hash noted; rollback available via Render Dashboard -> Deploys -> Rollback.
- [ ] **Vercel Rollback**: Rollback available via Vercel Dashboard -> Deployments -> Rollback.
- [ ] **Database Backup**: Ensure automated daily backups are enabled in Supabase project settings.
