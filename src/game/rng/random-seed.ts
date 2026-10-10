/**
 * GAME-0303: Neue Spiel-Startwerte aus einer sicheren Systemzufallsquelle.
 *
 * Die kryptografische Quelle dient ausschließlich der einmaligen Erzeugung
 * des Seeds. GAME-0301/0302 verwenden danach deterministische, ausdrücklich
 * NICHT kryptografische Generatoren zur wiederholbaren Simulation.
 *
 * Weder Math.random() noch Uhrzeit werden als unsicherer Ersatz verwendet.
 */
export function generateRandomSeed(): number {
  if (typeof globalThis.crypto?.getRandomValues !== 'function') {
    throw new Error('Sichere Seed-Erzeugung benötigt crypto.getRandomValues().');
  }
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return values[0]!;
}

/** Festes, verlustfreies achtstelliges Hex-Format für spätere Speicherung. */
export function formatRandomSeed(seed: number): string {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError('RNG-Seed muss eine vorzeichenlose 32-Bit-Ganzzahl sein.');
  }
  return seed.toString(16).padStart(8, '0');
}

/** Liest ausschließlich die kanonische achtstellige Hex-Darstellung ein. */
export function parseRandomSeed(text: string): number {
  if (typeof text !== 'string' || !/^[0-9a-f]{8}$/.test(text)) {
    throw new TypeError('RNG-Seed muss aus genau acht kleinen Hex-Zeichen bestehen.');
  }
  return Number.parseInt(text, 16);
}
