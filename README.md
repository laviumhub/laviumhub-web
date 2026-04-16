# LaviumHub (Next.js + TypeScript)

Modernized frontend scaffold with Next.js App Router, TypeScript, Mantine, and a clean data abstraction layer.

## Stack

- Next.js `16.2.3` (App Router)
- React `19`
- TypeScript (strict)
- Mantine `8`

## Architecture

- `src/app`: App Router entrypoints, layout, providers.
- `src/ui`: reusable UI shell/components.
- `src/features`: feature-facing presentation modules.
- `src/domain`: app-level models/interfaces.
- `src/data`: source-specific raw types, json sources, and mappers.
- `src/repositories`: repository contracts and implementations.
- `src/services`: use-case/services consumed by pages.
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

## Current data source

`src/data/json/default-machines.json` is the temporary source. UI reads domain models from `MachineService`, never raw JSON directly.

## Future source swap

To switch source (scraper, DB, CMS), add a new repository implementing `MachineRepository` and wire it in `src/services/index.ts`.
