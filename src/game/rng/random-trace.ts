import type { RandomStreams } from './random-streams';
import type { SeededRandom } from './seeded-random';

export type RandomStreamName = 'world' | 'event' | 'ui';
export type RandomDrawMethod = 'nextUint32' | 'nextFloat';

export type RandomDrawRecord = Readonly<{
  sequence: number;
  stream: RandomStreamName;
  method: RandomDrawMethod;
  value: number;
  stateBefore: number;
  stateAfter: number;
}>;

export type RandomTrace = Readonly<{
  streams: RandomStreams;
  getEntries: () => readonly RandomDrawRecord[];
  clear: () => void;
}>;

/**
 * GAME-0307: optionales, auf wenige Einträge begrenztes Zufallsprotokoll.
 * Die Originalgeneratoren und ihre Ziehungsreihenfolge bleiben unverändert.
 * Nicht im Spielstand speichern; nur bei ausdrücklich aktivierter Diagnose nutzen.
 */
export function createRandomTrace(sources: RandomStreams, maxEntries = 256): RandomTrace {
  if (!Number.isInteger(maxEntries) || maxEntries < 1 || maxEntries > 10000) {
    throw new RangeError('Das RNG-Protokoll benötigt eine Grenze von 1 bis 10.000 Einträgen.');
  }

  const entries: RandomDrawRecord[] = [];
  let sequence = 0;

  function wrap(stream: RandomStreamName, source: SeededRandom): SeededRandom {
    function draw(method: RandomDrawMethod): number {
      const stateBefore = source.getState();
      const value = source[method]();
      const record: RandomDrawRecord = Object.freeze({
        sequence: ++sequence,
        stream,
        method,
        value,
        stateBefore,
        stateAfter: source.getState(),
      });
      if (entries.length === maxEntries) entries.shift();
      entries.push(record);
      return value;
    }

    return {
      nextUint32: () => draw('nextUint32'),
      nextFloat: () => draw('nextFloat'),
      getState: () => source.getState(),
    };
  }

  return {
    streams: {
      world: wrap('world', sources.world),
      event: wrap('event', sources.event),
      ui: wrap('ui', sources.ui),
    },
    getEntries: () => [...entries],
    clear: () => {
      entries.length = 0;
    },
  };
}
