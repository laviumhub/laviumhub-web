create table if not exists public.machine_status_latest (
  device_id text primary key,
  machine_name text not null,
  status text not null,
  state text not null,
  source_timestamp timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.machine_status_latest is 'Latest status of each machine scraped from Jagolink.';

create index if not exists machine_status_latest_source_timestamp_idx
  on public.machine_status_latest (source_timestamp desc);

drop trigger if exists set_machine_status_latest_updated_at on public.machine_status_latest;
create trigger set_machine_status_latest_updated_at
before update on public.machine_status_latest
for each row execute function public.set_updated_at_timestamp();

create or replace function public.refresh_machine_status_snapshot(
  p_payload jsonb,
  p_source_timestamp timestamptz default now()
)
returns table(updated_count integer)
language plpgsql
as $$
declare
  v_updated_count integer := 0;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'array' then
    raise exception 'p_payload must be a JSON array';
  end if;

  with rows as (
    select
      trim(coalesce(item ->> 'device_id', '')) as device_id,
      trim(coalesce(item ->> 'machine_name', '')) as machine_name,
      trim(coalesce(item ->> 'status', '')) as status,
      trim(coalesce(item ->> 'state', '')) as state
    from jsonb_array_elements(p_payload) as item
  ),
  valid_rows as (
    select
      device_id,
      machine_name,
      case when status = '' then 'Offline' else status end as status,
      case when state = '' then 'UNKNOWN' else state end as state
    from rows
    where device_id <> ''
      and machine_name <> ''
  ),
  upserted as (
    insert into public.machine_status_latest (
      device_id,
      machine_name,
      status,
      state,
      source_timestamp
    )
    select
      device_id,
      machine_name,
      status,
      state,
      p_source_timestamp
    from valid_rows
    on conflict (device_id) do update
      set machine_name = excluded.machine_name,
          status = excluded.status,
          state = excluded.state,
          source_timestamp = excluded.source_timestamp
    returning 1
  )
  select count(*) into v_updated_count from upserted;

  insert into public.machine_status_snapshots (
    cache_key,
    payload,
    fetched_at
  )
  values (
    'jagolink_machine_status_v1',
    jsonb_build_object(
      'count', v_updated_count,
      'data', p_payload,
      'timestamp', to_char(p_source_timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    ),
    p_source_timestamp
  )
  on conflict (cache_key) do update
    set payload = excluded.payload,
        fetched_at = excluded.fetched_at;

  return query select v_updated_count;
end;
$$;
