import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/core/state/game-state';
import { processGameAction, reduceGameState } from '../../src/core/state/reducer';

describe('reduceGameState', () => {
  it('startet ein vorbereitetes Spiel unveränderlich', () => {
    const state = createInitialGameState();
    const nextState = reduceGameState(state, { type: 'game:start' });

    expect(nextState.status).toBe('running');
    expect(state.status).toBe('setup');
    expect(nextState).not.toBe(state);
  });

  it('aktualisiert nur übergebene Profilfelder', () => {
    const state = createInitialGameState();
    const nextState = reduceGameState(state, {
      type: 'profile:update',
      payload: {
        playerName: 'Etna Testen',
        secretWord: 'neon',
      },
    });

    expect(nextState.profile.playerName).toBe('Etna Testen');
    expect(nextState.profile.secretWord).toBe('neon');
    expect(nextState.profile.crewName).toBe(state.profile.crewName);
    expect(state.profile.playerName).toBe('PPPoppi Poppsen');
  });

  it('hängt History-Einträge an ohne bestehende Einträge zu verändern', () => {
    const state = createInitialGameState();
    const entry = {
      turn: 1,
      message: 'Der erste Zug knistert.',
      createdAt: '1986-01-01T08:00:00.000Z',
    };
    const nextState = reduceGameState(state, { type: 'history:add', payload: entry });

    expect(nextState.history).toEqual([...state.history, entry]);
    expect(state.history).toHaveLength(1);
  });
});

describe('processGameAction', () => {
  it('ignoriert unbekannte oder ungültige Actions sicher', () => {
    const state = createInitialGameState();

    expect(processGameAction(state, { type: 'unknown:action' })).toBe(state);
    expect(processGameAction(state, { type: 'history:add', payload: { message: 'kaputt' } })).toBe(
      state,
    );
  });

  it('weist typfalsche und unbekannte Profilfelder vollständig zurück', () => {
    const state = createInitialGameState();

    expect(
      processGameAction(state, {
        type: 'profile:update',
        payload: { playerName: 86 },
      }),
    ).toBe(state);
    expect(
      processGameAction(state, {
        type: 'profile:update',
        payload: { playerName: 'Etna', admin: true },
      }),
    ).toBe(state);
    expect(
      processGameAction(state, {
        type: 'profile:update',
        payload: { schemaVersion: 999 },
      }),
    ).toBe(state);
    expect(
      processGameAction(state, {
        type: 'profile:update',
        payload: { nickname: 'x'.repeat(25) },
      }),
    ).toBe(state);
    expect(
      processGameAction(state, {
        type: 'profile:update',
        payload: { nickname: '   ' },
      }),
    ).toBe(state);
  });

  it('weist ungültige History-Werte vollständig zurück', () => {
    const state = createInitialGameState();

    for (const payload of [
      { turn: -1, message: 'Kaputt', createdAt: '1986-01-01T08:00:00.000Z' },
      { turn: Number.NaN, message: 'Kaputt', createdAt: '1986-01-01T08:00:00.000Z' },
      { turn: 1, message: '', createdAt: '1986-01-01T08:00:00.000Z' },
      { turn: 1, message: 'x'.repeat(501), createdAt: '1986-01-01T08:00:00.000Z' },
      { turn: 1, message: 'Kaputt', createdAt: 'kein Datum' },
    ]) {
      expect(processGameAction(state, { type: 'history:add', payload })).toBe(state);
    }
  });
});
