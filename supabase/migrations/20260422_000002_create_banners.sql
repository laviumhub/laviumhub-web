create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  is_active boolean not null default false,
  active_order integer,
  start_at timestamptz not null,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banners_schedule_check check (end_at is null or start_at <= end_at),
  constraint banners_active_order_check check (active_order is null or active_order > 0)
);

create index if not exists banners_created_at_idx on public.banners (created_at desc);
create index if not exists banners_visibility_idx on public.banners (is_active, start_at, end_at);
create index if not exists banners_active_order_idx on public.banners (is_active, active_order);

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_banners_updated_at on public.banners;
create trigger set_banners_updated_at
before update on public.banners
for each row execute function public.set_updated_at_timestamp();

create or replace function public.reindex_active_banner_orders()
returns void
language plpgsql
as $$
begin
  with ordered_active as (
    select
      id,
      row_number() over (
        order by
          coalesce(active_order, 2147483647),
          created_at asc,
          id asc
      ) as next_order
    from public.banners
    where is_active = true
  )
  update public.banners b
  set active_order = o.next_order
  from ordered_active o
  where b.id = o.id
    and b.active_order is distinct from o.next_order;

  update public.banners
  set active_order = null
  where is_active = false
    and active_order is not null;
end;
$$;

select public.reindex_active_banner_orders();
