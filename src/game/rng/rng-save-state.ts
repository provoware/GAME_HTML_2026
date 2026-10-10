import type { GameState, RngState } from '../state/game-state';
import { formatRandomSeed, parseRandomSeed } from './random-seed';
import { createSeededRandom } from './seeded-random';
import type { RandomStreams } from './random-streams';

const PREFIX = 'rng1:';
const FIELDS = ['seed', 'worldStream', 'eventStream', 'uiStream'] as const;

/**
 * GAME-0304: versionierter Speichervertrag in bereits vorhandenen rng-Feldern.
 * rng1:<8 kleine Hex-Zeichen> bewahrt Seed und drei FORTGESCHRITTENE
 * Mulberry32-Zustände. Keine Veränderung des übrigen Spielstandschemas.
 */
export function snapshotRandomStreams(seed: number, streams: RandomStreams): RngState {
  return {
    seed: PREFIX + formatRandomSeed(seed),
    worldStream: PREFIX + formatRandomSeed(streams.world.getState()),
    eventStream: PREFIX + formatRandomSeed(streams.event.getState()),
    uiStream: PREFIX + formatRandomSeed(streams.ui.getState()),
  };
}

export type RestoreRandomStreamsResult =
  | { readonly ok: true; readonly seed: number; readonly streams: RandomStreams }
  | { readonly ok: false; readonly reason: 'legacy' | 'invalid'; readonly message: string };

/**
 * Alte Spielstände werden NICHT stillschweigend zu frischen RNGs gemacht:
 * deren bisherige Text-Streams erlauben keine exakte Fortsetzung.
 * Das ursprüngliche rng-Objekt bleibt bei Fehlern vollständig unverändert.
 */
export function restoreRandomStreams(input: unknown): RestoreRandomStreamsResult {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, reason: 'invalid', message: 'RNG-Spielstand muss ein Objekt sein.' };
  }
  const record = input as Record<string, unknown>;
  const keys = Reflect.ownKeys(record);
  if (keys.length !== FIELDS.length || keys.some((key) => typeof key !== 'string' || !FIELDS.includes(key as typeof FIELDS[number]))) {
    return { ok: false, reason: 'invalid', message: 'RNG-Spielstand enthält fehlende oder unbekannte Felder.' };
  }
  const values = FIELDS.map((field) => record[field]);
  if (values.some((value) => typeof value !== 'string')) {
    return { ok: false, reason: 'invalid', message: 'RNG-Werte müssen Zeichenfolgen sein.' };
  }
  const tagged = values.filter((value) => (value as string).startsWith(PREFIX)).length;
  if (tagged === 0) {
    return {
      ok: false, reason: 'legacy',
      message: 'Alter RNG-Spielstand: Die Generatorzustände können nicht verlustfrei fortgesetzt werden.',
    };
  }
  if (tagged !== FIELDS.length) {
    return { ok: false, reason: 'invalid', message: 'Gemischte RNG-Formatversionen sind nicht zulässig.' };
  }
  try {
    const [seed, world, event, ui] = values.map((value) => {
      const encoded = (value as string).slice(PREFIX.length);
      return parseRandomSeed(encoded);
    });
    if (seed === undefined || world === undefined || event === undefined || ui === undefined) {
      throw new Error('Unvollständiger RNG-Spielstand');
    }
    return {
      ok: true,
      seed,
      streams: {
        world: createSeededRandom(world),
        event: createSeededRandom(event),
        ui: createSeededRandom(ui),
      },
    };
  } catch {
    return { ok: false, reason: 'invalid', message: 'RNG-Spielstand enthält ungültige Hex-Zustände.' };
  }
}

/** Erstellt eine neue Zustandskopie; das Original bleibt unverändert. */
export function withRandomStreamsSaved(state: GameState, seed: number, streams: RandomStreams): GameState {
  return { ...state, rng: snapshotRandomStreams(seed, streams) };
}
