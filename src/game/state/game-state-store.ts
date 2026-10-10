import type { GameAction } from '../../core/state/actions';
import { createStateStore, type StateStore } from '../../core/state/state-store';
import type { GameState } from './game-state';
import { processGameAction } from './reducer';

export type GameStateStore = StateStore<GameState, GameAction>;

/** Verbindet den universellen Store mit der Spielregelverarbeitung. */
export function createGameStateStore(initialState: GameState): GameStateStore {
  return createStateStore<GameState, GameAction>(initialState, processGameAction);
}
