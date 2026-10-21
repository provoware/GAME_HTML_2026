import { describe, expect, it } from 'vitest';
import { createRandomStreams } from '../../src/game/rng/random-streams';
import { createRandomTrace } from '../../src/game/rng/random-trace';

describe('GAME-0307 – optionales Zufallsprotokoll', () => {
  it('verändert weder die Zufallsfolge noch den Generatorzustand', () => {
    const traced = createRandomTrace(createRandomStreams(42));
    const original = createRandomStreams(42);
    for (let index = 0; index < 100; index++) {
      expect(traced.streams.world.nextUint32()).toBe(original.world.nextUint32());
      expect(traced.streams.event.nextFloat()).toBe(original.event.nextFloat());
      expect(traced.streams.ui.nextUint32()).toBe(original.ui.nextUint32());
    }
    expect(traced.streams.world.getState()).toBe(original.world.getState());
    expect(traced.streams.event.getState()).toBe(original.event.getState());
    expect(traced.streams.ui.getState()).toBe(original.ui.getState());
  });

  it('erfasst Reihenfolge, Strom und Zustand vor und nach dem Zug', () => {
    const sources = createRandomStreams(12);
    const initialState = sources.event.getState();
    const trace = createRandomTrace(sources);
    const value = trace.streams.event.nextFloat();
    trace.streams.world.nextUint32();
    expect(trace.getEntries()).toEqual([
      {
        sequence: 1,
        stream: 'event',
        method: 'nextFloat',
        value,
        stateBefore: initialState,
        stateAfter: sources.event.getState(),
      },
      expect.objectContaining({ sequence: 2, stream: 'world', method: 'nextUint32' }),
    ]);
  });

  it('begrenzt die gespeicherten Einträge und kann sie leeren', () => {
    const trace = createRandomTrace(createRandomStreams(7), 2);
    trace.streams.world.nextUint32();
    trace.streams.world.nextUint32();
    trace.streams.world.nextUint32();
    expect(trace.getEntries().map((entry) => entry.sequence)).toEqual([2, 3]);
    trace.clear();
    expect(trace.getEntries()).toEqual([]);
    trace.streams.ui.nextUint32();
    expect(trace.getEntries()[0]?.sequence).toBe(4);
  });

  it('liefert eine unabhängige Liste unveränderlicher Einträge', () => {
    const trace = createRandomTrace(createRandomStreams(7));
    trace.streams.world.nextUint32();
    const snapshot = trace.getEntries();
    expect(Object.isFrozen(snapshot[0])).toBe(true);
    expect(snapshot).not.toBe(trace.getEntries());
  });

  it('verwirft unzulässige Protokollgrößen', () => {
    for (const limit of [0, -1, 1.5, NaN, Infinity, 10001]) {
      expect(() => createRandomTrace(createRandomStreams(1), limit)).toThrow(RangeError);
    }
  });
});
