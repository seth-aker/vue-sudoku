# Sudoku Chive — Mobile (Expo)

React Native mobile client for sudoku-chive, built with **Expo SDK 55** and **Expo Router 5**. Backend lives in `../backend`. The Vue web client at `../frontend` is **not in sync** with the post-migration backend — mobile is the actively-maintained client.

## Quick start

```bash
cd mobile
pnpm install
pnpm start
```

Then:
- Press **`i`** for iOS Simulator (macOS only)
- Press **`a`** for Android emulator
- Scan the QR with **Expo Go** on your phone (iOS / Android — same SDK)

`pnpm start` runs `bundle-readme.mjs` first so the About page always reflects the repo-root README.

## Backend setup

The mobile app expects the JWT-aware backend from `../backend`. From a fresh checkout:

```bash
cd backend
cp .env.example .env
# fill in DB_CONNECTION_STRING, DB_NAME, SESSION_SECRET (≥32 chars), JWT_SECRET (≥32 chars)
docker compose up -d postgres-db    # or your own Postgres
pnpm install
pnpm dev                            # serves :3666
```

Verify with:

```bash
# 1. register a user
curl -X POST -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"Aa1!aaaa"}' \
  http://localhost:3666/api/auth/register

# 2. exchange creds for a JWT
curl -X POST -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"Aa1!aaaa"}' \
  http://localhost:3666/api/auth/token
```

## Pointing at the backend

`app.config.ts` resolves the API base URL at config-eval time:

- `development` default → `http://localhost:3666/api`
- `production` default → `https://sudoku.aker-bergeron.dev/api`

Override at boot:

```bash
API_BASE_URL=http://192.168.1.42:3666/api pnpm start
```

When running on a **physical device**, `localhost` is the phone, not your laptop. Two ways to reach the backend:

1. **LAN IP** — set `API_BASE_URL` to your laptop's IP. Find it with `ip a | grep inet` (Linux), `ifconfig | grep inet` (macOS), or `ipconfig` (Windows).
2. **USB reverse (Android)** — `adb reverse tcp:3666 tcp:3666`. Then `localhost` works on the device. (Requires USB debugging.)

## What's in here

```
mobile/
├── app/                          file-based routes
│   ├── _layout.tsx               SafeAreaProvider · ThemeProvider · Stack · Toast · session bootstrap
│   ├── index.tsx                 home / difficulty picker / resume / theme toggle / sign in
│   ├── about.tsx                 renders bundled README via react-native-markdown-display
│   └── sudoku/[difficulty].tsx   game screen
├── scripts/
│   └── bundle-readme.mjs         pre-start hook: ../README.md → src/generated/readme.ts
├── src/
│   ├── api/                      apiFetch · tokenStorage · userService · sudokuService
│   ├── stores/                   useUserStore · useGameStore · useToastStore
│   ├── components/               game/ · auth/ · ui/ · Toast
│   ├── theme/                    tokens (oklch → hex) · ThemeProvider · makeStyles helper
│   ├── game/                     pure-JS board / serialization / constraints (no type bits)
│   ├── types/                    Cell · Action · Difficulty · GameStatus + BOARD_SIZE constants
│   ├── validation/               zod schemas (login + register)
│   ├── config/                   API_BASE_URL · PUZZLE_DIFFICULTY_ROUTES
│   └── generated/                build-time outputs (.gitignored)
└── __tests__/                    64 jest tests covering game logic + store
```

## Architecture notes

- **No NativeWind, no className.** Every component uses `StyleSheet.create()` via the `makeStyles((theme) => …)` helper. Light/dark themes swap by changing the active token table.
- **Auth is bearer-only on mobile.** Login: `POST /auth/token` returns `{ token, expiresAt, user }`. The JWT lives in `expo-secure-store` (Keychain / Keystore). The web app still uses session cookies; both work against the same backend.
- **Single combined `useGameStore`** owns puzzle data, interaction state, undo/redo, timer, and auto-save. Replaces the web app's split sudokuStore + gameStore.
- **Auto-save fires** on a 10-second tick, on `AppState` background, and on screen-leave (`useFocusEffect` cleanup). All three fire `saveGameState()` (= `PUT /sudoku/:puzzleId`).
- **Flat 81-cell array.** `Cell = { idx, value, candidates[] }` — no `type` field, no `cellId`. "Prefilled" is derived at render time by comparing against `originalCells`.
- **Cell serialization is 20 bits per cell, 21 per action** — the 2 type bits the web encoding used are gone. Wire-format strings (cells, candidates) are unchanged.

## Testing

```bash
pnpm test          # jest unit tests for game logic + store (64 tests, ~1 s)
pnpm type-check    # tsc --noEmit
```

Jest uses `jest-expo` + a setup file (`jest.setup.ts`) that mocks native modules (`expo-secure-store`, `@react-native-async-storage/async-storage`, `expo-constants`).

## Caveats / known limitations

- **Vue web client (`../frontend`) is out of sync.** The backend's `_id` → `puzzleId` rename + dropped action type bits break it. We don't update it; mobile is the focus.
- **Hardware keyboards not supported.** All input is via the on-screen numpad + controls.
- **Cross-client undo history is incompatible.** Web encodes actions as `(x, y, …)`; mobile encodes them as `(idx, …)`. Puzzle state itself round-trips fine.
- **No splash / app icon.** Default Expo splash. (Out of scope; can be added later via `expo-splash-screen` config plugin.)
- **Local cache is write-only on mobile boot.** `AppState` background saves to `mobile:gameState` in AsyncStorage, but we don't restore from it on boot — the server is the source of truth. Easy to wire if/when needed.
- **No JWT refresh.** The default `JWT_TTL` is 7 days; when it expires, the apiFetch wrapper clears the token and the user logs in again. A refresh-token flow can be added later (would require a small DB migration).

## Dev tips

- The bundle is regenerated on every `pnpm start` — if you edit the repo-root README, the About page picks up the change next launch.
- For an authoritative type-check: `pnpm type-check`. CI / pre-commit candidate.
- The Expo Web target works for quick UI debugging (`pnpm web`), but it isn't a production target — `expo-secure-store` silently no-ops there.

## Pointers for extension

- **App icon / splash** → drop assets and add `expo-splash-screen` config plugin to `app.json`.
- **Hardware keyboard support** → `react-native-keyevent` + add keyboard listener in the game screen.
- **JWT refresh** → backend needs a `refresh_tokens` table + `/auth/token/refresh` endpoint; mobile needs an auto-refresh-on-401 path in `apiFetch`.
- **Resume-from-local on boot** → uncomment a `useGameStore.getState().loadFromLocal()` call in `_layout.tsx` after a server attempt fails.
- **Deploy** → `eas build` once the EAS project is set up; out of scope here.
