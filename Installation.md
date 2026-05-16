# How to Install

1. Pull repo from git
`git pull origin main`
2. Build frontend and backend
`cd /frontend && pnpm build`
`cd ../backend && pnpm build`
3. Build and run docker containers
`sudo docker compose up -d --build`

## Mobile App (Expo / React Native)

The `/mobile` directory contains an Expo app that reuses this backend via JWT
auth. All backend modifications are documented in `BACKEND_CHANGES.md`.

### Backend env for mobile

JWT signing reuses `SESSION_SECRET` by default; set `JWT_SECRET` to override.
No new *required* configuration; the existing session/web flow is unchanged.

### Run the app

```
cd mobile
pnpm install
# Point the app at your dev machine's LAN IP so a phone/emulator can reach it:
EXPO_PUBLIC_API_BASE_URL="http://<YOUR_LAN_IP>:3666/api" pnpm start
```

Open with Expo Go (scan the QR) or press `a` (Android emulator) / `i` (iOS
simulator). Without `EXPO_PUBLIC_API_BASE_URL` it defaults to
`http://localhost:3666/api` (only reachable from the iOS simulator / web).

### Checks

```
cd mobile
pnpm type-check   # tsc --noEmit
pnpm lint         # expo lint
pnpm test         # vitest (pure domain logic)
```

See `mobile/README.md` for the manual end-to-end checklist.

