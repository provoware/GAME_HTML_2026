import type { GameAction } from './actions';
import type { GameState, HistoryEntry, PlayerProfileState } from './game-state';
import {
  isBoundedString,
  isIntegerInRange,
  isIsoTimestamp,
  isRecord,
} from '../validation/runtime-validation';
import { PLAYER_PROFILE_FIELD_LIMITS } from '../../game/profile/player-profile';

const PROFILE_FIELD_LIMITS: Readonly<Record<string, number>> = PLAYER_PROFILE_FIELD_LIMITS;

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
  if (!isRecord(action.payload)) {
    return false;
  }

  const entries = Object.entries(action.payload);

  return (
    entries.length > 0 &&
    entries.every(([field, value]) => {
      const maxLength = PROFILE_FIELD_LIMITS[field];

      return maxLength !== undefined && isBoundedString(value, { maxLength });
    })
  );
}

function isHistoryAddAction(
  action: GameAction,
): action is Extract<GameStateAction, { readonly type: 'history:add' }> {
  const payload = action.payload;

  return (
    isRecord(payload) &&
    isIntegerInRange(payload.turn, 0, Number.MAX_SAFE_INTEGER) &&
    isBoundedString(payload.message, { maxLength: 500 }) &&
    isIsoTimestamp(payload.createdAt)
  );
}
