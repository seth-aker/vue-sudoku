# Backend Changes Log

All modifications to `/backend` made to support the React Native (Expo) client.
Each entry records **what**, **why**, and the **contract before → after**.
Guiding constraints: JWT is **additive** (the existing session/cookie web app
keeps working unchanged); DTO renames are **API-layer only** (no DB schema or
column changes — the DB continues to use `puzzle_id`).

---

## 1. JWT authentication (added alongside express-session)

**Why:** the mobile app cannot rely on browser cookies; it needs a bearer
token. Sessions remain for the existing Vue web client.

**Changes:**
- `feature/auth/config/index.ts` — added `jwtSecret`, resolved from
  `process.env.JWT_SECRET` and falling back to the existing `SESSION_SECRET`
  (no new **required** env var; `JWT_SECRET` is optional).
- **New** `feature/auth/handler/jwt.ts` — `signToken(user)` /
  `verifyToken(token)` using `jose` (already a dependency). HS256, `sub` =
  userId, 7-day expiry (matches the session cookie maxAge).
- **New** `feature/auth/middleware/identity.ts` — `resolveIdentity` middleware:
  populates `req.user` from an active session **or** a valid
  `Authorization: Bearer <jwt>`. Does not enforce auth (resolver only).
  Mounted globally in `index.ts` right after `sessionHandler()`.

**Contract before → after:**
- `POST /api/auth/login` — **before:** `200 { ...user }`; **after:**
  `200 { ...user, token }` (added field; web ignores it, mobile reads it).
- `POST /api/auth/register` — **before:** `201 { id, displayName, username,
  role }`; **after:** `201 { id, displayName, username, role, token }`.
- `GET /api/auth/logout` — unchanged. JWT logout is client-side (token
  discard); documented as intentionally minimal (no server-side revocation).

## 2. Unified identity on protected routes

**Why:** make session-or-JWT transparent to route handlers and keep the web
app working without per-route auth-source branching.

**Changes:**
- `feature/auth/middleware/validation.ts` — `requireLoggedin` / `requireAdmin`
  now check `req.user` (populated by `resolveIdentity`) instead of reading
  `req.session.user` directly.
- `feature/users/middleware/requireSelfOrAdmin.ts` — uses `req.user`.
- `feature/sudoku/routing/sudokuRouter.ts` — reads `req.user?.id` instead of
  `req.session.user?.id` (GET `/new`, GET `/:puzzleId`, PUT `/:puzzleId`).
- `feature/users/routing/userRouter.ts` — `/me` reads `req.user`.
- `feature/users/types/express/index.d.ts` — added an Express `Request.user`
  type augmentation (`{ id, username, role }`) so the resolver/guards
  type-check (the project does not pull passport's Request typings).

**Behavioral contract:** unchanged for clients. Session requests resolve
`req.user` from the session; bearer requests resolve it from the JWT.

## 3. DTO rename `_id` → `puzzleId` (API-layer only)

**Why:** align the API with the Postgres schema (which uses `puzzle_id`);
remove the legacy Mongo `_id` artifact. **No DB changes.**

**Changes:**
- `feature/sudoku/datasource/models/sudokuPuzzle.ts` — `SudokuPuzzle._id`,
  `UpdatePuzzle._id`, `UserPuzzleDto._id` → `puzzleId`; `CreatePuzzle` Omit
  updated.
- `feature/sudoku/datasource/pgSudokuDataSource.ts` — response mapping and
  `UpdatePuzzle` field reads use `puzzleId` (SQL still uses the `puzzle_id`
  column).
- `feature/sudoku/service/sudokuServiceImplementation.ts` — `getUserPuzzle`
  returns `puzzleId`; `updateUserPuzzle` reads `puzzle.puzzleId`.
- `feature/sudoku/middleware/validation/schema/sudokuPuzzle.ts` —
  `updateUserPuzzleSchema` body field `_id` → `puzzleId`.

**Contract before → after:**
- `GET /api/sudoku/new` response `puzzle._id` → `puzzle.puzzleId`.
- `GET /api/sudoku/:puzzleId` response `_id` → `puzzleId`.
- `PUT /api/sudoku/:puzzleId` request body `_id` → `puzzleId` (required).

**Web app impact:** the Vue `frontend/` was updated in lockstep
(`services/sudokuService.ts`, `utils/serialization.ts`,
`stores/sudokuStore.ts`) so it continues to work — see "Web app verification".

## 4. Fix `/users/:id/stats` (two latent bugs)

**Why:** the stats endpoint was doubly broken — it would never return data.

**Changes:**
- `feature/users/service/userServiceImplementation.ts` — `getUserStats`
  fetched the stats but **never returned them** (the `callDataSource`
  callback returned `void`), so the service resolved to `undefined`. Now
  returns `userStats`. (This also resolves a pre-existing TS error where the
  impl's `Promise<void>` did not satisfy `UserService.getUserStats(): 
  Promise<IUserStats>`.)
- `feature/users/routing/userRouter.ts` — response was double-encoded:
  `res.json(JSON.stringify(stats))` → `res.json(stats)`. (`/users/:id`
  already used single-encoded `res.send(JSON.stringify(user))`, left as-is.)

**Contract before → after:** `GET /api/users/:id/stats` — **before:**
effectively `undefined` (serialized as the string `"undefined"`/empty);
**after:** a proper JSON stats array. The Vue web app's `getUserStats`
benefits from the same fix.

## 5. CORS

**Decision:** no code change. CORS is a browser-only control; the native
client does not send an `Origin` and is unaffected. The bearer flow uses the
`Authorization` header, which the existing `cors()` config permits, and does
not rely on `credentials`. The web app's existing credentialed CORS config is
left intact.

---

## Verification

- **Backend** `tsc --noEmit`: clean (also cleared the pre-existing
  `getUserStats` `Promise<void>` type error fixed in §4).
- **JWT** runtime smoke test: a valid token signs (3-part JWT) and verifies to
  the correct identity; tampered and malformed tokens are rejected
  (`verifyToken` → `undefined`).
- **Web app**: the Vue `frontend/` `_id`→`puzzleId` rename was applied in
  lockstep (`services/sudokuService.ts`, `utils/serialization.ts`,
  `stores/sudokuStore.ts`); `vue-tsc` type-check passes. Sessions/CORS are
  untouched, so session login + puzzle fetch/save continue to work; stats now
  work correctly for both clients (§4).
- **No DB schema/column changes** were made (the DB keeps `puzzle_id`; only the
  JSON field name changed).
- **No backend test suite** exists in the repo, so there were no backend tests
  to run/regress; correctness is covered by the type-check + JWT smoke test
  above and the mobile-side domain/Vitest suites.
