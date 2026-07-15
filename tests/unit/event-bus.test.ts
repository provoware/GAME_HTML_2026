import { describe, expect, it } from 'vitest';

import { createEventBus } from '../../src/core/events/event-bus';

type TestEvents = {
  readonly ping: { readonly value: number };
};

describe('createEventBus', () => {
  it('verteilt typisierte Ereignisse an registrierte Handler', () => {
    const eventBus = createEventBus<TestEvents>();
    const values: number[] = [];

    eventBus.on('ping', (payload) => values.push(payload.value));
    eventBus.emit('ping', { value: 86 });

    expect(values).toEqual([86]);
  });

  it('entfernt Handler über die Rückgabefunktion', () => {
    const eventBus = createEventBus<TestEvents>();
    const values: number[] = [];
    const unsubscribe = eventBus.on('ping', (payload) => values.push(payload.value));

    unsubscribe();
    eventBus.emit('ping', { value: 1 });

    expect(values).toEqual([]);
  });
});
