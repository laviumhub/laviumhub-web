create table if not exists public.machine_status_snapshots (
  cache_key text primary key,
  payload jsonb not null,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.machine_status_snapshots is 'Persistent scraper snapshots used to reduce external scraping calls.';

create index if not exists machine_status_snapshots_fetched_at_idx
  on public.machine_status_snapshots (fetched_at desc);

drop trigger if exists set_machine_status_snapshots_updated_at on public.machine_status_snapshots;
create trigger set_machine_status_snapshots_updated_at
before update on public.machine_status_snapshots
for each row execute function public.set_updated_at_timestamp();
