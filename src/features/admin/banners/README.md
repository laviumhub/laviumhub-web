# Admin Banner Module

Implemented scope:
- authenticated admin CRUD via backend routes
- active/inactive toggle
- schedule window (`start_at` / `end_at`)
- server-side image upload to Supabase Storage
- public active-banner API for popup rendering

Main files:
- `components/banner-management.tsx`
- `server/banner-service.ts`
- `server/banner-storage.ts`
- `types.ts`
