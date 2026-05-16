import { create } from 'zustand';

import { UserStats } from '@/src/domain';
import * as userService from '@/src/services/userService';

import { useGameStore } from './gameStore';

interface UserStore {
  id?: string;
  username?: string;
  displayName?: string;
  imageUrl?: string;
  role?: string;
  currentPuzzleId?: string;
  userStats?: UserStats;
  userLoading: boolean;
  error?: string;

  isAuthenticated: () => boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  getSelf: () => Promise<void>;
  getUserStats: () => Promise<void>;
  reset: () => void;
}

/** After auth, enable server autosave and flush the in-progress puzzle. */
async function onAuthenticated() {
  const game = useGameStore.getState();
  game.setAutosaveEnabled(true);
  if (game.puzzleId) {
    await game.saveGameState();
  }
}

export const useUserStore = create<UserStore>((set, get) => ({
  userLoading: false,

  isAuthenticated: () => !!get().id,

  login: async (username, password) => {
    set({ userLoading: true, error: undefined });
    const res = await userService.login(username, password);
    if (!res.success || !res.body) {
      set({ error: res.message ?? 'Invalid username or password' });
    } else {
      set({
        id: res.body.id,
        username: res.body.username,
        displayName: res.body.displayName,
        imageUrl: res.body.imageUrl,
        role: res.body.role,
        currentPuzzleId: res.body.currentPuzzleId,
      });
      await onAuthenticated();
      const pid = useGameStore.getState().puzzleId;
      if (pid) set({ currentPuzzleId: pid });
    }
    set({ userLoading: false });
  },

  register: async (username, password, displayName) => {
    set({ userLoading: true, error: undefined });
    const res = await userService.register(username, password, displayName);
    if (!res.success || !res.body) {
      set({ error: res.message ?? 'Registration failed' });
    } else {
      set({
        id: res.body.id,
        username: res.body.username,
        displayName: res.body.displayName ?? displayName,
        role: res.body.role,
      });
      await onAuthenticated();
    }
    set({ userLoading: false });
  },

  logout: async () => {
    set({ userLoading: true });
    await userService.logout();
    useGameStore.getState().setAutosaveEnabled(false);
    get().reset();
  },

  getSelf: async () => {
    set({ userLoading: true });
    const res = await userService.checkSession();
    if (res.success && res.body) {
      set({
        id: res.body.id,
        username: res.body.username,
        displayName: res.body.displayName,
        imageUrl: res.body.imageUrl,
        role: res.body.role,
        currentPuzzleId: res.body.currentPuzzleId,
      });
      useGameStore.getState().setAutosaveEnabled(true);
    }
    set({ userLoading: false });
  },

  getUserStats: async () => {
    const userId = get().id;
    if (!userId) return;
    set({ userLoading: true });
    const res = await userService.getUserStats(userId);
    if (!res.success) {
      set({ error: res.message });
    } else {
      set({ userStats: res.body });
    }
    set({ userLoading: false });
  },

  reset: () =>
    set({
      id: undefined,
      username: undefined,
      displayName: undefined,
      imageUrl: undefined,
      role: undefined,
      currentPuzzleId: undefined,
      userStats: undefined,
      error: undefined,
      userLoading: false,
    }),
}));
