export type AppEventMap = {
  readonly 'app:booted': {
    readonly appName: string;
    readonly version: string;
  };
  readonly 'app:error': {
    readonly message: string;
    readonly cause: string;
    readonly recoverable: boolean;
  };
};

export type EventName = keyof AppEventMap;
export type EventHandler<TPayload> = (payload: TPayload) => void;

export type EventBus<TEvents extends Record<string, unknown>> = {
  readonly on: <TName extends keyof TEvents>(
    name: TName,
    handler: EventHandler<TEvents[TName]>,
  ) => () => void;
  readonly emit: <TName extends keyof TEvents>(name: TName, payload: TEvents[TName]) => void;
  readonly clear: () => void;
};

export function createEventBus<TEvents extends Record<string, unknown>>(): EventBus<TEvents> {
  const handlers = new Map<keyof TEvents, Set<EventHandler<TEvents[keyof TEvents]>>>();

  return {
    on(name, handler) {
      const scopedHandlers = handlers.get(name) ?? new Set<EventHandler<TEvents[keyof TEvents]>>();
      scopedHandlers.add(handler as EventHandler<TEvents[keyof TEvents]>);
      handlers.set(name, scopedHandlers);

      return () => {
        scopedHandlers.delete(handler as EventHandler<TEvents[keyof TEvents]>);

        if (scopedHandlers.size === 0) {
          handlers.delete(name);
        }
      };
    },
    emit(name, payload) {
      const scopedHandlers = handlers.get(name);

      if (scopedHandlers === undefined) {
        return;
      }

      for (const handler of scopedHandlers) {
        handler(payload);
      }
    },
    clear() {
      handlers.clear();
    },
  };
}

export function createAppEventBus(): EventBus<AppEventMap> {
  return createEventBus<AppEventMap>();
}
