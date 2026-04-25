-- Cleanup legacy Supabase Cron jobs for machine refresh.
-- Use this after switching to GitHub Actions scheduler.

create extension if not exists pg_cron;

select cron.unschedule('lavium_machine_refresh_mon')
where exists (select 1 from cron.job where jobname = 'lavium_machine_refresh_mon');

select cron.unschedule('lavium_machine_refresh_tue_thu_start')
where exists (select 1 from cron.job where jobname = 'lavium_machine_refresh_tue_thu_start');

select cron.unschedule('lavium_machine_refresh_tue_thu')
where exists (select 1 from cron.job where jobname = 'lavium_machine_refresh_tue_thu');

select cron.unschedule('lavium_machine_refresh_fri_sun_start')
where exists (select 1 from cron.job where jobname = 'lavium_machine_refresh_fri_sun_start');

select cron.unschedule('lavium_machine_refresh_fri_sun')
where exists (select 1 from cron.job where jobname = 'lavium_machine_refresh_fri_sun');
