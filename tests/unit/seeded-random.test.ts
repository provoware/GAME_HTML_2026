import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '../../src/game/rng/seeded-random';

describe('GAME-0301 – deterministischer Zufallsgenerator', () => {
  it('liefert bei identischem Seed dieselbe Folge über unabhängige Instanzen', () => {
    const a = createSeededRandom(42);
    const b = createSeededRandom(42);
    for (let i = 0; i < 1000; i++) expect(a.nextUint32()).toBe(b.nextUint32());
  });

  it('besitzt stabile Referenzwerte zum Erkennen von Algorithmus-Drift', () => {
    const rng = createSeededRandom(42);
    expect(Array.from({ length: 5 }, () => rng.nextUint32())).toEqual([
      2581720956, 1925393290, 3661312704, 2876485805, 750819978,
    ]);
  });

  it('unterstützt Null als Seed ohne degenerierte Nullfolge', () => {
    const rng = createSeededRandom(0);
    expect([rng.nextUint32(), rng.nextUint32(), rng.nextUint32()]).toEqual([
      1144304738, 1416247, 958946056,
    ]);
  });

  it('erzeugt Werte in [0, 1) und endliche 32-Bit-Werte', () => {
    const rng = createSeededRandom(0xffffffff);
    for (let i = 0; i < 1024; i++) {
      const value = rng.nextFloat();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(Number.isInteger(rng.getState())).toBe(true);
  });

  it('weist ungültige Seeds konsequent zurück', () => {
    for (const seed of [-1, 1.1, 4294967296, NaN, Infinity, -Infinity]) {
      expect(() => createSeededRandom(seed)).toThrow(RangeError);
    }
  });

  it('verwaltet unabhängige Zustände ohne globale Kopplung', () => {
    const a = createSeededRandom(123);
    const b = createSeededRandom(123);
    const first = a.nextUint32();
    a.nextUint32();
    expect(b.nextUint32()).toBe(first);
    expect(a.getState()).not.toBe(b.getState());
  });
});
