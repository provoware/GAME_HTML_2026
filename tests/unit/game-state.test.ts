import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/core/state/game-state';

describe('createInitialGameState', () => {
  it('erzeugt die zentralen Pflichtbereiche des Spielstands', () => {
    const state = createInitialGameState();

    expect(state.schemaVersion).toBe(1);
    expect(state.gameVersion).toBe('0.0.0');
    expect(state.status).toBe('setup');
    expect(state.mode).toBe('classic');
    expect(state.campaignLengthMonths).toBe(12);
    expect(state.calendar).toEqual({
      day: 1,
      week: 1,
      month: 1,
      year: 1986,
      actionPoints: 3,
    });
    expect(state.profile.secretWord).toBe('amber');
    expect(state.player.rank).toBe(1);
    expect(state.economy).toEqual({
      schemaVersion: 1,
      cash: 120,
      savings: 0,
      debt: 0,
      fixedCosts: 35,
      upkeep: 20,
      monthlyWage: 90,
      savingsInterestRateBasisPoints: 25,
      debtInterestRateBasisPoints: 300,
      ledger: {
        earned: 0,
        spent: 0,
      },
    });
    expect(state.world).toEqual({
      schemaVersion: 1,
      currentDistrictId: 'startbezirk',
      knownDistrictIds: ['startbezirk'],
      currentLocationId: 'bunkerclub',
      unlockedLocationIds: ['bunkerclub'],
      lockedLocationIds: [],
      visitedLocationIds: ['bunkerclub'],
      flags: [],
      rumors: [],
    });
    expect(state.missions.activeMissionIds).toEqual([]);
    expect(state.events.activeEventIds).toEqual([]);
    expect(state.relationships).toEqual([
      {
        characterId: 'etna-ruppen',
        loyalty: 50,
        trust: 50,
      },
    ]);
    expect(state.achievements.restrictedByCheats).toBe(false);
    expect(state.settings.theme).toBe('retro-amber');
    expect(state.rng).toEqual({
      seed: 'GAME2026',
      worldStream: 'GAME2026:world',
      eventStream: 'GAME2026:event',
      uiStream: 'GAME2026:ui',
    });
    expect(state.history).toEqual([
      {
        turn: 0,
        message: 'Spiel vorbereitet.',
        createdAt: '1986-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('teilt keine Array-Referenzen zwischen neuen Spielständen', () => {
    const firstState = createInitialGameState();
    const secondState = createInitialGameState();

    expect(firstState.economy).not.toBe(secondState.economy);
    expect(firstState.economy.ledger).not.toBe(secondState.economy.ledger);
    expect(firstState.world).not.toBe(secondState.world);
    expect(firstState.world.unlockedLocationIds).not.toBe(secondState.world.unlockedLocationIds);
    expect(firstState.relationships).not.toBe(secondState.relationships);
    expect(firstState.history).not.toBe(secondState.history);
  });
});
