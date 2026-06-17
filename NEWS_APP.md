# Noticias Madera y Mueble

A news aggregator for the wood/furniture industry (madera, muebles de cocina,
muebles de hogar, ferias y maquinaria), separate from the existing Next.js /
HubSpot app in `src/`. Lives in two new top-level folders: `backend/` and `mobile/`.

## Backend

```bash
cd backend
npm install
npm run dev   # nodemon, auto-reload
# or: npm start
```

- Express API on `PORT` (default `3001`).
- `better-sqlite3` file DB at `backend/data.sqlite` (auto-created).
- `node-cron` refreshes all RSS feeds every `REFRESH_INTERVAL_MINUTES` minutes
  (default 30), plus once on startup.
- Copy `backend/env.example.txt` to `.env` and adjust `PORT` /
  `REFRESH_INTERVAL_MINUTES` if needed.

Endpoints:
- `GET /health`
- `GET /api/news?category=&page=&pageSize=` — paginated, sorted by `published_at` desc.
  `category` is one of `madera`, `muebles_cocina`, `muebles_hogar`, `ferias_maquinaria`.
- `GET /api/categories` — the 4 categories with article counts.

### Editing the feed list

Edit `backend/feeds.json` — an array of `{ "source", "category", "url" }`. No code
changes needed; the next refresh cycle (or a restart) will pick up changes.
The architecture works with any valid RSS/Atom URL.

## Mobile (Expo, Android + iOS)

```bash
cd mobile
npm install
npx expo start
```

Scan the QR with Expo Go, or press `a`/`i` for an emulator/simulator.

Point the app at your backend with `EXPO_PUBLIC_API_URL` (defaults to
`http://localhost:3001`):

```bash
EXPO_PUBLIC_API_URL=https://your-backend.example.com npx expo start
```

5 tabs: "Todo" + the 4 categories, each a paginated list with pull-to-refresh;
tapping a card opens the article in the device browser.

## Hosting the backend (free/cheap)

This is a small Node + SQLite service — no need for anything heavy:

- **Render.com (recommended to start)**: free/low-cost Web Service running
  `npm start`. SQLite is file-based, so the data file must live on a
  **persistent disk** — Render's free tier web services do NOT have a
  persistent disk by default (the filesystem is ephemeral and resets on
  deploy/restart). Use Render's paid "Disk" add-on (a few dollars/month) mounted
  at the backend's working directory, or:
- **Railway**: similar free/hobby tier; check current persistent-volume support
  for your plan.
- **Fly.io**: offers free small persistent volumes, a good fit for SQLite.

If/when this needs to scale beyond a single instance (e.g. multiple backend
replicas, or you want zero-downtime deploys without worrying about disk
persistence), switch `backend/src/db.js` to a managed Postgres (e.g. Render
Postgres free tier, Supabase, Neon) instead of SQLite — the rest of the app
(API routes, cron refresh, mobile client) doesn't need to change.
