import type { SeededRandom } from './seeded-random';

/**
 * GAME-0306: reproduzierbares Fisher-Yates-Mischen mit unverzerrten Indizes.
 *
 * Keine Mutation der Eingabe, keine globale Zufallsquelle und kein Zugriff
 * auf Spielzustand, Uhrzeit oder Browser. Die RNG-Züge (inklusive verworfener
 * Werte) sind Teil des Algorithmus und müssen für Replays stabil bleiben.
 *
 * Begrenzung auf 100.000 dichte Einträge verhindert unbeabsichtigte große
 * Speicher- und Rechenlast. Nach 1.024 verworfenen Ziehungen für denselben
 * Index wird ein defekter Generator abgewiesen statt endlos zu warten.
 */
export function shuffleDeterministic<T>(
  items: readonly T[],
  rng: Pick<SeededRandom, 'nextUint32'>,
): T[] {
  const MAX_ITEMS = 100_000;
  if (!Array.isArray(items) || items.length > MAX_ITEMS) {
    throw new RangeError('Mischen benötigt ein Array mit höchstens 100.000 Einträgen.');
  }
  for (let index = 0; index < items.length; index++) {
    if (!Object.prototype.hasOwnProperty.call(items, index)) {
      throw new RangeError('Mischen erlaubt keine Array-Lücken.');
    }
  }
  if (!rng || typeof rng.nextUint32 !== 'function') {
    throw new TypeError('Mischen benötigt einen Zufallsgenerator mit nextUint32().');
  }

  const shuffled = items.slice();
  const UINT32_RANGE = 0x100000000;
  const MAX_ATTEMPTS = 1024;

  for (let index = shuffled.length - 1; index > 0; index--) {
    const count = index + 1;
    const limit = Math.floor(UINT32_RANGE / count) * count;
    let selectedIndex = -1;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const draw = rng.nextUint32();
      if (!Number.isInteger(draw) || draw < 0 || draw >= UINT32_RANGE) {
        throw new RangeError('Der Zufallsgenerator muss gültige uint32-Werte liefern.');
      }
      if (draw < limit) {
        selectedIndex = draw % count;
        break;
      }
    }
    if (selectedIndex < 0) {
      throw new RangeError('Zu viele verworfene RNG-Werte beim Mischen.');
    }
    [shuffled[index], shuffled[selectedIndex]] = [
      shuffled[selectedIndex]!,
      shuffled[index]!,
    ];
  }
  return shuffled;
}
