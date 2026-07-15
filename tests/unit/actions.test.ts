import { describe, expect, it } from 'vitest';

import { createActionDispatcher, type GameAction } from '../../src/core/state/actions';

type TestAction =
  | {
      readonly type: 'profile:set-name';
      readonly payload: {
        readonly name: string;
      };
    }
  | {
      readonly type: 'turn:advance';
      readonly meta: {
        readonly source: string;
      };
    };

describe('createActionDispatcher', () => {
  it('verteilt typisierte Actions in Registrierungsreihenfolge', () => {
    const dispatcher = createActionDispatcher<TestAction>();
    const receivedTypes: string[] = [];

    dispatcher.subscribe((action) => receivedTypes.push(`first:${action.type}`));
    dispatcher.subscribe((action) => receivedTypes.push(`second:${action.type}`));

    dispatcher.dispatch({ type: 'profile:set-name', payload: { name: 'Poppi' } });

    expect(receivedTypes).toEqual(['first:profile:set-name', 'second:profile:set-name']);
  });

  it('entfernt Handler über die Rückgabefunktion', () => {
    const dispatcher = createActionDispatcher<GameAction>();
    const receivedTypes: string[] = [];
    const unsubscribe = dispatcher.subscribe((action) => receivedTypes.push(action.type));

    unsubscribe();
    dispatcher.dispatch({ type: 'turn:advance' });

    expect(receivedTypes).toEqual([]);
  });

  it('kann alle registrierten Handler leeren', () => {
    const dispatcher = createActionDispatcher<GameAction>();
    const receivedTypes: string[] = [];

    dispatcher.subscribe((action) => receivedTypes.push(action.type));
    dispatcher.clear();
    dispatcher.dispatch({ type: 'turn:advance' });

    expect(receivedTypes).toEqual([]);
  });
});
