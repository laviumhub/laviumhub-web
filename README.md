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

## Current data source

- `src/data/json/default-machines.json`: temporary fallback machine snapshot.
- `src/data/content/services.json`: homepage services content.
- `src/data/content/delivery-engine.json`: delivery rule config.

## Future source swap

To switch source (scraper, DB, CMS), add a new repository implementing `MachineRepository` and wire it in `src/services/index.ts`.

## Planned next phase (not implemented yet)

- Internal admin auth and role guard.
- Homepage banner CRUD in `src/features/admin/banners`.
- Supabase integration (auth, database, storage).
- Scraper output persistence to database (replace JSON fallback flow).
