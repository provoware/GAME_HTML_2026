import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../../src/game/state/game-state';
import { createRandomStreams } from '../../src/game/rng/random-streams';
import { restoreRandomStreams, snapshotRandomStreams, withRandomStreamsSaved } from '../../src/game/rng/rng-save-state';
import { validateSavegame } from '../../src/game/save/savegame-schema';

describe('GAME-0304 – RNG-Zustand speichern und fortsetzen', () => {
  it('speichert vier eindeutig versionierte Werte ohne Zustandsänderung', () => {
    const streams = createRandomStreams(42);
    streams.world.nextUint32();
    streams.event.nextFloat();
    const states = [streams.world.getState(), streams.event.getState(), streams.ui.getState()];
    const saved = snapshotRandomStreams(42, streams);
    expect(saved.seed).toBe('rng1:0000002a');
    for (const value of Object.values(saved)) expect(value).toMatch(/^rng1:[0-9a-f]{8}$/);
    expect([streams.world.getState(), streams.event.getState(), streams.ui.getState()]).toEqual(states);
  });

  it('setzt jeden der drei Ströme nach unterschiedlichen Zugzahlen exakt fort', () => {
    const seed = 0x1234abcd;
    const original = createRandomStreams(seed);
    for (let i = 0; i < 17; i++) original.world.nextUint32();
    for (let i = 0; i < 301; i++) original.event.nextFloat();
    for (let i = 0; i < 5; i++) original.ui.nextUint32();
    const encoded = JSON.parse(JSON.stringify(snapshotRandomStreams(seed, original))) as unknown;
    const restored = restoreRandomStreams(encoded);
    expect(restored.ok).toBe(true);
    if (!restored.ok) return;
    expect(restored.seed).toBe(seed);
    for (let i = 0; i < 200; i++) {
      expect(restored.streams.world.nextUint32()).toBe(original.world.nextUint32());
      expect(restored.streams.event.nextUint32()).toBe(original.event.nextUint32());
      expect(restored.streams.ui.nextUint32()).toBe(original.ui.nextUint32());
    }
  });

  it('speichert in bereits vorhandenen GameState-Feldern ohne Originalmutation', () => {
    const original = createInitialGameState();
    const before = JSON.stringify(original);
    const streams = createRandomStreams(0);
    streams.ui.nextFloat();
    const copy = withRandomStreamsSaved(original, 0, streams);
    expect(copy).not.toBe(original);
    expect(JSON.stringify(original)).toBe(before);
    expect(copy.rng.seed).toBe('rng1:00000000');
    const save = {
      ...copy, createdAt: '1986-01-01T00:00:00.000Z',
      updatedAt: '1986-01-01T12:00:00.000Z', checksum: 'a'.repeat(64),
    };
    expect(validateSavegame(save).valid).toBe(true);
    // GAME-1607 prüft erst später die tatsächliche Prüfsumme.
  });

  it('erkennt bisherige Textwerte und verändert diese nicht', () => {
    const legacy = createInitialGameState().rng;
    const before = JSON.stringify(legacy);
    const result = restoreRandomStreams(legacy);
    expect(result).toMatchObject({ ok: false, reason: 'legacy' });
    expect(JSON.stringify(legacy)).toBe(before);
  });

  it('verwirft gemischte Versionsstände ohne automatische Migration', () => {
    const snapshot = snapshotRandomStreams(5, createRandomStreams(5));
    expect(restoreRandomStreams({ ...snapshot, uiStream: 'GAME2026:ui' })).toMatchObject({
      ok: false, reason: 'invalid',
    });
  });

  it('verwirft beschädigte Zustände, zusätzliche Felder und fehlende Felder', () => {
    const snapshot = snapshotRandomStreams(5, createRandomStreams(5));
    for (const corrupt of [
      null, [], { ...snapshot, worldStream: 'rng1:deadbeeg' },
      { ...snapshot, eventStream: 'rng1:FFFFFFFF' },
      { ...snapshot, extra: 'injected' },
      { seed: snapshot.seed, worldStream: snapshot.worldStream, eventStream: snapshot.eventStream },
      { ...snapshot, seed: 5 },
    ]) {
      expect(restoreRandomStreams(corrupt)).toMatchObject({ ok: false, reason: 'invalid' });
    }
  });

  it('unterschiedliche Starts und Null-Zustände werden verlustfrei erhalten', () => {
    const streams = createRandomStreams(0xffffffff);
    const restored = restoreRandomStreams(snapshotRandomStreams(0xffffffff, streams));
    expect(restored.ok).toBe(true);
    if (restored.ok) {
      expect(restored.seed).toBe(0xffffffff);
      expect(restored.streams.world.nextUint32()).toBe(streams.world.nextUint32());
    }
  });
});
