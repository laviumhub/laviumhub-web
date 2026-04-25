# Supabase Scraper Setup (Simple Path)

Tujuan: scraping jalan di Supabase Edge Function, scheduler jalan di GitHub Actions.

## 1) Deploy Edge Function

```bash
supabase functions deploy machine-refresh
```

## 2) Set Supabase secrets (untuk Edge Function)

```bash
supabase secrets set \
  JAGOLINK_USERNAME="..." \
  JAGOLINK_PASSWORD="..." \
  MACHINE_REFRESH_CRON_SECRET="..."
```

## 3) Set GitHub repository secrets

Di repo GitHub: `Settings -> Secrets and variables -> Actions`, buat:

1. `SUPABASE_PROJECT_URL` (contoh: `https://<PROJECT_REF>.supabase.co`)
2. `SUPABASE_ANON_KEY` (publishable key)
3. `MACHINE_REFRESH_CRON_SECRET` (harus sama dengan Supabase secret)

## 4) Scheduler

Workflow sudah tersedia:

- `.github/workflows/supabase-machine-refresh.yml`

Jadwal (WIB):

1. Senin 14:00-22:30 tiap 30 menit
2. Selasa-Kamis 06:00-22:30 tiap 30 menit
3. Jumat-Minggu 06:00-22:50 tiap 10 menit

## 5) Test cepat

1. Buka tab `Actions` di GitHub.
2. Pilih workflow `Supabase Machine Refresh`.
3. Klik `Run workflow`.
4. Cek tabel `machine_status_latest` di Supabase.

## 6) Cleanup Supabase cron lama (opsional)

Jika sebelumnya sempat buat SQL cron jobs, jalankan:

- `supabase/migrations/20260425_000008_cleanup_machine_refresh_cron_jobs.sql`

## 7) Catatan deploy Netlify

Deploy Next.js ke Netlify tetap normal saat merge ke `main`, tetapi scraping tidak lagi bergantung pada Netlify scheduler.
