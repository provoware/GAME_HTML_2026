import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRandomStreams } from '../../src/game/rng/random-streams';
import { formatRandomSeed, generateRandomSeed, parseRandomSeed } from '../../src/game/rng/random-seed';

afterEach(() => vi.unstubAllGlobals());

describe('GAME-0303 – sichere und reproduzierbare Seeds', () => {
  it('bezieht einen vollständigen 32-Bit-Seed aus crypto.getRandomValues', () => {
    const getRandomValues = vi.fn((target: Uint32Array) => {
      expect(target).toBeInstanceOf(Uint32Array);
      expect(target).toHaveLength(1);
      target[0] = 0xdeadbeef;
      return target;
    });
    vi.stubGlobal('crypto', { getRandomValues });
    expect(generateRandomSeed()).toBe(0xdeadbeef);
    expect(getRandomValues).toHaveBeenCalledOnce();
  });

  it('verwendet bei fehlender Systemzufallsquelle keinen unsicheren Ersatz', () => {
    vi.stubGlobal('crypto', undefined);
    expect(() => generateRandomSeed()).toThrow('crypto.getRandomValues');
  });

  it('reicht Störungen der Systemzufallsquelle weiter', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: () => { throw new Error('Sicherer Zufall nicht verfügbar'); },
    });
    expect(() => generateRandomSeed()).toThrow('Sicherer Zufall nicht verfügbar');
  });

  it('formatiert und liest die beiden Grenzwerte verlustfrei', () => {
    expect(formatRandomSeed(0)).toBe('00000000');
    expect(formatRandomSeed(0xffffffff)).toBe('ffffffff');
    expect(parseRandomSeed('00000000')).toBe(0);
    expect(parseRandomSeed('ffffffff')).toBe(0xffffffff);
  });

  it('erzwingt ein eindeutiges kanonisches Seed-Format', () => {
    for (const value of [-1, 1.5, 0x100000000, NaN, Infinity]) {
      expect(() => formatRandomSeed(value)).toThrow(RangeError);
    }
    for (const text of ['', '0', 'FFFFFFFF', '0x000000', '0000000g', ' 00000000', '000000000']) {
      expect(() => parseRandomSeed(text)).toThrow(TypeError);
    }
  });

  it('reproduziert sämtliche drei Ströme nach verlustfreier Text-Rundreise', () => {
    const seed = 0x1234abcd;
    const original = createRandomStreams(seed);
    const restored = createRandomStreams(parseRandomSeed(formatRandomSeed(seed)));
    for (let index = 0; index < 256; index++) {
      expect(restored.world.nextUint32()).toBe(original.world.nextUint32());
      expect(restored.event.nextUint32()).toBe(original.event.nextUint32());
      expect(restored.ui.nextUint32()).toBe(original.ui.nextUint32());
    }
  });

  it('bewahrt auch ein von der sicheren Quelle geliefertes Nullwort', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (values: Uint32Array) => { values[0] = 0; return values; },
    });
    const seed = generateRandomSeed();
    expect(seed).toBe(0);
    expect(parseRandomSeed(formatRandomSeed(seed))).toBe(0);
  });
});
