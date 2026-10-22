import type { SeededRandom } from './seeded-random';

/** Für alle Ereignisse: ganzzahlige Gewichtung zwischen 1 und 10.000. */
export type WeightedOption<T> = {
  readonly value: T;
  readonly weight: number;
};

/**
 * Wählt aus gültigen Gewichten ohne Fließkomma-Rundungsfehler.
 * Rejection Sampling verhindert die Modulo-Verzerrung bei uint32-Werten.
 * Genau eine Auswahl, keine Mutation der Eingaben; zusätzliche RNG-Züge
 * sind bei verworfenen uint32-Werten möglich und Teil des Algorithmus.
 */
export function chooseWeighted<T>(options: readonly WeightedOption<T>[], rng: Pick<SeededRandom, 'nextUint32'>): T {
  if (!Array.isArray(options) || options.length === 0 || options.length > 10000) {
    throw new RangeError('Gewichtete Auswahl benötigt 1 bis 10.000 Einträge.');
  }
  let total = 0;
  for (const option of options) {
    if (option === null || typeof option !== 'object' || !Number.isInteger(option.weight) ||
      option.weight < 1 || option.weight > 10000) {
      throw new RangeError('Jede Gewichtung muss eine ganze Zahl zwischen 1 und 10.000 sein.');
    }
    total += option.weight;
  }
  // max. 100 Millionen – sicher unter dem 32-Bit-Raum.
  const UINT32_RANGE = 0x100000000;
  const limit = Math.floor(UINT32_RANGE / total) * total;
  if (!rng || typeof rng.nextUint32 !== 'function') {
    throw new TypeError('Gewichtete Auswahl benötigt einen Generator mit nextUint32().');
  }
  // Begrenzt die Versuche bei dauerhaft ungültigen, sonst endlos laufenden Generatoren.
  const MAX_ATTEMPTS = 1024;
  let draw: number | undefined;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = rng.nextUint32();
    if (!Number.isInteger(candidate) || candidate < 0 || candidate >= UINT32_RANGE) {
      throw new RangeError('Der Zufallsgenerator muss gültige uint32-Werte liefern.');
    }
    if (candidate < limit) {
      draw = candidate;
      break;
    }
  }
  if (draw === undefined) {
    throw new RangeError('Zu viele verworfene RNG-Werte bei der gewichteten Auswahl.');
  }
  let position = draw % total;
  for (const option of options) {
    if (position < option.weight) return option.value;
    position -= option.weight;
  }
  throw new Error('Interner Fehler der gewichteten Auswahl.');
}
