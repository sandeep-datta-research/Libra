# Libra

Premium SaaS-style Instagram growth storefront built with React, Vite, Tailwind CSS, Framer Motion, MongoDB, and an Express backend, centered around the Libra brand.

## Included

- Landing page with cinematic dark UI
- Services catalog with animated premium package cards
- Two-step order flow with unique order ID generation
- UPI payment instructions and screenshot proof upload
- Track Order page by order ID
- About / Trust page
- Protected Admin panel with backend auth for `sandeepdatta866@gmail.com`
- MongoDB-backed orders, capacity, and payment proof storage

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in:
   - `VITE_API_URL`
   - `VITE_ADMIN_EMAIL`
   - `VITE_UPI_ID`
   - `VITE_UPI_NAME`
   - `MONGODB_URI` (optional for local preview)
   - `PORT`
   - `FRONTEND_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
3. Install dependencies with `pnpm install`.
4. Start the backend with `pnpm dev:server`.
5. Start the frontend with `pnpm dev`.

## Backend notes

- `orders.id` is a generated text order ID like `IG-ABC123`.
- Screenshots are stored on disk under `server/uploads` and served by the Express backend.
- Admin access is restricted to `sandeepdatta866@gmail.com` plus the configured admin password.
- If `MONGODB_URI` is omitted locally, the backend starts an in-memory Mongo preview database automatically.
- For Render, deploy the backend as a separate Web Service and set the same server env vars there.

## Build

`pnpm build`
