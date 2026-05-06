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

create or replace function public.is_libra_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt()->>'email' = 'sandeepdatta866@gmail.com', false);
$$;

alter table public.orders enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "public can create orders" on public.orders;
drop policy if exists "public can read tracked orders" on public.orders;
drop policy if exists "public can submit payment proof once" on public.orders;
drop policy if exists "admin can read all orders" on public.orders;
drop policy if exists "admin can update all orders" on public.orders;
drop policy if exists "public can read capacity" on public.app_settings;
drop policy if exists "admin can manage capacity" on public.app_settings;

create policy "public can create orders"
on public.orders
for insert
to anon, authenticated
with check (true);

create policy "public can read tracked orders"
on public.orders
for select
to anon, authenticated
using (true);

create policy "public can submit payment proof once"
on public.orders
for update
to anon, authenticated
using (
  status = 'Pending'
  and coalesce(transaction_id, '') = ''
)
with check (
  status = 'Pending'
  and transaction_id is not null
  and screenshot_url is not null
);

create policy "admin can read all orders"
on public.orders
for select
to authenticated
using (public.is_libra_admin());

create policy "admin can update all orders"
on public.orders
for update
to authenticated
using (public.is_libra_admin())
with check (public.is_libra_admin());

create policy "public can read capacity"
on public.app_settings
for select
to anon, authenticated
using (key = 'capacity_limit');

create policy "admin can manage capacity"
on public.app_settings
for all
to authenticated
using (public.is_libra_admin())
with check (public.is_libra_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-screenshots',
  'payment-screenshots',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "anyone can upload payment screenshots" on storage.objects;
drop policy if exists "admin can view payment screenshots" on storage.objects;

create policy "anyone can upload payment screenshots"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'payment-screenshots');

create policy "admin can view payment screenshots"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-screenshots'
  and public.is_libra_admin()
);
