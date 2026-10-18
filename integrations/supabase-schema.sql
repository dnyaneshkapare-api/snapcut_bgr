create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  original_name text not null,
  source_key text not null,
  result_key text,
  source_url text,
  result_url text,
  status text not null default 'processing' check (status in ('processing', 'complete', 'failed')),
  provider text,
  processing_ms integer,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists uploads_user_created_idx on public.uploads(user_id, created_at desc);

create table if not exists public.credits (
  user_id uuid primary key references public.users(id) on delete cascade,
  daily_limit integer not null default 5,
  used_today integer not null default 0,
  reset_at timestamptz not null default date_trunc('day', now() + interval '1 day')
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_subscription_id text unique,
  status text not null default 'active',
  plan_id text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_order_id text unique,
  amount_paise integer not null,
  currency text not null default 'INR',
  status text not null default 'created',
  created_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  label text not null,
  key_prefix text not null,
  key_hash text not null,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  level text not null default 'info',
  source text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.uploads enable row level security;
alter table public.credits enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;
alter table public.api_keys enable row level security;

create policy "users can read own profile" on public.users for select using (auth.uid() = id);
create policy "users can read own uploads" on public.uploads for select using (auth.uid() = user_id);
create policy "users can read own credits" on public.credits for select using (auth.uid() = user_id);
create policy "users can read own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
create policy "users can read own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "users can read own api keys" on public.api_keys for select using (auth.uid() = user_id);
