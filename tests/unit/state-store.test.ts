import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/core/state/game-state';
import { createGameStateStore } from '../../src/core/state/state-store';

describe('createGameStateStore', () => {
  it('stellt den aktuellen Zustand bereit und verarbeitet Actions unveränderlich', () => {
    const initialState = createInitialGameState();
    const store = createGameStateStore(initialState);

    store.dispatch({ type: 'game:start' });

    expect(store.getState().status).toBe('running');
    expect(initialState.status).toBe('setup');
  });

  it('benachrichtigt selektive Abos nur bei geändertem Ausschnitt', () => {
    const store = createGameStateStore(createInitialGameState());
    const receivedNames: string[] = [];

    store.subscribeSelector(
      (state) => state.profile.playerName,
      (playerName) => receivedNames.push(playerName),
    );

    store.dispatch({ type: 'game:start' });
    store.dispatch({ type: 'profile:update', payload: { nickname: 'Knister' } });
    store.dispatch({ type: 'profile:update', payload: { playerName: 'Etna Testen' } });

    expect(receivedNames).toEqual(['Etna Testen']);
  });

  it('entfernt selektive Abos über die Rückgabefunktion', () => {
    const store = createGameStateStore(createInitialGameState());
    const receivedNames: string[] = [];
    const unsubscribe = store.subscribeSelector(
      (state) => state.profile.playerName,
      (playerName) => receivedNames.push(playerName),
    );

    unsubscribe();
    store.dispatch({ type: 'profile:update', payload: { playerName: 'Moni Testen' } });

    expect(receivedNames).toEqual([]);
  });

  it('unterstützt eigene Gleichheitsregeln für abgeleitete Ausschnitte', () => {
    const store = createGameStateStore(createInitialGameState());
    const receivedProfiles: string[] = [];

    store.subscribeSelector(
      (state) => ({ name: state.profile.playerName }),
      (profile) => receivedProfiles.push(profile.name),
      (left, right) => left.name === right.name,
    );

    store.dispatch({ type: 'profile:update', payload: { secretWord: 'neon' } });
    store.dispatch({ type: 'profile:update', payload: { playerName: 'Kordula Testen' } });

    expect(receivedProfiles).toEqual(['Kordula Testen']);
  });
});
