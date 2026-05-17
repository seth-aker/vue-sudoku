# React Native (Expo) Mobile App Migration Plan

> **Status:** Draft for user review — do **not** begin implementation until this document is approved.
>
> **Author:** Claude Code
> **Date:** 2026-05-16
> **Repo:** `/home/saker/da/boxing/sudoku-chive`

---

## 1. Goal

Ship a mobile client for sudoku-chive built with **Expo (React Native)** that reuses the existing Express backend with only configuration-level changes. The existing Vue 3 web frontend stays in the repo unchanged.

## 2. Non-Goals

- **No** NativeWind, no Tailwind syntax inside `/mobile`. Styling is plain `StyleSheet.create` + a theme module.
- **No** rewriting the game logic — pure-JS utilities under `frontend/src/utils/` and the puzzle serialization format are reused verbatim.
- **No** changes to the Vue web app's behavior. We add a new sibling `/mobile` workspace; we do not touch `/frontend/src/**`.
- **No** abandoning session cookies on the web. The web frontend keeps working exactly as it does today.
- **No** EAS Build / app-store submission as part of this milestone — that comes later. We target running locally in **Expo Go** (or a custom dev client if a native module forces it) on iOS Simulator, Android emulator, and a physical device.

## 3. Locked-In Decisions

From the planning Q&A:

| Decision | Choice |
|---|---|
| Repo layout | **Keep `/frontend`, add `/mobile`** as a sibling pnpm workspace |
| Auth | **Hybrid:** web keeps cookie/session; mobile uses **JWT bearer tokens** via a new `/auth/token` flow |
| Styling | **Plain `StyleSheet.create`** + a small `theme.ts` with light/dark tokens |
| Navigation | **Expo Router** (file-based, `app/` directory) |

From the second review round:

| Decision | Choice |
|---|---|
| Code sharing | **Copy** pure-JS utils into `/mobile`. **No** `/packages/shared` extraction. |
| Register flow | OK to call `/auth/register` then immediately `/auth/token` (extra round-trip accepted). |
| About-page markdown | **Read `README.md` from repo root at build time** and bundle it as a TS string in the app. |
| Icons | Use **`lucide-react-native`** for everything; map Iconify icons to nearest Lucide equivalent. |
| Hardware keyboard | **Dropped.** All input goes through on-screen controls. |
| Tooltips | **Dropped.** Not used on mobile. |

From the third review round:

| Decision | Choice |
|---|---|
| Web frontend updates | **None.** The web client is intentionally left to drift; backend DTO + serialization changes will break it, and that is acceptable. Focus is mobile-only. |
| Cell type bits | **Removed entirely.** No `type` field on `Cell`, no type bits in the serialized number. "Prefilled" status is derived at render time from `originalCells`. |
| App splash / icon | **Skipped for now.** Default Expo splash. Revisit later. |
| Toast | **No library.** A ~30-line custom `<Toast />` + `useToast()` lives in the app — simpler than any package and avoids any native-module risk. |

From the fourth review round:

| Decision | Choice |
|---|---|
| JWT refresh | **Dropped.** No DB migration. Single long-lived JWT (7 days, matching the existing session-cookie maxAge). When it expires, the user logs in again. Can revisit later. |

## 3.5 Port-Time Data Model Optimizations (NEW)

The user asked for four data-model improvements during the port. These apply to **mobile** in full, and propagate into **backend** + **web frontend** where the wire format is affected.

### 3.5.1 Drop the `SudokuPuzzle` class

The current `frontend/src/stores/models/puzzle.ts` wraps cells and metadata in a class. In `/mobile`, **there is no puzzle class** — its fields live directly on the game store as plain state:

```ts
// inside useGameStore
puzzleId: string | null
cells: Cell[]              // length 81
originalCells: Cell[]      // length 81, snapshot for reset
difficulty: { rating: Difficulty; score: number } | null
isCompleted: boolean
```

Any logic that used to be a method on `SudokuPuzzle` becomes a pure function in `mobile/src/game/` (e.g. `getRow(cells, rowIdx)`, `getColumn`, `getBlock`, `isSolved(cells)`) or an action on the store.

### 3.5.2 Flat 81-cell array

The cell shape is fixed by the user as:

```ts
type Cell = {
  value: number;        // 0 = empty, 1–9 = filled
  idx: number;          // 0..80
  candidates: number[]; // sorted, unique, values 1–9; empty if none
};

type Cells = Cell[];    // always length 81
```

**No `type` field, no `cellId` field.** These were web-only artifacts. The current `'prefilled' | 'edited' | 'blank'` distinction is derived at render time:

```ts
function cellStatus(cell: Cell, original: Cell): 'prefilled' | 'edited' | 'blank' {
  if (original.value !== 0) return 'prefilled';
  return cell.value !== 0 ? 'edited' : 'blank';
}
```

This is purely a styling concern (prefilled cells render bold and aren't editable). It is **not** stored, not serialized, and not part of any action history.

Coordinate conversions (used by the renderer, not stored):

```ts
const row   = (idx: number) => Math.floor(idx / 9);
const col   = (idx: number) => idx % 9;
const block = (idx: number) => Math.floor(row(idx) / 3) * 3 + Math.floor(col(idx) / 3);
const at    = (x: number, y: number) => y * 9 + x;
```

`selectedCell` becomes `selectedIdx: number | null` (replacing the old `{x, y, cell}` shape).

The wire format for cells (81-character digit string) and candidates (colon-separated digits) is unchanged — deserialization just produces a flat `Cell[]` directly, which is **simpler** than today's nested decode.

### 3.5.3 Single combined game store

`gameStore` and `sudokuStore` merge into one **`useGameStore`** under `mobile/src/stores/useGameStore.ts`. Everything game-related (puzzle data, selection, undo/redo, timer, pause state, autosave) lives here. See §9 for the full shape.

`userStore` remains separate — auth/user state is unrelated to game state and benefits from staying decoupled.

### 3.5.4 Rename `_id` → `puzzleId` in the DTO

`_id` is a MongoDB artifact; the DB column is already `puzzle_id`. We **remove `_id` from the wire format and replace it with `puzzleId`** in:

| Endpoint | Field rename |
|---|---|
| `GET /sudoku/new` response | `_id` → `puzzleId` |
| `GET /sudoku/:puzzleId` response | `_id` → `puzzleId` |
| `PUT /sudoku/:puzzleId` body | `_id` → `puzzleId` |

Touch points: backend DTO formatter / response shape in `feature/sudoku/` only. **The web frontend is intentionally not updated** (per the user's third round of feedback). The Vue app will break against the new responses; this is an accepted cost of the focus shift to mobile.

### 3.5.5 Cell serialization: type bits removed

Today's `serializeCell` packs 22 bits — 7 idx + 4 value + 9 candidate-mask + 2 type. With the `type` field gone (§3.5.2), serialization shrinks to **20 bits**:

```
bit layout (mobile):
  bits  0..6   : idx        (7 bits, 0..80 ≤ 127)
  bits  7..10  : value      (4 bits, 0..9)
  bits 11..19  : candidates (9-bit mask, candidate n = bit n-1)
```

`serializeAction` adds one more bit on top for `isParent` → **21 bits total**. Actions no longer carry redundant `(x, y)` fields; `prevCell.idx` is the source of truth.

The reference implementations:

```ts
const ctz = (n: number) => { let c = 0; while ((n & 1) === 0) { c++; n >>= 1; } return c; };

export function serializeCell(cell: Cell): number {
  const mask = cell.candidates.reduce((m, c) => m | (1 << (c - 1)), 0);
  return (mask << 11) | ((cell.value & 0xF) << 7) | (cell.idx & 0x7F);
}

export function deserializeCell(n: number): Cell {
  const idx = n & 0x7F;
  const value = (n >> 7) & 0xF;
  let mask = (n >> 11) & 0x1FF;
  const candidates: number[] = [];
  while (mask !== 0) { candidates.push(ctz(mask) + 1); mask &= mask - 1; }
  return { idx, value, candidates };
}

export function serializeAction(a: Action): number {
  return (a.isParent ? 1 << 20 : 0) | serializeCell(a.prevCell);
}

export function deserializeAction(n: number): Action {
  return { isParent: ((n >> 20) & 1) === 1, prevCell: deserializeCell(n & 0xFFFFF) };
}
```

This makes the wire format **incompatible** with the web client's current encoding (the web app's `deserializeCell` would read garbage from the extra-narrow numbers). Per the user's instruction, this is accepted; the web client is no longer a target.

### 3.5.6 `Action` shape

With the simplifications above:

```ts
type Action = {
  prevCell: Cell;     // the cell before the change (its idx says where)
  isParent: boolean;  // marks an action group boundary (existing semantics, unchanged)
};
```

No `x`, no `y`. The old web shape had both; they were redundant once `cellId` existed, and doubly so now that `idx` is on the cell.

## 4. High-Level Architecture

```
sudoku-chive/
├── backend/                       # Express API (existing) — minor changes only
│   ├── src/feature/auth/          # add JWT issue + verify middleware
│   └── src/core/config/           # add JWT_SECRET, JWT_TTL, MOBILE_ORIGIN(s)
├── frontend/                      # Vue 3 SPA (existing) — untouched
├── mobile/                        # NEW: Expo Router app
│   ├── app.json / app.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── app/                       # file-based routes
│   ├── src/
│   │   ├── api/                   # fetch client + per-resource services
│   │   ├── stores/                # zustand stores (mirror Pinia stores)
│   │   ├── components/            # RN components (custom; no reka-ui)
│   │   ├── theme/                 # tokens + ThemeProvider + useTheme
│   │   ├── game/                  # pure JS copied from frontend/src/utils
│   │   ├── validation/            # zod schemas (copied verbatim)
│   │   └── config/                # API base URL via expo-constants
│   └── assets/
├── packages/                      # (optional, see §13) shared workspace
└── docker-compose.yaml            # unchanged for prod; mobile dev runs outside docker
```

The mobile app talks to the backend the same way the web app does, just with a JWT in `Authorization: Bearer …` instead of a cookie.

---

## 5. Backend Changes (minimal, configuration-level)

> Constraint from the user: minimal backend changes, mostly configuration. JWT support is the one structural addition.

### 5.1 CORS

`backend/src/index.ts` currently allows:

- Prod: `config.origin` (single string from `ORIGIN`)
- Dev: `['http://localhost:5173', 'http://127.0.0.1:5173']`

**Change:**
- Accept multiple origins (array). In dev, also allow `http://localhost:8081` (Expo dev server) and `http://localhost:19006` (legacy web port), plus the `exp://…` scheme is irrelevant since RN fetch sends no `Origin` header on native — CORS only matters when running the Expo app in a browser (Expo Web), which we are not targeting.
- For native RN, **no Origin header is sent**, so CORS does not block requests. We do not need to whitelist mobile IPs.

### 5.2 New auth endpoint: `POST /auth/token`

Issue a long-lived JWT for mobile clients. **Single token, no refresh** (per the fourth-round decision — no DB migration desired).

- **Request body:** `{ username: string, password: string }` (same validator as `/auth/login`)
- **Response:** `{ token: string, expiresAt: number, user: IUserDto }`
- Re-uses the existing password verification path in `feature/auth/authentication.service`.
- Token claims: `{ sub: userId, role, iat, exp }`; signed with `JWT_SECRET` (new env var); TTL `JWT_TTL` (default `7d`, matching the existing session cookie maxAge).

When the JWT expires, the apiFetch wrapper sees a 401, clears the stored token, surfaces a "session expired" toast, and routes the user back to the home screen with the auth sheet open. The user logs in again. No refresh-token machinery, no database changes.

### 5.4 Bearer-aware auth middleware

Today `requireLoggedin` reads `req.session.user`. Wrap it:

```ts
// pseudocode
function requireLoggedinHybrid(req, res, next) {
  if (req.session?.user) return next();                  // cookie path (web)
  const token = parseBearer(req.headers.authorization);
  if (token) {
    const claims = verifyJwt(token);
    if (claims) { req.user = claims; return next(); }    // jwt path (mobile)
  }
  return res.status(401).json({ message: 'Unauthorized' });
}
```

- `req.user` becomes the canonical "current user" reference downstream.
- Existing handlers that read `req.session.user` are updated to a helper `getCurrentUser(req)` that returns from either source. **This is a small grep-and-replace, not a rewrite.**

### 5.5 Config additions

`backend/.env.example` gains:

```
JWT_SECRET={STRING}
JWT_TTL=7d
```

`backend/src/core/config/index.ts` reads them.

### 5.6 No change to register/login/logout for web

The existing `/auth/login`, `/auth/register`, `/auth/logout` endpoints keep doing exactly what they do today (session cookie). Mobile simply does not call them.

### 5.7 Session cookie configuration

No change needed for mobile. Web behavior is preserved.

### 5.8 DTO field rename: `_id` → `puzzleId`

Per §3.5.4, the sudoku endpoints' wire format drops `_id` in favor of `puzzleId`.

| Endpoint | Before | After |
|---|---|---|
| `GET /sudoku/new` | `{ _id, cells, candidates, difficulty }` | `{ puzzleId, cells, candidates, difficulty }` |
| `GET /sudoku/:puzzleId` | `{ _id, isCompleted, currentCells, … }` | `{ puzzleId, isCompleted, currentCells, … }` |
| `PUT /sudoku/:puzzleId` (body) | `{ _id, cells, candidates, … }` | `{ puzzleId, cells, candidates, … }` |

Touch points: the DTO mapper(s) in `backend/src/feature/sudoku/` and the Zod validator for the PUT body. Probably ≤20 lines. The web frontend is **not** updated; it will break against this change, which the user has accepted.

### 5.9 Backend touch list (final)

| File | Change |
|---|---|
| `backend/.env.example` | add `JWT_SECRET`, `JWT_TTL` |
| `backend/src/core/config/index.ts` | read new env vars; **A3** — fix hardcoded `WORKER_PATH` default |
| `backend/src/feature/auth/config/index.ts` | **A4** — enforce `SESSION_SECRET` ≥ 32 chars |
| `backend/src/feature/auth/handler/sessionHandler.ts` | **A5** — explicit `httpOnly: true`, `sameSite: 'strict'` |
| `backend/src/feature/auth/routing/authRouter.ts` | new `POST /auth/token` route; **A1** — `/logout` GET → POST |
| `backend/src/feature/auth/service/authenticationServiceImpl.ts` | `issueToken(user)` helper |
| existing `requireLoggedin` middleware | accept bearer token alongside session |
| `backend/src/feature/auth/jwt.ts` (NEW) | `signJwt` / `verifyJwt` using `jose` (already a dep) |
| `backend/src/feature/sudoku/routing/sudokuRouter.ts` | DTO rename (§5.8); **A2** — drop `_id` from PUT body; **A6** — remove commented routes |
| `backend/src/feature/sudoku/datasource/models/*` | DTO field rename |
| `backend/src/feature/sudoku/middleware/validation/*` | drop `_id` from PUT validator (A2) |
| `backend/src/feature/users/datasource/pgUserDataSource.ts` | **B10** — catch unique-violation, surface 409 |
| `backend/src/core/errors/*` | add `ConflictError` (409) class if not present |
| `backend/src/core/middleware/errorHandler.ts` (NEW) | **B7** — global JSON error handler, maps `ZodError`→400, `CustomError` subclasses→their status, default→500 |
| `backend/src/core/routing/index.ts` (or wherever `configureRouting` lives) | mount the new error handler last |
| `backend/src/index.ts` | (optional) widen dev CORS to include `http://localhost:8081` for Expo Web |

**No DB migrations. No web frontend changes.** The web client is allowed to break.

### 5.11 Accepted port-time improvements

From §26: items **A1, A2, A3, A4, A5, A6** plus **B7** and **B10** are accepted and folded into Phase 1. C, D, E items remain deferred per §26.

---

## 6. Mobile App: Scaffolding

### 6.1 Workspace integration

- Add `mobile` to `pnpm-workspace.yaml`.
- `mobile/package.json` with `name: "mobile"`, `private: true`.

### 6.2 Initial setup

```
cd mobile
npx create-expo-app@latest . --template tabs   # then strip the example screens
```

Use the **TypeScript** template and **Expo Router** (this is the default in recent `create-expo-app`). Verify by ensuring `expo-router` is in `dependencies`.

### 6.3 Required Expo packages

| Package | Purpose |
|---|---|
| `expo` | core SDK |
| `expo-router` | file-based navigation |
| `expo-status-bar` | status bar control |
| `expo-secure-store` | JWT storage (encrypted on iOS Keychain / Android Keystore) |
| `expo-constants` | read `extra` config for API base URL |
| `expo-system-ui` | background color before JS loads |
| `expo-font` | (optional) custom font |
| `react-native-safe-area-context` | safe-area on notched devices |
| `react-native-screens` | native screen container (perf) |
| `react-native-gesture-handler` | required by some Expo Router transitions |
| `@react-native-async-storage/async-storage` | non-sensitive persistence (game state cache) |
| `zustand` | state management (Pinia replacement) |
| `zod` | validation (already used) |
| `lucide-react-native` | icon set (mirrors `lucide-vue-next`) |
| `react-native-svg` | peer dep for lucide icons |
| `react-native-markdown-display` | renders the About page |

**No toast library.** A ~30-line custom `<Toast />` + Zustand toast slice + `useToast()` hook lives under `mobile/src/components/Toast.tsx`. Renders a `<View>` pinned to the top of the screen via `<SafeAreaView>`, animates in/out with `Animated.Value`, auto-dismisses after 3 s. Mounted once in `app/_layout.tsx`. This is genuinely simpler than wiring up any package, and has no native-module risk for Expo Go.

Everything in the dependency list above is supported by **Expo Go** today. No custom native code, so we do **not** need to switch to a dev client.

### 6.4 TypeScript config

- `mobile/tsconfig.json` extends `expo/tsconfig.base`, sets `"strict": true` and `"jsx": "react-jsx"`.
- Path alias `@/* → src/*` (and `app/*` left as-is for Expo Router).

### 6.5 Linting / formatting

- Reuse the repo's prettier conventions where applicable; add a minimal `eslint.config.js` based on `eslint-config-expo`.

---

## 7. Configuration & API Base URL

### 7.1 Config strategy

Use `expo-constants` + `app.config.ts` so we can vary the API URL by build profile without rebuilding:

```ts
// app.config.ts
export default ({ config }) => ({
  ...config,
  extra: {
    apiBaseUrl:
      process.env.API_BASE_URL ??
      (process.env.NODE_ENV === 'production'
        ? 'https://sudoku.aker-bergeron.dev/api'
        : 'http://localhost:3666/api'),
  },
});
```

```ts
// mobile/src/config/index.ts
import Constants from 'expo-constants';
export const API_BASE_URL = Constants.expoConfig!.extra!.apiBaseUrl as string;
```

### 7.2 Dev machine quirk

When running on a physical device against a backend on the dev laptop, `localhost` resolves to the phone, not the laptop. Document in `mobile/README.md`:

- Use the **LAN IP** of the dev machine (e.g. `http://192.168.1.42:3666/api`).
- Or use `adb reverse tcp:3666 tcp:3666` for Android USB.

This is a config concern, not a backend change.

---

## 8. Authentication on the Client

### 8.1 Token storage

The single JWT lives in `expo-secure-store` (Keychain on iOS, Keystore on Android). Wrap reads/writes in a small `tokenStorage` module:

```ts
// mobile/src/api/tokenStorage.ts
async function getToken(): Promise<string | null>;
async function setToken(t: string): Promise<void>;
async function clearToken(): Promise<void>;
```

### 8.2 Fetch wrapper

`mobile/src/api/client.ts`:

```ts
async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (res.status === 401) {
    await clearToken();
    useUserStore.getState().reset();   // also surfaces a "session expired" toast
  }
  return res;
}
```

No `credentials: 'include'` — the server identifies the request via the bearer header.

### 8.3 Login / register flow

- `LoginForm` → `POST /auth/token` → store JWT → fetch `/users/me` → seed `useUserStore`.
- `RegisterForm` → `POST /auth/register` (web-shaped, returns `IUserDto` + session cookie that mobile ignores) → immediately `POST /auth/token` with the same credentials → store JWT → seed `useUserStore`.
- Logout → `clearToken()` + reset `useUserStore`. No server call required; the JWT is stateless and will simply time out server-side.

### 8.4 Session resume

On app launch: if a token exists, call `GET /users/me`. On 200 seed the user store; on 401 the apiFetch wrapper clears the token automatically.

---

## 9. State Management (Pinia → Zustand)

Three Pinia stores collapse to **two** Zustand stores per §3.5.3.

### 9.1 `useUserStore` — unchanged in shape

`mobile/src/stores/useUserStore.ts` mirrors the existing Pinia `userStore`. State: `id, displayName, username, image, role, userLoading, currentPuzzleId, userStats, error`. Actions: `login, register, logout, getSelf, getUserStats`. `isAuthenticated` is a selector. Calls go through the apiFetch wrapper (§8.2) with JWT.

### 9.2 `useGameStore` — combined puzzle + game store

`mobile/src/stores/useGameStore.ts` absorbs **all** game state and logic. No more `puzzleClass`; no more separate `sudokuStore` and `gameStore`.

```ts
type GameStatus = 'not-started' | 'playing' | 'paused' | 'solved';
type Difficulty = 'beginner' | 'easy' | 'medium';

interface GameState {
  // — puzzle data (was SudokuPuzzle class) —
  puzzleId: string | null;
  cells: Cell[];                 // length 81
  originalCells: Cell[];         // length 81, snapshot for reset
  difficulty: { rating: Difficulty; score: number } | null;
  isCompleted: boolean;

  // — interaction state (was sudokuStore) —
  selectedIdx: number | null;    // 0..80 (replaces selectedCell)
  usingPencil: boolean;
  autoCandidateMode: boolean;
  actions: Action[];
  redoActions: Action[];
  loading: boolean;

  // — timer/state (was gameStore) —
  elapsedSeconds: number;
  status: GameStatus;

  // — actions —
  getNewPuzzle: (opts: { difficulty: Difficulty }) => Promise<void>;
  getUserPuzzle: (puzzleId: string) => Promise<void>;
  saveGameState: () => Promise<void>;          // PUT /sudoku/:puzzleId
  setCell: (idx: number, value: number) => void;
  toggleCandidate: (idx: number, value: number) => void;
  selectCell: (idx: number | null) => void;
  togglePencil: () => void;
  toggleAutoCandidate: () => void;
  undo: () => void;
  redo: () => void;
  resetPuzzle: () => void;       // restores from originalCells, confirms via Alert
  fillCandidates: () => void;
  clearCandidates: () => void;
  startTimer: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  tickSecond: () => void;        // called by the 1s interval
  loadFromLocal: () => Promise<void>;   // hydrate from AsyncStorage
  saveToLocal: () => Promise<void>;     // persist to AsyncStorage
  clearLocal: () => Promise<void>;
}

// selectors (computed)
const selectIsPuzzleSolved = (s: GameState) => s.cells.every(c => c.value !== 0) && !hasAnyError(s.cells);
const selectFormattedElapsed = (s: GameState) => formatHMS(s.elapsedSeconds);
const selectTimerActive = (s: GameState) => s.status === 'playing';
```

Where the old code referenced `puzzleStore.someField` and `gameStore.someField` separately, mobile code reads both off the single store.

### 9.3 Pure functions extracted from the old class

The old `SudokuPuzzle` class methods become pure helpers in `mobile/src/game/board.ts`, operating on a `Cell[]`:

```ts
getRow(cells: Cell[], row: number): Cell[]
getColumn(cells: Cell[], col: number): Cell[]
getBlock(cells: Cell[], block: number): Cell[]
findFirstError(cells: Cell[]): number | null     // returns idx or null
isSolved(cells: Cell[]): boolean
computeCandidates(cells: Cell[]): Cell[]         // returns a new array
```

These are tested independently with Jest.

### 9.4 VueUse replacements

- `useIntervalFn` → `setInterval` inside a `useEffect` that's mounted while `status === 'playing'`.
- `useColorMode` → `useTheme()` from our `ThemeProvider` (§10), with `Appearance.getColorScheme()` for OS default.
- `useMousePressed` → `<Pressable>` with `onPressIn` / `onPressOut` for the password-visibility hold.
- `watchDebounced` → `useEffect` + `setTimeout` cleanup, or `lodash.debounce`.

---

## 10. Theming & Styling (no NativeWind)

### 10.1 Theme module

`mobile/src/theme/tokens.ts` copies the oklch color tokens from `frontend/src/assets/main.css` into TS, converted to hex/rgb (RN doesn't accept oklch). One pass with a script or a manual table; we have ~20 tokens, both for light and dark.

```ts
export const lightTheme = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  card: '#ffffff',
  primary: '#3b82f6',
  // … one per CSS var in main.css
  radius: { sm: 4, md: 8, lg: 12 },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 },
  text: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 },
};
export const darkTheme = { ...lightTheme, background: '#0a0a0a', foreground: '#fafafa', /* … */ };
export type Theme = typeof lightTheme;
```

### 10.2 ThemeProvider

`mobile/src/theme/ThemeProvider.tsx` exposes:

```ts
const { theme, mode, setMode } = useTheme();   // mode: 'light' | 'dark' | 'system'
```

- Default: `system`, resolved via `useColorScheme()` from `react-native`.
- Persisted to AsyncStorage so the choice survives restarts.

### 10.3 Authoring styles

Every component does:

```ts
const styles = (t: Theme) => StyleSheet.create({
  container: { backgroundColor: t.background, padding: t.spacing[4] },
  title: { color: t.foreground, fontSize: t.text['2xl'], fontWeight: '600' },
});
```

And in the component:

```ts
const { theme } = useTheme();
const s = useMemo(() => styles(theme), [theme]);
return <View style={s.container}>…</View>;
```

This is the idiomatic "plain StyleSheet + theme" pattern. We will write a tiny `makeStyles(fn)` helper to remove the repeated `useMemo`.

### 10.4 No CSS, no className

`className` is not used anywhere in `/mobile`. The `cn`, `clsx`, `class-variance-authority`, and `tailwind-merge` utilities used by the web app are **not** ported.

---

## 11. Local Persistence (`localStorage` → AsyncStorage)

| Key | Today | Mobile |
|---|---|---|
| `mobile:gameState` | n/a | `AsyncStorage` JSON dump of `useGameStore`'s relevant slice (puzzle data + actions + elapsedSeconds + status). Single key now that the stores are merged. |
| JWT | n/a | **`expo-secure-store`** (NOT AsyncStorage, since it's a credential) |
| Theme mode | n/a | `AsyncStorage` |

`elapsedSeconds` lives inside the same `mobile:gameState` blob — no separate key — because the stores are unified. The store exposes `saveToLocal()` / `loadFromLocal()` (§9.2) wrapping AsyncStorage.

---

## 12. Routing (Vue Router → Expo Router)

| Web route | Expo Router file |
|---|---|
| `/` | `mobile/app/(tabs)/index.tsx` *or* `mobile/app/index.tsx` (no tabs initially) |
| `/about` | `mobile/app/about.tsx` |
| `/sudoku/:difficulty` | `mobile/app/sudoku/[difficulty].tsx` |
| (root layout) | `mobile/app/_layout.tsx` — wraps in `<ThemeProvider>`, `<SafeAreaProvider>`, `<Toaster>`, and seeds `userStore.getSelf()` |

The `beforeEnter` guard that rejects unknown difficulties becomes a check in `[difficulty].tsx` that calls `router.replace('/')` if the param isn't in `PUZZLE_DIFFICULTY_ROUTES`. `PUZZLE_DIFFICULTY_ROUTES` is reused from a shared constants file.

The `NavHeader` component becomes a custom header passed to the Stack via `screenOptions.header`, or, more idiomatically, a separate `<TopBar />` rendered inside `_layout.tsx`.

---

## 13. Code Sharing Strategy

**Decision (confirmed):** **No code sharing.** No `/packages/shared`. Pure-JS utils get **copied** (not imported) into `/mobile`. Web stays at `/frontend`, mobile at `/mobile`, both independently owned.

Files that get **adapted-and-copied** into `mobile/src/game/` (not verbatim — they need the new flat-array shape per §3.5.2):

```
frontend/src/utils/buildPuzzle.ts        → mobile/src/game/buildPuzzle.ts        (rewritten for Cell[])
frontend/src/utils/numberWorksInCell.ts  → mobile/src/game/numberWorksInCell.ts  (uses idx)
frontend/src/utils/calcBlockNumber.ts    → mobile/src/game/calcBlockNumber.ts    (takes idx)
frontend/src/utils/cellHasError.ts       → mobile/src/game/cellHasError.ts       (uses idx)
frontend/src/utils/serialization.ts      → mobile/src/game/serialization.ts      (deserializes string → Cell[])
frontend/src/stores/models/puzzle.ts     → DROPPED (no puzzle class, see §3.5.1)
frontend/src/stores/models/*.d.ts        → mobile/src/types/*.ts                 (Cell/Action types updated per §3.5.2)
frontend/src/validation/registerValidation.ts → mobile/src/validation/auth.ts    (copied verbatim — zod is portable)
```

`frontend/src/utils/cn.ts` is **not** copied (Tailwind class merging is web-only and we have no `className`).

Vitest tests on the originals get re-implemented under `mobile/__tests__/` against the new shape.

---

## 14. View-by-View Conversion

### 14.1 HomeView → `app/index.tsx`

- Difficulty cards as `<Pressable>` rows.
- "Resume" button only shown when `userStore.currentPuzzleId` is set.
- Toast on errors via `sonner-native`.

### 14.2 AboutView → `app/about.tsx`

- Web fetches `/README.md` from the static `public/` directory.
- Mobile **bundles the repo-root `README.md` at build time** into a TS string. Implementation: a tiny script `mobile/scripts/bundle-readme.ts` (or, even simpler, a Metro asset-extensions config) that reads `../README.md` and writes `mobile/src/generated/readme.ts` exporting `export default \`...\`;`. Wired into the `prebuild` / `prestart` npm scripts so it stays fresh.
- Render with `react-native-markdown-display`.
- `mobile/src/generated/` is `.gitignore`d to avoid checking in derived files.

### 14.3 Standard (game) → `app/sudoku/[difficulty].tsx`

The most complex view. Sub-tasks:

1. **Grid layout.** Web uses absolute positioning with inline pixel styles. Mobile uses a `<View>` flex grid sized to the available screen width. We compute `cellSize = Math.floor(Math.min(width, maxBoardSize) / 9)` once per layout via `onLayout` and pass it down. Sub-grid (3×3) borders are thicker — implemented with conditional `borderRightWidth` / `borderBottomWidth` on cells where `col(idx) % 3 === 2` or `row(idx) % 3 === 2`.
2. **Cell rendering.** Iterate the flat `cells: Cell[]` array; the component reads `idx` straight off each cell and uses helpers from `mobile/src/game/board.ts` for row/col/block highlighting.
3. **Cell selection.** `<Pressable>` per cell, calls `selectCell(idx)` on `useGameStore`.
4. **Number input.** The on-screen `Numpad` is the primary input. It dispatches `setCell(selectedIdx, n)` or `toggleCandidate(selectedIdx, n)` depending on `usingPencil`. The **hardware keyboard listener is removed** (see §15).
5. **Pause menu / loading / error.** Each is a `<Modal>` with `transparent` and our own backdrop.
6. **Reset confirmation.** Replaces `window.confirm(...)` with `Alert.alert(...)`, calling `resetPuzzle()` on confirm.
7. **Route-leave save.** Use Expo Router's `useFocusEffect` + a cleanup that calls `saveGameState`. Also save on `AppState` change to `background`.

### 14.4 NavHeader → `<TopBar />`

- Hamburger menu on the right opens a custom drawer (custom `<Modal>` from the right edge, or `expo-router`'s `Drawer`). No need for `reka-ui`'s navigation menu — mobile has no horizontal nav anyway.
- Dark mode toggle in the drawer.
- Login button → opens `<LoginDrawer />` (see 14.5).

### 14.5 LoginPopover / LoginDrawer → `<AuthSheet />`

- Replace popover-on-desktop / drawer-on-mobile bifurcation with a single bottom-sheet `<Modal>`.
- Hosts `<LoginForm />` and `<RegisterForm />` in a tab switcher.

---

## 15. Keyboard Input: Removed in Favor of On-Screen Controls

`SudokuControls.vue` listens to:

- arrows (navigate selection)
- 1–9 (enter number)
- Backspace/Delete (clear)
- P (toggle pencil)
- Ctrl+Z / Ctrl+Y (undo/redo)

On mobile, **all of these become on-screen buttons** — most already exist (`Numpad`, pencil toggle, undo/redo). The only missing affordance is arrow-based selection, which is replaced by tapping cells directly. The `<ControlInstructions />` popover is rewritten to describe touch gestures instead of keyboard shortcuts.

We do **not** support hardware keyboards in the initial release. Bluetooth-keyboard support can be added later via `react-native-keyevent` if there is user demand. *Defer.*

---

## 16. UI Component Replacements (reka-ui → custom RN)

None of the `frontend/src/components/ui/**` reka-ui wrappers carry over. The mobile app needs only a small subset, written from scratch with `<View>`, `<Pressable>`, `<TextInput>`, `<Modal>`:

| Vue/reka-ui component | Mobile equivalent | Implementation |
|---|---|---|
| `Button` | `<Button />` | `<Pressable>` with `variant` + `size` props that pick from theme tokens |
| `Card`, `CardHeader`, etc. | `<Card />` | `<View>` with theme padding/border/radius |
| `Dialog` | `<Modal>` | `transparent`, animated fade-in, backdrop press to close |
| `Drawer` | `<Modal>` from bottom | Custom slide-up animation with `Animated` |
| `Popover` | `<Modal>` | Same as Dialog; no anchor-positioning needed on mobile |
| `Tabs` | `<Tabs />` | Row of `<Pressable>`s + conditional `<View>` content |
| `Toggle`, `Switch` | RN's `<Switch />` | Built-in |
| `Checkbox` | `<Checkbox />` | `<Pressable>` with a check icon from `lucide-react-native` |
| `Accordion` | `<Accordion />` | `<Pressable>` header + `LayoutAnimation` for expand |
| `Input`, `Textarea`, `Label`, `Field*` | `<TextInput />` + `<Text />` | Built-in |
| `Separator` | `<View style={{ height: 1, backgroundColor: theme.border }} />` | Trivial |
| `Tooltip` | (omitted) | Not commonly used on touch UIs; drop for now |
| `NavigationMenu` | (omitted) | Replaced by Expo Router + `<TopBar />` |
| `Sonner` (toast) | custom `<Toast />` + `useToast()` | ~30 lines, no dep, mounted once in `app/_layout.tsx` (see §6.3) |

Each replacement lives under `mobile/src/components/ui/`. Names match Vue counterparts for easy mental mapping.

---

## 17. Icons

`lucide-vue-next` → `lucide-react-native`. API is identical: `<Sun size={20} color={theme.foreground} />`. No usage changes beyond the import.

For Iconify icons used in `HomeView` (`material-symbols:*`, `line-md:*`), pick the equivalent in `lucide-react-native` where one exists, or include a single PNG/SVG asset. **Inventory pass** required during implementation to map each Iconify icon to a Lucide one. *Listed in §22 as a follow-up checklist.*

---

## 18. Auto-Save Behavior

The web app calls `sudokuStore.saveGameState()` from `gameStore`'s 10s interval, from undo/redo/setCell, and on route leave. Mobile mirrors this:

- 10s interval inside `useGameStore` while `gameState === 'playing'`.
- `useFocusEffect` cleanup in the game screen calls `saveGameState`.
- `AppState` listener: on `change → 'background'` or `'inactive'`, call `saveGameState` *and* update AsyncStorage cache.
- `fetch(..., { keepalive: true })` is irrelevant on RN — instead, do the save **before** the JS bridge tears down by listening for `AppState`'s `background` event (this is the standard pattern).

---

## 19. Networking Differences to Verify

- **No `Origin` header on native fetch.** CORS is effectively bypassed; backend doesn't need to change. (Web is unaffected.)
- **No automatic cookie jar.** Bearer token only — already designed for.
- **Slower 401 surfacing.** Wrap every service call to handle 401 once (clear token, route to home).
- **HTTPS in production.** Backend already supports it. iOS App Transport Security requires HTTPS for production builds; localhost HTTP is whitelisted in Expo dev mode.

---

## 20. Testing Strategy

For this milestone, **manual + a small unit suite**. Test infrastructure:

- `jest-expo` preset for Jest.
- Reuse Vitest test cases for the pure-JS utils (`buildPuzzle.test.ts`, `puzzle.test.ts`) by converting `expect`/`describe` imports — they are already Vitest, which is API-compatible with Jest for these tests.
- No component snapshot testing yet; defer.
- Manual QA matrix: iOS Simulator, Android emulator, one physical device, light + dark mode, logged-in + anonymous, fresh-start + resume.

---

## 21. Build / Dev Workflow

### 21.1 Local dev

```
# terminal 1
pnpm --filter backend dev          # http://localhost:3666

# terminal 2
pnpm --filter mobile start         # Expo dev server, press i / a
```

Scan QR with Expo Go on a physical device (after updating `API_BASE_URL` to LAN IP). Document this in `mobile/README.md`.

### 21.2 Production

EAS Build is out of scope for this milestone. We will document the eventual steps in `mobile/README.md` but not configure them.

### 21.3 docker-compose

No changes. The mobile app is not containerized (Expo Go runs on the device).

---

## 22. Remaining Open Questions

All design questions are resolved. The only item left is one implementation detail answered on file-open:

1. **Existing `requireLoggedin` middleware location.** Should be in `feature/auth/`; I'll confirm and wrap it in-place rather than fork it.

Plan is otherwise ready for execution sign-off, modulo the §26 suggestions below.

---

## 23. Phased Implementation Order

Once approved, work proceeds in this order. Each phase is independently reviewable.

### Phase 1 — Backend: JWT + DTO rename + accepted improvements
- §5.1, §5.4, §5.5, §5.6, §5.7: CORS, hybrid `requireLoggedin`, env vars, no change to web session.
- §5.2: single `POST /auth/token` endpoint.
- §5.8 + A2: drop `_id` entirely from the PUT body; rename `_id` → `puzzleId` in GET responses. Web client is intentionally left broken.
- **A1**: `/auth/logout` GET → POST.
- **A3**: fix hardcoded `WORKER_PATH` default in `core/config`.
- **A4**: enforce `SESSION_SECRET` ≥ 32 chars.
- **A5**: explicit `httpOnly: true` + `sameSite: 'strict'` in session config.
- **A6**: delete commented-out routes in `sudokuRouter.ts`.
- **B7**: global JSON error handler middleware.
- **B10**: 409 on duplicate username at registration.
- Smoke tests: `curl -X POST /auth/token` returns a JWT; `curl -H "Authorization: Bearer …" /users/me` returns the user; new puzzle response contains `puzzleId`; duplicate-register returns 409; ZodError on bad body returns 400 JSON.

### Phase 2 — Expo app scaffold
- Add `/mobile` workspace, `create-expo-app`, Expo Router, TypeScript.
- Theme module, `ThemeProvider`, basic light/dark toggle.
- Root `_layout.tsx`, blank `index.tsx`, `about.tsx`, `sudoku/[difficulty].tsx`.

### Phase 3 — Pure-JS game code (new shape)
- Write `mobile/src/types/` with the new `Cell` / `Action` shapes (§3.5.2).
- Port `buildPuzzle`, `numberWorksInCell`, `calcBlockNumber`, `cellHasError`, `serialization` to operate on `Cell[]` instead of `Cell[][]`.
- Write `mobile/src/game/board.ts` (getRow/getColumn/getBlock/isSolved/computeCandidates).
- Copy `registerValidation.ts` verbatim.
- Jest tests for each.

### Phase 4 — API client + auth flow
- `apiFetch` wrapper (§8.2), `tokenStorage` (expo-secure-store), `useUserStore`.
- `<AuthSheet />` with `<LoginForm />` + `<RegisterForm />`, session-resume on launch (`/users/me`).
- Custom `<Toast />` + `useToast()` slice (§6.3).

### Phase 5 — Game store + rendering
- `useGameStore` (combined, per §9.2) with all actions.
- README bundling script (§14.2).
- Components: `<SudokuBoard />`, `<Cell />`, `<Numpad />`, `<SudokuControls />`, `<PauseMenu />`, `<LoadingOverlay />`, `<ErrorDialog />`.
- Wire up the Standard view end-to-end against the backend.

### Phase 6 — Auto-save, persistence, navigation polish
- 10s timer, `AppState` save-on-background, AsyncStorage cache (`mobile:gameState` blob).
- `<TopBar />`, drawer-style menu, theme toggle.
- About page rendered from the bundled README.

### Phase 7 — QA + docs
- Manual test matrix (iOS sim, Android emu, physical device, light/dark, auth + anon, fresh + resume).
- `mobile/README.md` with dev / LAN-IP / adb-reverse instructions, and a note that the Vue web client is no longer in sync with the backend.
- Update top-level `README.md` with a "Mobile app" section.

---

## 24. Out of Scope (for explicit clarity)

- Push notifications
- Offline-first PUT queue (we just retry on next save)
- App Store / Play Store submission
- Apple/Google sign-in
- Multiplayer / leaderboards UI
- Web build of the Expo app (Expo Web) — would re-introduce CORS and is unnecessary; the existing Vue app covers web

---

## 25. Files That Will Be Created or Modified

**Backend (modified):**
- `backend/.env.example` — `JWT_SECRET`, `JWT_TTL`
- `backend/src/core/config/index.ts` — read new env vars
- `backend/src/feature/auth/AuthRouter.ts` — `POST /auth/token`
- `backend/src/feature/auth/authentication.service.ts` — `issueToken(user)` helper
- existing `requireLoggedin` middleware — accept bearer alongside session
- `backend/src/feature/sudoku/**` DTO mappers + PUT validator — `_id` → `puzzleId` (§5.8)
- `backend/src/index.ts` — *optional* dev CORS widening

**Backend (created):**
- `backend/src/feature/auth/jwt.ts` — `signJwt` / `verifyJwt`

**Frontend / Vue web app:** **no changes.** The web client will be broken by §3.5.4 and §3.5.5; that is accepted.

**Repo root (modified):**
- `pnpm-workspace.yaml` — add `mobile`
- `README.md` — mention the mobile app, note web client is stale

**Mobile (all created):** see §4 for the full tree.

---

---

## 26. Suggested Improvements (à la carte — pick what you want)

Final repo pass turned up the items below. **None are in the plan scope yet.** Pick the ones you want and I'll fold them into the relevant phase; ignore the rest. Sorted roughly by leverage.

### A — Free during Phase 1 (I'm already touching these files)

These cost almost nothing because I'm in the file anyway for JWT / DTO work. Strong recommendation to take all of A.

1. **Make `/auth/logout` a POST.** It's currently GET (`backend/src/feature/auth/routing/authRouter.ts:44`-ish) and 204. Logout mutates state; should be POST. Web client is being abandoned so there's no caller to break. *5-min change.*

2. **Drop the redundant `_id` from the PUT body entirely.** Today PUT `/sudoku/:puzzleId` takes a body containing the same id from the URL path. The §3.5.4 rename was just `_id` → `puzzleId`; cleaner is **remove it from the body altogether** since the path already carries it. Validator drops one field. *10-min change.*

3. **Replace the hardcoded worker path default in `backend/src/core/config/index.ts:17`.** Currently:
   ```ts
   puzzleGeneratorWorkerPath: process.env.WORKER_PATH || '/home/saker/workspace/vue-sudoku/backend/src/feature/sudoku/puzzleSolver/puzzleGeneratorInC.ts'
   ```
   That default breaks on every machine that isn't yours. Either make `WORKER_PATH` required, or default to a relative path derived from `__dirname`. *15-min change.*

4. **Fail-fast on `SESSION_SECRET` length.** `feature/auth/config/index.ts` only checks presence. A 32-char minimum (or `crypto.randomBytes`-equivalent) closes the "I'll just put `dev` in the env file" footgun. *5-min change.*

5. **Be explicit about `httpOnly: true` and use `sameSite: 'strict'` (string)** in `sessionHandler.ts`. `express-session` defaults `httpOnly` to true, but stating it documents intent. `sameSite: true` is equivalent to `'strict'`; the string form is clearer and future-proofs against a behavior-flag change. *2-min change.*

6. **Remove the commented-out `POST` / `DELETE` routes in `sudokuRouter.ts`** and the commented `hard` / `impossible` routes in `frontend/src/router/index.ts` (web is being deprecated anyway — but for the backend side: dead code that the agent had to think about while reading). *5-min change.*

### B — Worth doing alongside the port (low-risk, real impact)

Not strictly free but pay back quickly. I'd default to including these unless you push back.

7. **Add a global Express error handler.** Today, thrown errors from route handlers and middleware (Zod validation errors included) bubble to Express's default handler, which sends an HTML page or plain text. The mobile client expects JSON; without this, every error path becomes a parse exception in the app. A 20-line middleware that maps `ZodError → 400`, custom `CustomError` subclasses → their status, everything else → 500, all with JSON bodies. *30-min change.*

8. **Account for inconsistent response shapes.** While adding the error handler, normalize all error responses to `{ message: string }` (the current shape used by some routes) so the mobile client has one schema to parse. *Folds into #7.*

9. **Bound the puzzle-fetch race.** `GET /sudoku/new` is non-idempotent — two concurrent calls consume two puzzles from the pool. The mobile client can dedupe by storing an in-flight promise, but the backend should also wrap the puzzle-claim in a transaction with `FOR UPDATE SKIP LOCKED` (or equivalent in `postgres.js`'s tagged-template style) so it never hands out the same puzzle twice. Worth checking the current SQL — it may already do this. *30 min to verify + fix if needed.*

10. **Surface duplicate-username at registration as a 409.** Today this likely surfaces as a 500 from a unique-violation. Catch the Postgres error code `23505` in `pgUserDataSource.createUser` and throw a `ValidationError` ("username taken"). *15-min change.*

### C — Real improvements, but standalone work (defer)

These are wins but not in the natural path of the mobile port. Mention them so they're not lost; pick them up later.

11. **Stop checking the C binary into git.** `backend/puzzle_generator_app` is 89 KB of compiled ELF. It should be built in the Dockerfile (or fetched from a release) instead. Currently your dev experience also assumes Linux x86-64; any teammate on macOS/ARM is stuck. *1-2 hours to wire the build step.*

12. **Replace the custom `PgSessionStore` with `connect-pg-simple`.** ~100 lines of session-store code you maintain, vs. a well-tested npm package. The custom store has an `setInterval` that runs a DELETE without a `.catch()` — silent failures on session cleanup. *2-3 hours, but pure deletion of code.*

13. **Per-user (or per-IP) rate limit on `/auth/login` and `/auth/token`.** Global 100/10min is good against bots but doesn't slow down a brute-force against one account. `express-rate-limit` accepts a `keyGenerator`. *30-min change.*

14. **Structured logging.** Replace the handful of `console.log` calls (mainly in `sudokuServiceImplementation.ts` and `cellHasError.ts`) with `pino`. Useful the day you actually need to debug something in prod. *1-2 hours.*

15. **Add backend tests.** Vitest is installed; there are zero `.test.ts` files in `backend/src/`. Even just auth-flow tests would catch most regressions. *Open-ended.*

### D — Not worth doing

I considered and rejected:

- **Password reset / account lockout.** Real feature work, not a port-time chore. Mention in a TODO.
- **HSTS / HTTPS redirect.** Belongs in the reverse proxy (nginx), not the Express app.
- **Connection pool tuning.** Premature for current load.
- **Adding DB indexes blindly.** Would want to look at the actual schema and query plans first; not a port-time activity.
- **TypeScript `strict: true` on the backend.** Worth doing; sizeable cleanup; better as its own focused PR.

### E — Game logic / shared model

While reviewing the puzzle code:

16. **Undo/redo lacks tests for the `isParent` grouping logic.** The pop-while-not-parent loop has at least one edge case (queue ending on a non-parent action). The mobile port is rewriting this code in the new flat-cell model — that's the natural time to add tests. *Add to Phase 3 of the mobile work — free.*

17. **`cellHasError.ts` has three commented-out `console.log` lines.** Mobile port copies this file; remove during the copy. *Already in the natural copy/adapt pass.*

18. **`numberWorksInCell` and friends hard-code the size 9.** Not worth fixing — Sudoku is 9×9 by definition — but if you ever want variants, this is the place. *Skip.*

### My recommendation

Take **all of A** (totals about an hour, all in Phase 1's path) and **#7 + #10** from B (the error handler is genuinely important for mobile-client UX; the duplicate-username 409 is a free win once the error handler exists). Defer C and acknowledge D/E.

If you want any of these folded into the plan formally, name the numbers and I'll add them to §5 (backend changes) and §23 (phases) before you sign off.

---

*End of plan. Please review, edit inline where you'd like changes, or answer the open questions in §22 in any form (in this doc, in chat, whatever you prefer). I will not start implementation until you confirm.*
