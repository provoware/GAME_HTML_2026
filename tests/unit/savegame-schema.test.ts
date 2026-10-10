import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../../src/game/state/game-state';
import {
  SAVEGAME_MAX_LIST_LENGTH, SAVEGAME_SCHEMA_VERSION, validateSavegame,
} from '../../src/game/state/savegame-schema';

const BASE = {
  schemaVersion: SAVEGAME_SCHEMA_VERSION,
  slotId: 'save-slot-one',
  savedAt: '1986-01-01T00:00:00.000Z',
  state: createInitialGameState(),
};

function invalid(value: unknown, message: string): void {
  const result = validateSavegame(value);
  expect(result.valid).toBe(false);
  if (!result.valid) expect(result.issues.join(' ')).toContain(message);
}

describe('GAME-0213: Savegame-Schema v1', () => {
  it('akzeptiert den unveränderten Startzustand ohne Seiteneffekt', () => {
    const before = structuredClone(BASE);
    expect(validateSavegame(BASE)).toEqual({ valid: true, savegame: BASE });
    expect(BASE).toEqual(before);
  });

  it('akzeptiert erlaubte gefüllte Listen und den fortgeschrittenen Zustand', () => {
    const state = {
      ...BASE.state,
      status: 'running',
      calendar: { ...BASE.state.calendar, month: 6, actionPoints: 0 },
      player: { ...BASE.state.player, xp: 1200, rank: 8 },
      missions: { activeMissionIds: ['mission-a'], completedMissionIds: ['mission-b'], failedMissionIds: [] },
      world: {
        ...BASE.state.world,
        flags: [{ id: 'flag-one', active: true, updatedTurn: 4 }],
        rumors: [{ id: 'rumor-one', text: 'Ein Gerücht', discoveredTurn: 3 }],
      },
      history: [{ turn: 1, message: 'Weitergespielt.', createdAt: '1986-02-01T00:00:00.000Z' }],
    };
    expect(validateSavegame({ ...BASE, state }).valid).toBe(true);
  });

  it('weist fehlende und unbekannte Felder sowie fremde Versionen zurück', () => {
    invalid(null, 'Objekt');
    invalid([], 'Objekt');
    invalid({ ...BASE, schemaVersion: 2 }, 'schemaVersion');
    invalid({ ...BASE, slotId: 'Bad Slot' }, 'slotId');
    invalid({ ...BASE, savedAt: 'yesterday' }, 'savedAt');
    invalid({ ...BASE, script: 'ignored' }, 'unbekanntes Feld');
    const missing: Record<string, unknown> = { ...BASE };
    delete missing.slotId;
    invalid(missing, 'slotId: Pflichtfeld fehlt');
    invalid({ ...BASE, state: { ...BASE.state, code: 'unknown' } }, 'unbekanntes Feld');
    invalid({ ...BASE, state: { ...BASE.state, profile: { ...BASE.state.profile, schemaVersion: 99 } } }, 'Datenversion');
  });

  it('verhindert beschädigte Spielwerte und ungültige Typen', () => {
    invalid({ ...BASE, state: { ...BASE.state, player: { ...BASE.state.player, energy: 101 } } }, 'energy');
    invalid({ ...BASE, state: { ...BASE.state, player: { ...BASE.state.player, xp: -1 } } }, 'xp');
    invalid({ ...BASE, state: { ...BASE.state, player: { ...BASE.state.player, rank: 0 } } }, 'rank');
    invalid({ ...BASE, state: { ...BASE.state, economy: { ...BASE.state.economy, cash: 1.5 } } }, 'cash');
    invalid({ ...BASE, state: { ...BASE.state, calendar: { ...BASE.state.calendar, month: 13 } } }, 'calendar');
    invalid({ ...BASE, state: { ...BASE.state, status: 'unknown' } }, 'Spielmodus');
  });

  it('verhindert falsche Referenzen, Duplikate und unzulässige Listen', () => {
    invalid({ ...BASE, state: { ...BASE.state, missions: { ...BASE.state.missions, activeMissionIds: ['BAD ID'] } } }, 'Referenz-ID');
    invalid({ ...BASE, state: { ...BASE.state, events: { ...BASE.state.events, activeEventIds: ['event-one', 'event-one'] } } }, 'doppelte');
    invalid({ ...BASE, state: { ...BASE.state, world: { ...BASE.state.world, currentLocationId: 'locked-place' } } }, 'nicht freigeschaltet');
    invalid({ ...BASE, state: { ...BASE.state, events: { ...BASE.state.events, activeEventIds: Array(SAVEGAME_MAX_LIST_LENGTH + 1).fill('event-one') } } }, 'zu lange Liste');
  });

  it('weist fehlerhafte Zeitstempel und nicht sicher lesbare Daten zurück', () => {
    invalid({ ...BASE, state: { ...BASE.state, history: [{ turn: 1, message: 'Test', createdAt: '2026-01-01' }] } }, 'UTC-Zeitstempel');
    const broken = { ...BASE, get state(): never { throw new Error('unexpected'); } };
    invalid(broken, 'nicht sicher lesbare Daten');
  });
});
