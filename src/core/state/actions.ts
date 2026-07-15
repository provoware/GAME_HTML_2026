export type GameAction = {
  readonly type: string;
  readonly payload?: unknown;
  readonly meta?: {
    readonly source?: string;
    readonly timestamp?: number;
  };
};

export type ActionHandler<TAction extends GameAction> = (action: TAction) => void;

export type ActionDispatcher<TAction extends GameAction = GameAction> = {
  readonly dispatch: (action: TAction) => void;
  readonly subscribe: (handler: ActionHandler<TAction>) => () => void;
  readonly clear: () => void;
};

export function createActionDispatcher<
  TAction extends GameAction = GameAction,
>(): ActionDispatcher<TAction> {
  const handlers = new Set<ActionHandler<TAction>>();

  return {
    dispatch(action) {
      for (const handler of handlers) {
        handler(action);
      }
    },
    subscribe(handler) {
      handlers.add(handler);

      return () => {
        handlers.delete(handler);
      };
    },
    clear() {
      handlers.clear();
    },
  };
}
