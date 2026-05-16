# React Native (Expo) Migration Plan — Rev 2

> **Status:** REVISED per feedback — for your review before implementation begins.
> **Goal:** Build an Expo React Native app that reuses the existing Express/Postgres backend.
> The frontend is currently **Vue 3**, so the UI layer is a **rewrite in React Native**.
> Non-UI logic is ported **and refactored** to a new, simpler data model (see §2.10).
> **Constraints:**
> - Do **not** use NativeWind. Styling uses React Native `StyleSheet` + a small theme system.
> - Backend **will be modified** (JWT auth + DTO change). **Every backend change must be
>   documented in `./BACKEND_CHANGES.md`** (created and maintained throughout implementation).

---

## 1. Current Architecture Summary

**Frontend (`/frontend`)** — Vue 3 + Vite SPA:
- State: Pinia — `sudokuStore` (puzzle/game logic), `gameStore` (timer), `userStore` (auth/profile/stats).
- Routing: `vue-router` — `/`, `/about`, `/sudoku/:difficulty` (beginner|easy|medium).
- Styling: Tailwind v4 + shadcn-vue / `reka-ui` (`components/ui/*`), `@iconify/vue`, dark mode via `@vueuse/core`.
- Networking: `fetch` + `credentials: 'include'` (cookie session), base URL via `import.meta.env.PROD`.
- Local persistence: `localStorage` (`localGameState`, `elapsedSeconds`).
- Notifications: `vue-sonner`. About page renders README via `markdown-it`.

**Backend (`/backend`)** — Express + Postgres:
- Auth: `express-session` (cookie `sudoku`, Postgres session store), `req.session.user`.
- CORS: `credentials: true`, restricted `origin`.
- API used: `GET /api/sudoku/new?difficulty=`, `GET /api/sudoku/:id`, `PUT /api/sudoku/:id`,
  `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/logout`,
  `GET /api/users/me`, `GET /api/users/:id/stats`.

### Logic to port (with refactor to new model — see §2.10)
`stores/models/*`, `utils/buildPuzzle|cellHasError|numberWorksInCell|calcBlockNumber`,
`serialization.ts`, service request/response logic, existing Vitest tests.
> Note: with the new flat-array model and removal of the `SudokuPuzzle` class, these are
> **rewritten against the new model**, not copied verbatim. The algorithms (block/row/col
> checks, candidate logic, bitmask serialization) carry over conceptually.

### Must be rewritten (Vue → React Native)
All `.vue` files (App, views, components), the entire `reka-ui` `components/ui/*` library,
Pinia stores → Zustand, `vue-router` → Expo Router.

---

## 2. Decisions (resolved per feedback)

### 2.1 Auth — **JWT (backend will be modified)** ✅
Replace the cookie/session model with **JWT** for the mobile client (better long-term fit).
- Backend: `login`/`register` issue a signed JWT (access token); protected routes verify
  `Authorization: Bearer <token>` instead of `req.session.user`. `GET /auth/logout` becomes
  a client-side token discard (and/or optional server no-op/blacklist — kept minimal).
- Mobile: store the JWT in `expo-secure-store`; a shared fetch wrapper attaches the
  `Authorization` header; no cookies, so `credentials: 'include'` is dropped.
- All backend edits recorded in `./BACKEND_CHANGES.md` (rationale + endpoint/contract diffs).
- **Resolved:** JWT is added **alongside** the existing `express-session` auth. Session
  code paths are left intact so the existing Vue web app keeps working unchanged.

### 2.2 API base URL — `app.config.ts` + `expo-constants`; dev = LAN IP, prod = `https://sudoku.aker-bergeron.dev/api`. ✅
### 2.3 Local persistence — refactor sync helpers to **async `AsyncStorage`**; JWT in **SecureStore**. ✅
### 2.4 Styling — small `theme.ts` + RN `StyleSheet`; recreate only UI primitives actually used; dark mode via `useColorScheme` + manual override. ✅
### 2.5 Navigation — **Expo Router** (`index`, `about`, `sudoku/[difficulty]`). ✅
### 2.6 Timer/lifecycle — `setInterval` in game store + `AppState` pause/resume + force-save on background; keep 10s + debounced action autosave. ✅
### 2.7 Input — drop physical-keyboard handlers; on-screen Numpad + controls + tap-select. ✅
### 2.8 Library swaps — `react-native-toast-message`, `@expo/vector-icons`, `react-native-markdown-display`, RN `Modal`, **Zustand**, Expo Router, keep `lodash`. ✅
### 2.9 About README — bundle as a local asset/string, render with `react-native-markdown-display`. ✅

### 2.10 Data model & architecture optimizations (NEW — per feedback) ⭐
1. **No `SudokuPuzzle` class.** Puzzle data lives directly in the game store as plain state
   (cells + original cells + difficulty + metadata). Class methods become pure helper
   functions in `domain/` (`getRow`, `getColumn`, `getBlock` over a flat array). With the
   flat `cells[]` array, a cell is addressed directly by `idx` (`cells[y*9+x]`), so a
   `getCellAt(x,y)` helper is **unnecessary and will not be created**.
2. **Flat 81-cell array.** Replace `Cell[][]` (`rows`) with `cells: Cell[]` of length 81.
   New cell shape:
   ```ts
   interface Cell { value: number; idx: number; candidates: number[] }
   ```
   - `idx` is 0–80; `x = idx % 9`, `y = Math.floor(idx / 9)`; `idx = y*9 + x`.
   - `value`: **`0` = empty** (matches the wire format — the `cells` string already uses `'0'`).
   - The old `cellId` (`C{x}{y}`) and `type` (`prefilled|edited|blank`) fields are **removed**.
     Prefilled/edited/blank is **derived for rendering only**: a cell is *prefilled* if the
     corresponding `originalCells[idx].value !== 0`; *edited* if current ≠ original and not
     prefilled; else *blank*. This derivation drives bold prefilled rendering and
     edit-locking. **Serialization does not encode `type` at all** (see below).
3. **Single combined `gameStore`.** Merge `sudokuStore` + `gameStore` into one Zustand
   `gameStore` holding puzzle state, selection, undo/redo, timer, and all game logic.
   `userStore` stays separate (auth/profile/stats).
4. **DTO rename `_id` → `puzzleId`.** All puzzle DTOs (`NewPuzzleDto`, `UserPuzzleDto`,
   `UpdateUserPuzzleDto`) use `puzzleId` instead of `_id`. This is a **backend response/request
   contract change** → implemented backend-side and documented in `./BACKEND_CHANGES.md`;
   mobile services consume `puzzleId` directly.

> Impact: `serialization.ts` and the grid/error/candidate utils are **rewritten** for the
> flat array + new `Cell` (idx-addressed). The old cell bitmask reserved 2 bits for
> `type` — these **type bits are removed entirely** from the encode/decode logic; the
> bitmask now carries only `idx`, `value`, and the candidate mask. Action serialization
> uses `idx` directly instead of parsing `cellId`. The Vitest suites are rewritten
> against the new model.

---

## 3. Backend Changes (documented in `./BACKEND_CHANGES.md`)

`./BACKEND_CHANGES.md` is created at the start of backend work and updated with **every**
change (what, why, endpoint/contract before→after, migration notes). Planned changes:

1. **JWT auth (§2.1):**
   - **Reuse existing scaffolding:** the backend already depends on `jose` and has
     `feature/users/utils/parseAuthHeader.ts` (parses `Bearer`, decodes JWT). Build signing
     + a *verifying* middleware on top of this rather than from scratch.
   - Add token signing (new `JWT_SECRET` env, or reuse `SESSION_SECRET`) + verify middleware.
   - `POST /auth/login`, `POST /auth/register` → return `{ token, user }`.
   - **Unify identity resolution:** add one middleware that populates `req.user` from
     **either** an active session **or** a valid `Bearer` JWT, then refactor
     `requireLoggedin`, `requireAdmin`, `requireSelfOrAdmin` (they currently read
     `req.session.user` directly) to check the resolved `req.user`. This is what makes "JWT
     alongside sessions" clean and keeps the web app working unchanged. `/sudoku/new` keeps
     optional identity (`requestedBy`) via the same resolver.
   - Protected routes (`/sudoku/:id`, `PUT /sudoku/:id`, `/users/me`, `/users/:id`,
     `/users/:id/stats`) accept `Authorization: Bearer`.
   - `/auth/logout` → minimal (client discards token); document chosen behavior.
2. **DTO rename `_id` → `puzzleId` (§2.10.4):** touches the `SudokuPuzzle`, `UpdatePuzzle`,
   `UserPuzzleDto` interfaces, `sudokuServiceImplementation` (`_id: sqlUserPuzzle.puzzle_id`
   → `puzzleId`) and `updateUserPuzzle` (`puzzle._id`). **Purely an API/DTO-layer rename —
   no DB schema/column changes** (DB already uses `puzzle_id`; only the JSON field changes).
3. **Fix `/users/:id/stats` double-encoded response (latent bug):** route currently does
   `res.json(JSON.stringify(stats))`, sending a JSON *string* instead of an object. Correct
   to `res.json(stats)` and consume a normal object in the mobile service. Documented as a
   behavior fix; verify the web app's `getUserStats` (which currently copes with the broken
   shape) still works.
4. **CORS:** allow the native client and `Authorization` header for JWT requests; keep the
   existing `credentials`/cookie + env-driven origins intact for the web app (JWT is
   additive, §2.1). No `Set-Cookie`/`exposedHeaders` work needed (JWT, not cookies).
5. No changes to puzzle generation, DB schema, or core services. Action bitmasks are stored
   opaquely by the backend, so removing the serialization `type` bits (§2.10) needs **no**
   backend change. The server completion check (`solved_cells === cells`) relies on the
   81-char cells string with `'0'` = empty — the new flat model serializes to exactly this
   format (value `0` = empty), so it stays compatible.

> If an unforeseen change would significantly alter backend behavior beyond the above,
> I will stop and check with you before proceeding.

---

## 4. Project Structure — sibling `/mobile` ✅

```
/mobile
  app/                        # Expo Router
    _layout.tsx
    index.tsx                 # Home
    about.tsx
    sudoku/[difficulty].tsx
  src/
    domain/                   # NEW model: pure logic, no classes
      cell.ts                 # Cell type + idx<->x/y helpers
      grid.ts                 # getRow/getColumn/getBlock over flat array (no getCellAt)
      rules.ts                # cellHasError, numberWorksInCell, calcBlockNum (flat-array)
      serialization.ts        # rewritten for idx-based cells, NO type bits
      models.ts               # Difficulty, Action, DTOs (puzzleId)
    services/                 # fetch wrapper (JWT/SecureStore), sudoku & user services
    store/                    # gameStore (combined), userStore  (Zustand)
    components/               # SudokuGrid, Cell, Numpad, Controls, NavHeader, …
    ui/                       # Button, Card, Modal, Input, Checkbox/Switch, Toggle
    theme/                    # colors, light/dark, spacing
  app.config.ts
  package.json
/BACKEND_CHANGES.md           # created during Phase 2; maintained continuously
```
The Vue `frontend/` stays intact for reference. Domain code is reimplemented (new model),
not copied.

---

## 5. Implementation Phases

**Phase 0 — Setup:** scaffold Expo (TS, Expo Router), deps, theme, `app.config.ts`,
AsyncStorage + SecureStore.

**Phase 1 — Domain (new model):** implement `Cell`/idx helpers, flat-array `grid.ts`,
`rules.ts`, rewritten `serialization.ts`; new Vitest suites green.

**Phase 2 — Backend (JWT + DTO):** create `./BACKEND_CHANGES.md`; add JWT issue/verify,
rename `_id`→`puzzleId`, adjust CORS; verify web app still works; document every change.

**Phase 3 — Services & combined store:** fetch wrapper (Bearer token from SecureStore) +
env base URL; async local persistence; single Zustand `gameStore` (puzzle+timer+logic) +
`userStore`.

**Phase 4 — UI primitives & theme:** minimal `ui/` set, light/dark theme, accent, toggle.

**Phase 5 — Screens & components:** Home (difficulty + Resume), About (bundled README),
Sudoku (`SudokuGrid`+`Cell` tap/highlight/error/pencil, `Numpad`, `Controls`
undo/redo/pencil/erase/auto-candidate), timer/pause, completion modal, loading/error,
nav header/menu.

**Phase 6 — Lifecycle & polish:** `AppState` pause/resume + autosave; debounced/10s save;
resume-saved-game; toasts.

**Phase 7 — End-to-end & docs:** device/emulator E2E vs backend (login→play→save→resume→
stats, token persists across restarts); unit tests; update `Installation.md`/README with
mobile dev instructions; finalize `./BACKEND_CHANGES.md`.

## 6. Testing Strategy
- **Unit:** new Vitest suites for flat-array grid/rules/serialization and store reducers.
- **Integration:** mocked fetch (JWT attach, save/load round-trip with `puzzleId`).
- **Manual E2E:** device + emulator — new puzzle, solve, undo/redo, pencil, auto-candidates,
  pause, autosave, login/register/logout, resume, stats, dark mode, background/foreground.

## 7. Additional Optimizations & Improvements (2nd repo pass)

Discovered on a deeper read; folded into the relevant phases. Each preserves feature parity.

### Performance (matters more on mobile)
1. **Memoized conflict/error set.** `cellHasError` is currently called per-cell on every
   render in `SudokuPuzzle.vue`, and `isPuzzleSolved` runs 81×O(27) on every change. Replace
   with a single derived "conflicts" set recomputed only when `cells` change (Zustand
   selector / `useMemo`). `isPuzzleSolved` = all 81 filled **and** conflicts empty.
2. **Precomputed peer indices.** `setCell`'s candidate auto-removal recomputes row/col/block
   peers each call. With the fixed 9×9 flat array, precompute a static `PEERS[idx] →
   number[20]` table once and reuse it in `setCell`, `cellHasError`, `numberWorksInCell`
   (also collapses the near-duplicate logic in `cellHasError`/`numberWorksInCell` into one
   helper).
3. **Debounced local persistence.** Web calls `saveGameStateLocal()` on *every* `setCell`/
   undo/redo/reset (full-state `JSON.stringify`). On RN/AsyncStorage that's expensive and
   async — debounce local writes (~300–500ms) plus the existing 10s server autosave.
4. **Timestamp-based timer.** Web increments a counter every second *and* writes
   `elapsedSeconds` to storage every tick; a backgrounded RN app freezes the interval and
   under-counts. Track `startedAt`/accumulated-paused instead, derive elapsed from
   `Date.now()`, and persist only periodically + on `AppState` background. More accurate and
   far fewer writes.

### Correctness / cleanup (carry into the rewrite)
5. **Fix `numberInPuzzleCount` (Numpad).** Current logic `break`s after the first match per
   row, so it counts *rows containing* a digit, not occurrences — the "digit fully placed →
   disable" behavior is wrong. Recompute as a true per-digit count over the 81 cells.
6. **Fix `userService.register` double parse.** `await JSON.parse(await res.text())` (and
   `await` on a non-promise) → use `res.json()`.
7. **Auth bootstrap as an effect, not import side-effect.** `App.vue` calls
   `userStore.getSelf()` at module load. In RN do an explicit bootstrap: read JWT from
   SecureStore → `/users/me` → hydrate, inside a root effect.
8. **Single source of truth for difficulty.** `gameStore.difficulty` exists but is unused
   (the real value lives on `puzzle.options.difficulty`). The combined store keeps **one**
   `difficulty` field.
9. **Consolidate save triggers.** `Standard.vue` has three overlapping save paths
   (debounced-on-actions, 10s interval, route-leave). Collapse into one save controller in
   the combined store (debounced action save + interval + `AppState` background save).
10. **Move shared constants out of navigation.** `PUZZLE_DIFFICULTY_ROUTES` lives in the
    Vue router; relocate the difficulty list to `domain/` so store/services use it without
    importing the navigation layer.
11. **Tighten types.** Replace the many `as`/`!` casts in services/stores with a
    discriminated `ServiceResult` so success/body are correctly narrowed.
12. **Existing tests are partly stale.** `puzzle.test.ts` has wrong assertions (e.g.
    `expect(puzzle.options).toBe('medium')` vs. an options object). Treat the new model's
    rewritten suites as the spec; don't port broken assertions.

### Mobile UX (feature parity, adapted)
13. **`ControlInstructions` content rewrite.** It documents keyboard controls
    (1–9, arrows, Ctrl+Z…) that don't exist on touch. Repurpose as touch instructions
    (tap to select, Numpad, pencil/erase/undo buttons) or fold into a brief help sheet.
14. **Accessibility.** Add RN accessibility labels/roles to cells and control buttons
    (grid cell value/selection state, button purposes) — a low-cost parity-plus.

## 8. Resolved Decisions
1. **JWT scope:** added **alongside** sessions — the Vue web app keeps working unchanged.
2. **Empty cell value:** `0`.
3. **Scope:** **full feature parity** with the web app.
4. **Platforms:** **iOS + Android** both. Tablet-specific layouts deferred (later phase).
5. **DTO rename:** **no DB changes** — `_id`→`puzzleId` is purely an API/DTO-layer rename.

## 9. Out of Scope / Risks
- No puzzle-generation or DB-schema changes.
- "Hard/Impossible" remain disabled (as in web).
- Tablet-optimized layouts, App/Play Store submission, push, deep linking — excluded.
- Risk: device cannot reach dev backend — mitigated via LAN IP / Expo tunnel docs.
- Risk: JWT change affecting the existing web app — mitigated by adding JWT *alongside*
  sessions (web paths untouched) and documented in `./BACKEND_CHANGES.md`.
```
