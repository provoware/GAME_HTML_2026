/**
 * GAME-0301: deterministischer Mulberry32-Generator (32 Bit).
 * Keine kryptografische Zufallsquelle; nicht für Schlüssel oder Geheimnisse.
 * Keine Abhängigkeit von Uhrzeit, Browserzustand oder Math.random().
 */
export interface SeededRandom {
  /** Ein deterministischer vorzeichenloser 32-Bit-Wert. */
  nextUint32(): number;
  /** Gleiche Folge, als Zahl im halboffenen Intervall [0, 1). */
  nextFloat(): number;
  /** Interner 32-Bit-Zustand nach dem letzten Zug; für Diagnosen. */
  getState(): number;
}

/** Seed muss eine Ganzzahl zwischen 0 und 2^32-1 sein (0 ist gültig). */
export function createSeededRandom(seed: number): SeededRandom {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError('RNG-Seed muss eine vorzeichenlose 32-Bit-Ganzzahl sein.');
  }

  let state = seed >>> 0;
  const nextUint32 = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
  return {
    nextUint32,
    nextFloat: (): number => nextUint32() / 0x100000000,
    getState: (): number => state,
  };
}
