import { describe, expect, it } from 'vitest';
import { createStateStore } from '../../src/core/state/state-store';

type Increment = { readonly type: 'increment'; readonly payload: number };

describe('spielunabhängiger Store', () => {
  it('führt einen generischen Reducer aus und meldet nur tatsächliche Änderungen', () => {
    const store = createStateStore<number, Increment>(0, (state, action) => state + action.payload);
    const updates: Array<[number, number]> = [];
    const unsubscribe = store.subscribe((next, previous) => updates.push([previous, next]));
    store.dispatch({ type: 'increment', payload: 2 });
    store.dispatch({ type: 'increment', payload: 0 });
    unsubscribe();
    store.dispatch({ type: 'increment', payload: 3 });

    expect(store.getState()).toBe(5);
    expect(updates).toEqual([[0, 2]]);
  });
});
