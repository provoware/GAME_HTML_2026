import type { GameAction } from './actions';
import type { GameState } from './game-state';
import { processGameAction } from './reducer';

export type StateListener<TState> = (state: TState, previousState: TState) => void;
export type StateSelector<TState, TSlice> = (state: TState) => TSlice;
export type StateEquality<TSlice> = (left: TSlice, right: TSlice) => boolean;

export type GameStateStore = {
  readonly getState: () => GameState;
  readonly dispatch: (action: GameAction) => void;
  readonly subscribe: (listener: StateListener<GameState>) => () => void;
  readonly subscribeSelector: <TSlice>(
    selector: StateSelector<GameState, TSlice>,
    listener: StateListener<TSlice>,
    equality?: StateEquality<TSlice>,
  ) => () => void;
};

/**
 * Kapselt den zentralen Spielzustand und benachrichtigt Abos nur nach Änderungen.
 */
export function createGameStateStore(initialState: GameState): GameStateStore {
  let currentState = initialState;
  const listeners = new Set<StateListener<GameState>>();

  function notify(nextState: GameState, previousState: GameState): void {
    for (const listener of listeners) {
      listener(nextState, previousState);
    }
  }

  return {
    getState() {
      return currentState;
    },
    dispatch(action) {
      const previousState = currentState;
      const nextState = processGameAction(previousState, action);

      if (Object.is(nextState, previousState)) {
        return;
      }

      currentState = nextState;
      notify(nextState, previousState);
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    subscribeSelector(selector, listener, equality = Object.is) {
      let selectedState = selector(currentState);

      return this.subscribe((nextState) => {
        const nextSelectedState = selector(nextState);

        if (equality(nextSelectedState, selectedState)) {
          return;
        }

        const previousSelectedState = selectedState;
        selectedState = nextSelectedState;
        listener(nextSelectedState, previousSelectedState);
      });
    },
  };
}
