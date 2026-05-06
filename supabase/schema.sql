create table if not exists public.orders (
  id text primary key,
  username text not null,
  service text not null,
  notes text,
  transaction_id text,
  screenshot_url text,
  status text not null default 'Pending' check (
    status in ('Pending', 'Verified', 'In Progress', 'Completed', 'Rejected')
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('capacity_limit', '24')
on conflict (key) do nothing;

alter table public.orders enable row level security;
alter table public.app_settings enable row level security;

create policy "public can create orders"
on public.orders
for insert
to anon, authenticated
with check (true);

create policy "public can read own tracked order"
on public.orders
for select
to anon, authenticated
using (true);

create policy "public can update payment proof"
on public.orders
for update
to anon, authenticated
using (true)
with check (true);

create policy "public can read capacity"
on public.app_settings
for select
to anon, authenticated
using (key = 'capacity_limit');

create policy "public can update capacity"
on public.app_settings
for update
to anon, authenticated
using (true)
with check (true);

create policy "public can insert capacity row"
on public.app_settings
for insert
to anon, authenticated
with check (true);

insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', true)
on conflict (id) do nothing;
