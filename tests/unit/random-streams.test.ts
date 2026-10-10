import { describe, expect, it } from 'vitest';
import { createRandomStreams } from '../../src/game/rng/random-streams';

describe('GAME-0302 – drei unabhängige Zufallsströme', () => {
  it('erzeugt Welt-, Ereignis- und Oberflächenstrom mit separatem Zustand', () => {
    const streams = createRandomStreams(42);
    expect(new Set([streams.world.getState(), streams.event.getState(), streams.ui.getState()]).size).toBe(3);
    expect(streams.world).not.toBe(streams.event);
    expect(streams.event).not.toBe(streams.ui);
  });

  it('wiederholt jeden der drei Ströme mit demselben Haupt-Seed', () => {
    const first = createRandomStreams(12345);
    const second = createRandomStreams(12345);
    for (let index = 0; index < 1000; index++) {
      expect(first.world.nextUint32()).toBe(second.world.nextUint32());
      expect(first.event.nextUint32()).toBe(second.event.nextUint32());
      expect(first.ui.nextUint32()).toBe(second.ui.nextUint32());
    }
  });

  it('lässt Ereignisse unverändert, wenn die Welt zusätzliche Zufallswerte zieht', () => {
    const a = createRandomStreams(123);
    const b = createRandomStreams(123);
    for (let index = 0; index < 1000; index++) a.world.nextUint32();
    for (let index = 0; index < 100; index++) expect(a.event.nextUint32()).toBe(b.event.nextUint32());
    expect(a.world.getState()).not.toBe(b.world.getState());
  });

  it('lässt die Spielwelt unverändert, wenn UI-Effekte Zufallswerte ziehen', () => {
    const a = createRandomStreams(456);
    const b = createRandomStreams(456);
    for (let index = 0; index < 1000; index++) a.ui.nextFloat();
    for (let index = 0; index < 100; index++) expect(a.world.nextUint32()).toBe(b.world.nextUint32());
  });

  it('lässt UI-Effekte unverändert, wenn Ereignisse Zufallswerte ziehen', () => {
    const a = createRandomStreams(789);
    const b = createRandomStreams(789);
    for (let index = 0; index < 1000; index++) a.event.nextUint32();
    for (let index = 0; index < 100; index++) expect(a.ui.nextUint32()).toBe(b.ui.nextUint32());
  });

  it('lehnt unzulässige Haupt-Seeds ab und akzeptiert beide Grenzen', () => {
    for (const invalid of [-1, 1.5, NaN, Infinity, -Infinity, 4294967296]) {
      expect(() => createRandomStreams(invalid)).toThrow(RangeError);
    }
    expect(createRandomStreams(0).world.nextUint32()).toBeGreaterThanOrEqual(0);
    expect(createRandomStreams(0xffffffff).ui.nextFloat()).toBeLessThan(1);
  });

  it('verändert keine andere Instanz und erzeugt keinen globalen Zustand', () => {
    const a = createRandomStreams(777);
    const b = createRandomStreams(777);
    for (let index = 0; index < 100; index++) a.world.nextUint32();
    const reference = createRandomStreams(777);
    expect(b.world.nextUint32()).toBe(reference.world.nextUint32());
    expect(b.event.nextUint32()).toBe(reference.event.nextUint32());
  });
});
