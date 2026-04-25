# Supabase Scraper Setup (Simple Path)

Tujuan: scraping jalan di Supabase Edge Function, scheduler jalan di GitHub Actions.

## 1) Deploy Edge Function

```bash
supabase functions deploy machine-refresh
```

## 2) Set Supabase secrets (untuk Edge Function)

```bash
supabase secrets set \
  SUPABASE_SERVICE_ROLE_KEY="..." \
  JAGOLINK_USERNAME="..." \
  JAGOLINK_PASSWORD="..." \
  MACHINE_REFRESH_CRON_SECRET="..."
```

## 3) Set GitHub repository secrets

Di repo GitHub: `Settings -> Secrets and variables -> Actions`, buat:

1. `SUPABASE_PROJECT_URL` (contoh: `https://<PROJECT_REF>.supabase.co`)
2. `MACHINE_REFRESH_CRON_SECRET` (harus sama dengan Supabase secret)

## 4) Scheduler

Workflow sudah tersedia:

- `.github/workflows/supabase-machine-refresh.yml`

Jadwal (WIB):

1. Scheduler GitHub trigger tiap 10 menit.
2. Validasi waktu scrape di Supabase function:
   - Senin 14:30-21:59 WIB
   - Selasa-Minggu 07:00-21:59 WIB

## 5) Test cepat

1. Buka tab `Actions` di GitHub.
2. Pilih workflow `Supabase Machine Refresh`.
3. Klik `Run workflow`.
4. Cek tabel `machine_status_latest` di Supabase.

## 6) Catatan deploy Netlify

Deploy Next.js ke Netlify tetap normal saat merge ke `main`, tetapi scraping tidak lagi bergantung pada Netlify scheduler.
