import { createSeededRandom, type SeededRandom } from './seeded-random';

/** Strikt getrennte Domänen: Spielwelt, Ereignisse und rein visuelle Effekte. */
export type RandomStreams = {
  readonly world: SeededRandom;
  readonly event: SeededRandom;
  readonly ui: SeededRandom;
};

/**
 * GAME-0302: unabhängige Generatoren pro Anwendungsbereich.
 * Verschiedene feste Domänenmasken verhindern gleichen internen Startzustand
 * bei identischem Haupt-Seed. Die Bedeutung der Masken ist versioniert:
 * niemals ohne Migrationskonzept ändern (Reproduzierbarkeit).
 *
 * Kein Zugriff auf Math.random, Datum, globale Variablen oder Browser-APIs.
 * Der Haupt-Seed ist ein validierter uint32 und noch nicht mit Savegames verbunden.
 */
export function createRandomStreams(seed: number): RandomStreams {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError('RNG-Haupt-Seed muss eine vorzeichenlose 32-Bit-Ganzzahl sein.');
  }

  return {
    world: createSeededRandom((seed ^ 0xa511e9b3) >>> 0),
    event: createSeededRandom((seed ^ 0x63d83595) >>> 0),
    ui: createSeededRandom((seed ^ 0xc2b2ae35) >>> 0),
  };
}
