# LaviumHub (Next.js + TypeScript)

Modernized frontend scaffold with Next.js App Router, TypeScript, Mantine, and a practical feature-first structure.

## Stack

- Next.js `16.2.3` (App Router)
- React `19`
- TypeScript (strict)
- Mantine `8`

## Architecture

- `src/app`: App Router entrypoints (`(public)`, `(admin)`, `api`), root layout, providers.
- `src/features/public-home`: public homepage UI modules.
- `src/features/delivery`: delivery calculator feature modules.
- `src/features/admin`: admin preparation modules (banner area reserved for next phase).
- `src/domain`: shared domain models/interfaces.
- `src/data`: static JSON sources, raw types, and mappers.
- `src/repositories`: repository contracts and implementations.
- `src/services`: use-case/services consumed by app modules.
- `src/lib`: shared utilities and theme.

## Run

```bash
npm install
npm run dev
```

## Server-side scraper (Next.js)

`/api/scraper` is the JavaScript translation of the old `scrapper.php` flow:
1. fetch login page and CSRF token,
2. login to Jagolink,
3. fetch machine page,
4. parse machine table and return JSON payload.

Set environment variables first:

```bash
cp .env.example .env.local
```

Required:
- `JAGOLINK_USERNAME`
- `JAGOLINK_PASSWORD`

Optional:
- `SCRAPER_API_KEY` (if set, requests to `/api/scraper` must include `?key=...`)

## Supabase env preparation

Supabase credentials are prepared in `.env.example` for upcoming admin/auth/database work:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to client)

For deployment platforms (for example Netlify), set these in the platform Environment Variables UI.

## Admin login foundation (server-side)

Current flow:

- Frontend login form calls `POST /api/admin/auth/login`.
- Backend route validates credentials against `public.users` in Supabase.
- On success, backend sets an `httpOnly` signed session cookie.
- `src/proxy.ts` enforces login for all `/admin/*` routes except `/admin/login`.

### Migration

Apply migration:

- `supabase/migrations/20260422_000001_create_users.sql`

The table is:

- `uid` (UUID, PK)
- `username` (unique)
- `name`
- `password`
- `created_date`

### Seed example (manual SQL)

```sql
-- one-time: create bcrypt hash in SQL via pgcrypto
insert into public.users (username, name, password)
values ('admin', 'Admin LaviumHub', crypt('admin123', gen_salt('bf', 12)));
```
This login foundation now verifies password using bcrypt hash comparison in backend API.

Optional local helper to generate hash:

```bash
npm run hash:password -- admin123
```

## Current data source

- `src/data/json/default-machines.json`: temporary fallback machine snapshot.
- `src/data/content/services.json`: homepage services content.
- `src/data/content/delivery-engine.json`: delivery rule config.

## Banner management (admin + public)

### Schema migration

- `supabase/migrations/20260422_000002_create_banners.sql`

Table `public.banners`:
- `id`
- `title`
- `description`
- `image_url`
- `is_active`
- `start_at`
- `end_at`
- `created_at`
- `updated_at`

### Storage assumption

- Server-side banner image upload uses Supabase Storage bucket: `banner-images`.
- Bucket is created automatically by backend route/service if missing.
- Uploaded files are saved under `banners/YYYY-MM-DD/<uuid>-<filename>`.

### API routes

Admin (requires logged-in admin session cookie):
- `GET /api/admin/banners`
- `POST /api/admin/banners`
- `PUT /api/admin/banners/[id]`
- `DELETE /api/admin/banners/[id]`

Public:
- `GET /api/banners/active`

### Active banner logic

A banner is returned by `/api/banners/active` only when:
- `is_active = true`
- `start_at <= now`
- and (`end_at is null` or `now <= end_at`)

## Future source swap

To switch source (scraper, DB, CMS), add a new repository implementing `MachineRepository` and wire it in `src/services/index.ts`.

## Planned next phase (not implemented yet)

- Internal admin auth and role guard.
- Homepage banner CRUD in `src/features/admin/banners`.
- Supabase integration (auth, database, storage).
- Scraper output persistence to database (replace JSON fallback flow).
