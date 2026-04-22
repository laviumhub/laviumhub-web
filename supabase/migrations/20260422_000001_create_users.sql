create extension if not exists pgcrypto;

create table if not exists public.users (
  uid uuid primary key default gen_random_uuid(),
  username text not null unique,
  name text not null,
  password text not null,
  created_date timestamptz not null default now()
);

comment on table public.users is 'Application users for backend login flow.';
comment on column public.users.password is 'Store a bcrypt hash in production, never plain-text passwords.';

create index if not exists users_created_date_idx on public.users (created_date desc);
