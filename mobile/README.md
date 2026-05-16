# Sudoku Bay — Mobile (Expo / React Native)

React Native port of the Vue web frontend. It reuses the existing
Express/Postgres backend via **JWT** auth (added alongside the web app's
sessions — see `../BACKEND_CHANGES.md`). No NativeWind; styling is a small
theme + `StyleSheet`.

## Architecture

```
app/                       Expo Router routes (index, about, sudoku/[difficulty])
src/domain/                Pure, framework-agnostic logic (flat 81-cell model) + Vitest
src/services/              HTTP wrapper (Bearer/JWT), sudoku & user services, local persistence
src/store/                 Combined Zustand gameStore (puzzle+timer+logic) + userStore
src/ui/                    Theme-driven primitives (Button, Card, Modal, …)
src/components/             Grid, Cell, Numpad, Controls, overlays, AuthModal
src/theme/                 Tokens + ThemeProvider (light/dark + persisted override)
```

Key model change vs. web: the puzzle is a flat `Cell[]` of 81
(`{ value, idx, candidates }`, `value 0` = empty); no `SudokuPuzzle` class; one
combined game store; DTOs use `puzzleId` (not `_id`).

## Develop

```
pnpm install
# LAN IP so a physical device/emulator can reach the backend:
EXPO_PUBLIC_API_BASE_URL="http://<YOUR_LAN_IP>:3666/api" pnpm start
```

Press `a` / `i` for Android / iOS, or scan the QR with Expo Go. Default base
URL (no env) is `http://localhost:3666/api`.

## Checks

```
pnpm type-check   # tsc --noEmit
pnpm lint         # expo lint
pnpm test         # vitest — pure domain logic (cell/grid/rules/serialization/gameLogic)
```

A production Metro bundle (`npx expo export --platform android`) also succeeds,
verifying the full dependency graph resolves.

## Manual end-to-end checklist

Requires the backend running with a reachable DB and the LAN IP configured.
The static checks above all pass in CI; the following needs a device/emulator:

- [ ] App launches; Home shows difficulty options.
- [ ] Start Beginner/Easy/Medium → grid loads, timer runs.
- [ ] Tap cell → select; numpad places value; peers' candidates auto-clear.
- [ ] Pencil toggle adds/removes candidates; eraser clears a cell.
- [ ] Undo/redo step through moves (incl. peer-candidate restore).
- [ ] Auto-fill candidates on/off.
- [ ] Conflicts render red; completing a valid grid shows the completion modal.
- [ ] Pause overlay shows time + progress; resume continues.
- [ ] Background the app → return: timer resumes, no backgrounded time counted.
- [ ] Register, then log out / log in (JWT persists across app restarts).
- [ ] While authed: progress autosaves (10s + on leave/background).
- [ ] Resume Game from Home loads the saved puzzle.
- [ ] User stats fetch succeeds (`/users/:id/stats`).
- [ ] Dark-mode toggle persists across restarts.
- [ ] About screen renders the bundled README.
```
