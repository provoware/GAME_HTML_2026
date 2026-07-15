import type { GameAction } from './actions';
import type { GameState, HistoryEntry, PlayerProfileState } from './game-state';

export type GameStateAction =
  | {
      readonly type: 'game:start';
    }
  | {
      readonly type: 'profile:update';
      readonly payload: Partial<PlayerProfileState>;
    }
  | {
      readonly type: 'history:add';
      readonly payload: HistoryEntry;
    };

/**
 * Verarbeitet typisierte Game-State-Actions ohne direkte Mutation.
 */
export function reduceGameState(state: GameState, action: GameStateAction): GameState {
  switch (action.type) {
    case 'game:start':
      return {
        ...state,
        status: 'running',
      };
    case 'profile:update':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
      };
    case 'history:add':
      return {
        ...state,
        history: [...state.history, action.payload],
      };
  }
}

export function processGameAction(state: GameState, action: GameAction): GameState {
  if (isGameStateAction(action)) {
    return reduceGameState(state, action);
  }

  return state;
}

function isGameStateAction(action: GameAction): action is GameStateAction {
  switch (action.type) {
    case 'game:start':
      return true;
    case 'profile:update':
      return isProfileUpdateAction(action);
    case 'history:add':
      return isHistoryAddAction(action);
    default:
      return false;
  }
}

function isProfileUpdateAction(
  action: GameAction,
): action is Extract<GameStateAction, { readonly type: 'profile:update' }> {
  return isRecord(action.payload);
}

function isHistoryAddAction(
  action: GameAction,
): action is Extract<GameStateAction, { readonly type: 'history:add' }> {
  const payload = action.payload;

  return (
    isRecord(payload) &&
    typeof payload.turn === 'number' &&
    typeof payload.message === 'string' &&
    typeof payload.createdAt === 'string'
  );
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
