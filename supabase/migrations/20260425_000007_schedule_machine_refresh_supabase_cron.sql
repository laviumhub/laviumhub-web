-- Supabase Cron schedules for machine refresh (UTC cron syntax).
-- Prerequisites:
-- 1) Extensions enabled: pg_cron, pg_net, vault
-- 2) Vault secrets already created:
--    - project_url
--    - anon_key
--    - machine_refresh_cron_secret

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists vault;

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

-- Monday 14:00-22:30 WIB -> UTC 07:00-15:30
select cron.schedule(
  'lavium_machine_refresh_mon',
  '*/30 7-15 * * 1',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/machine-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-machine-refresh-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'machine_refresh_cron_secret')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Tue-Thu 06:00/06:30 WIB -> UTC 23:00/23:30 (prev day)
select cron.schedule(
  'lavium_machine_refresh_tue_thu_start',
  '0,30 23 * * 1-3',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/machine-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-machine-refresh-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'machine_refresh_cron_secret')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Tue-Thu 07:00-22:30 WIB -> UTC 00:00-15:30
select cron.schedule(
  'lavium_machine_refresh_tue_thu',
  '*/30 0-15 * * 2-4',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/machine-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-machine-refresh-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'machine_refresh_cron_secret')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Fri-Sun 06:00-06:50 WIB -> UTC 23:00-23:50 (prev day)
select cron.schedule(
  'lavium_machine_refresh_fri_sun_start',
  '*/10 23 * * 4-6',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/machine-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-machine-refresh-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'machine_refresh_cron_secret')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Fri-Sun 07:00-22:50 WIB -> UTC 00:00-15:50
select cron.schedule(
  'lavium_machine_refresh_fri_sun',
  '*/10 0-15 * * 5,6,0',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/machine-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-machine-refresh-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'machine_refresh_cron_secret')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
