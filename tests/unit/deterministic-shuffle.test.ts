import { describe, expect, it, vi } from 'vitest';
import { createRandomStreams } from '../../src/game/rng/random-streams';
import { createSeededRandom } from '../../src/game/rng/seeded-random';
import { shuffleDeterministic } from '../../src/game/rng/deterministic-shuffle';

describe('GAME-0306 – deterministisches, unverzerrtes Mischen', () => {
  it('liefert mit demselben Seed denselben stabilen Referenzvektor', () => {
    const values = Array.from({ length: 10 }, (_, index) => index);
    const expected = [1, 3, 9, 5, 2, 8, 4, 0, 7, 6];
    expect(shuffleDeterministic(values, createSeededRandom(42))).toEqual(expected);
    expect(shuffleDeterministic(values, createSeededRandom(42))).toEqual(expected);
    expect(shuffleDeterministic(values, createSeededRandom(0))).toEqual([
      4, 1, 2, 3, 6, 9, 5, 0, 7, 8,
    ]);
  });

  it('behält Werte, Duplikate und Objektidentitäten ohne Eingabemutation', () => {
    const a = Object.freeze({ id: 'a' });
    const b = Object.freeze({ id: 'b' });
    const values = Object.freeze([a, b, a, b, a]);
    const shuffled = shuffleDeterministic(values, createSeededRandom(99));
    expect(shuffled).not.toBe(values);
    expect(shuffled).toHaveLength(values.length);
    expect(shuffled.filter((value) => value === a)).toHaveLength(3);
    expect(shuffled.filter((value) => value === b)).toHaveLength(2);
    expect(values).toEqual([a, b, a, b, a]);
  });

  it('mischt ohne modulo-bedingte Verzerrung und verwirft den Grenzwert', () => {
    // Bei drei Einträgen wird 0xffffffff verworfen; 2 und 1 sind gültig.
    const draw = vi.fn().mockReturnValueOnce(0xffffffff).mockReturnValueOnce(2).mockReturnValueOnce(1);
    expect(shuffleDeterministic(['a', 'b', 'c'], { nextUint32: draw })).toEqual([
      'a', 'b', 'c',
    ]);
    expect(draw).toHaveBeenCalledTimes(3);
  });

  it('verwendet genau einen akzeptierten Zufallswert pro Vertauschung', () => {
    const draw = vi.fn(() => 0);
    expect(shuffleDeterministic([1, 2, 3, 4], { nextUint32: draw })).toEqual([
      2, 3, 4, 1,
    ]);
    expect(draw).toHaveBeenCalledTimes(3);
  });

  it('erzeugt für leere und einelementige Arrays neue Kopien ohne Zufallszug', () => {
    const draw = vi.fn(() => 0);
    const empty: number[] = [];
    const single = Object.freeze([123]);
    expect(shuffleDeterministic(empty, { nextUint32: draw })).toEqual([]);
    expect(shuffleDeterministic(single, { nextUint32: draw })).toEqual([123]);
    expect(shuffleDeterministic(single, { nextUint32: draw })).not.toBe(single);
    expect(draw).not.toHaveBeenCalled();
  });

  it('weist ungültige Generatorwerte zurück, ohne die Eingabe zu verändern', () => {
    const original = Object.freeze([1, 2, 3]);
    for (const invalid of [-1, 1.5, NaN, Infinity, 4294967296]) {
      expect(() => shuffleDeterministic(original, { nextUint32: () => invalid })).toThrow(RangeError);
    }
    expect(original).toEqual([1, 2, 3]);
  });

  it('bricht bei dauerhaft verworfenen Zufallswerten kontrolliert ab', () => {
    const draw = vi.fn(() => 0xffffffff);
    expect(() => shuffleDeterministic([1, 2, 3], { nextUint32: draw })).toThrow(
      'Zu viele verworfene RNG-Werte',
    );
    expect(draw).toHaveBeenCalledTimes(1024);
  });

  it('weist Lücken, zu große Arrays und fehlende Generatoren vor der ersten Ziehung zurück', () => {
    const draw = vi.fn(() => 0);
    expect(() => shuffleDeterministic(new Array<number>(3), { nextUint32: draw })).toThrow(RangeError);
    expect(() => shuffleDeterministic(Array<number>(100001).fill(1), { nextUint32: draw })).toThrow(RangeError);
    expect(() => shuffleDeterministic(null as unknown as number[], { nextUint32: draw })).toThrow(RangeError);
    expect(() => shuffleDeterministic([1, 2], null as unknown as { nextUint32(): number })).toThrow(TypeError);
    expect(draw).not.toHaveBeenCalled();
  });

  it('verändert bei Nutzung des Ereignisstroms keinen Welt- oder UI-Zufall', () => {
    const first = createRandomStreams(2026);
    const second = createRandomStreams(2026);
    const values = [1, 2, 3, 4, 5, 6];
    expect(shuffleDeterministic(values, first.event)).toEqual(
      shuffleDeterministic(values, second.event),
    );
    expect(first.world.nextUint32()).toBe(second.world.nextUint32());
    expect(first.ui.nextUint32()).toBe(second.ui.nextUint32());
  });
});
