# Migration Plan (Vite React -> Next.js App Router)

1. Bootstrap Next.js + TypeScript core configuration.
2. Add Mantine provider in `src/app/layout.tsx` + `src/app/providers.tsx`.
3. Introduce domain model and repository contract.
4. Keep local JSON as temporary source via `JsonMachineRepository`.
5. Add mapper layer to normalize raw source data to domain model.
6. Move feature UI into `src/features` and consume only domain models.
7. Migrate remaining tabs/features in slices (informasi, layanan, antar-jemput).
8. Add API route(s) for future scraper/database/CMS entrypoints.
9. Add env-based repository selection for non-JSON sources.
10. Deploy on Vercel/Netlify using Next.js build/start flow.
