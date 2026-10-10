import { describe, expect, it, vi } from 'vitest';
import { createSeededRandom } from '../../src/game/rng/seeded-random';
import { chooseWeighted } from '../../src/game/rng/weighted-choice';

const entries = Object.freeze([
  Object.freeze({ value: 'häufig', weight: 9 }),
  Object.freeze({ value: 'selten', weight: 1 }),
]);

describe('GAME-0305 – deterministische gewichtete Auswahl', () => {
  it('liefert bei gleichem Seed dieselben Entscheidungen', () => {
    const first = createSeededRandom(42);
    const second = createSeededRandom(42);
    for (let n = 0; n < 1000; n++) {
      expect(chooseWeighted(entries, first)).toBe(chooseWeighted(entries, second));
    }
  });

  it('wählt Grenzen proportional zum ganzzahligen Gewicht', () => {
    const draw = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(8).mockReturnValueOnce(9);
    const rng = { nextUint32: draw };
    expect(chooseWeighted(entries, rng)).toBe('häufig');
    expect(chooseWeighted(entries, rng)).toBe('häufig');
    expect(chooseWeighted(entries, rng)).toBe('selten');
    expect(draw).toHaveBeenCalledTimes(3);
  });

  it('verwirft Modulo-Restwerte und zieht erneut statt zu verzerren', () => {
    // Für total=10 sind uint32-Werte ab 4294967290 zu verwerfen.
    const draw = vi.fn().mockReturnValueOnce(0xffffffff).mockReturnValueOnce(9);
    expect(chooseWeighted(entries, { nextUint32: draw })).toBe('selten');
    expect(draw).toHaveBeenCalledTimes(2);
  });

  it('prüft alle Gewichte vor dem ersten Zufallszug', () => {
    const draw = vi.fn(() => 0);
    for (const bad of [0, -1, 1.1, Infinity, NaN, 10001]) {
      expect(() => chooseWeighted([{ value: 'x', weight: bad }], { nextUint32: draw })).toThrow(RangeError);
    }
    expect(() => chooseWeighted([], { nextUint32: draw })).toThrow(RangeError);
    expect(draw).not.toHaveBeenCalled();
  });

  it('lehnt ungültige Generatorausgaben ab, statt das Ergebnis zu verfälschen', () => {
    for (const value of [-1, 1.5, NaN, 4294967296]) {
      expect(() => chooseWeighted(entries, { nextUint32: () => value })).toThrow(RangeError);
    }
  });

  it('erhält Eingaben, Identität und Reihenfolge unverändert', () => {
    const first = { id: 'erstes' };
    const second = { id: 'zweites' };
    const options = Object.freeze([
      Object.freeze({ value: first, weight: 1 }),
      Object.freeze({ value: second, weight: 1 }),
    ]);
    expect(chooseWeighted(options, { nextUint32: () => 0 })).toBe(first);
    expect(chooseWeighted(options, { nextUint32: () => 1 })).toBe(second);
    expect(options[0]?.weight).toBe(1);
  });

  it('erlaubt 10.000 Einträge, ohne Überlauf der Gewichtsaddition', () => {
    const options = Array.from({ length: 10000 }, (_, n) => ({ value: n, weight: 10000 }));
    expect(chooseWeighted(options, { nextUint32: () => 99999999 })).toBe(9999);
  });
});
