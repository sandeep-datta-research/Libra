# Libra

Premium SaaS-style Instagram growth storefront built with React, Vite, Tailwind CSS, Framer Motion, and Supabase, centered around the Libra brand.

## Included

- Landing page with cinematic dark UI
- Services catalog with animated premium package cards
- Two-step order flow with unique order ID generation
- UPI payment instructions and screenshot proof upload
- Track Order page by order ID
- About / Trust page
- Protected Admin panel with Supabase email auth for `sandeepdatta866@gmail.com`
- Supabase-first data layer with local demo fallback when env vars are missing

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_BUCKET`
   - `VITE_ADMIN_EMAIL`
   - `VITE_SITE_URL`
   - `VITE_UPI_ID`
   - `VITE_UPI_NAME`
3. Run the SQL in [supabase/schema.sql](./supabase/schema.sql).
4. In Supabase Auth, enable Email login and add your local/dev and production URLs.
5. Install dependencies with `pnpm install`.
6. Start the app with `pnpm dev`.

## Supabase notes

- `orders.id` is a generated text order ID like `IG-ABC123`.
- Screenshots are uploaded to the `payment-screenshots` storage bucket by default.
- Admin access is restricted in the UI and policy layer to `sandeepdatta866@gmail.com`.

## Build

`pnpm build`
