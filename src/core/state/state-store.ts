import type { GameAction } from './actions';

export type StateListener<TState> = (state: TState, previousState: TState) => void;
export type StateSelector<TState, TSlice> = (state: TState) => TSlice;
export type StateEquality<TSlice> = (left: TSlice, right: TSlice) => boolean;

export type StateStore<TState, TAction extends GameAction> = {
  readonly getState: () => TState;
  readonly dispatch: (action: TAction) => void;
  readonly subscribe: (listener: StateListener<TState>) => () => void;
  readonly subscribeSelector: <TSlice>(
    selector: StateSelector<TState, TSlice>,
    listener: StateListener<TSlice>,
    equality?: StateEquality<TSlice>,
  ) => () => void;
};

/** Universelle Zustandsverwaltung: Der Aufrufer liefert den fachlichen Reducer. */
export function createStateStore<TState, TAction extends GameAction>(
  initialState: TState,
  reduce: (state: TState, action: TAction) => TState,
): StateStore<TState, TAction> {
  let currentState = initialState;
  const listeners = new Set<StateListener<TState>>();

  const subscribe: StateStore<TState, TAction>['subscribe'] = (listener) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };

  return {
    getState() { return currentState; },
    dispatch(action) {
      const previousState = currentState;
      const nextState = reduce(previousState, action);
      if (Object.is(nextState, previousState)) return;
      currentState = nextState;
      for (const listener of listeners) listener(nextState, previousState);
    },
    subscribe,
    subscribeSelector(selector, listener, equality = Object.is) {
      let selectedState = selector(currentState);
      return subscribe((nextState) => {
        const nextSelectedState = selector(nextState);
        if (equality(nextSelectedState, selectedState)) return;
        const previousSelectedState = selectedState;
        selectedState = nextSelectedState;
        listener(nextSelectedState, previousSelectedState);
      });
    },
  };
}
