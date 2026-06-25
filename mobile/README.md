# Noticias Madera y Mueble (mobile)

Expo (React Native + TypeScript) app for browsing wood/furniture industry news,
backed by the `backend/` Node service.

## Run

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (Android/iOS) or press `a` / `i` for an emulator/simulator.

## Configuration

The API base URL is read from `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:3001`).

```bash
EXPO_PUBLIC_API_URL=https://your-backend.example.com npx expo start
```

When testing on a physical device with a local backend, `localhost` won't resolve to
your computer. Use your machine's LAN address on your local network instead
(check it with `ipconfig`/`ifconfig`, it will look like `http://<your-lan-address>:3001`).

## Structure

- `App.tsx` — bottom tab navigation (Todo + 4 categories)
- `src/api.ts` — API client
- `src/types.ts` — shared TypeScript types
- `src/screens/NewsListScreen.tsx` — paginated, pull-to-refresh article list
- `src/components/ArticleCard.tsx` — article card, opens links in device browser
