import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useGameStore } from '@/src/store/gameStore';

/**
 * Bridges React Native AppState to the game store (plan §2.6 / §7.9):
 * background/inactive → freeze timer + hard-save; active → resume if it was
 * running. This replaces the web app's keepalive / onBeforeRouteLeave save.
 */
export function useAppStateSync() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appState.current;
      appState.current = next;

      const game = useGameStore.getState();
      if (
        (prev === 'active' && (next === 'background' || next === 'inactive'))
      ) {
        game.appBackground();
      } else if (
        next === 'active' &&
        (prev === 'background' || prev === 'inactive')
      ) {
        game.appForeground();
      }
    });
    return () => sub.remove();
  }, []);
}
