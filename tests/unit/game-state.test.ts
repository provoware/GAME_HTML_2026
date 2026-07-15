import { describe, expect, it } from 'vitest';

import type { GameState } from '../../src/core/state/game-state';

describe('GameState', () => {
  it('beschreibt die zentralen Pflichtbereiche des Spielstands', () => {
    const state = {
      schemaVersion: 1,
      gameVersion: '0.0.0',
      status: 'setup',
      mode: 'classic',
      campaignLengthMonths: 12,
      calendar: {
        day: 1,
        week: 1,
        month: 1,
        year: 1986,
        actionPoints: 3,
      },
      profile: {
        playerName: 'Poppi',
        nickname: 'P',
        crewName: 'Kassettencrew',
        homeDistrict: 'bunkerclub',
        favoriteSaying: 'Alles rauscht.',
        fear: 'Stillstand',
        goal: 'Ehre',
        importantPerson: 'Etna',
        shopName: 'Rumpelregal',
        rivalName: 'Moni',
        artistName: 'PPPoppi',
        secretWord: 'amber',
      },
      player: {
        reputation: 10,
        shadow: 0,
        morality: 50,
        influence: 5,
        creativity: 20,
        energy: 80,
        stress: 10,
        heat: 0,
        crewLoyalty: 50,
        resonance: 0,
        rank: 1,
        xp: 0,
      },
      economy: {
        cash: 120,
        savings: 0,
        debt: 0,
      },
      world: {
        currentDistrictId: 'startbezirk',
        currentLocationId: 'bunkerclub',
        unlockedLocationIds: ['bunkerclub'],
      },
      missions: {
        activeMissionIds: [],
        completedMissionIds: [],
        failedMissionIds: [],
      },
      events: {
        activeEventIds: [],
        resolvedEventIds: [],
      },
      relationships: [
        {
          characterId: 'etna-ruppen',
          loyalty: 50,
          trust: 50,
        },
      ],
      achievements: {
        unlockedIds: [],
        restrictedByCheats: false,
      },
      settings: {
        theme: 'retro-amber',
        reducedMotion: false,
        audioEnabled: true,
      },
      rng: {
        seed: 'GAME2026',
        worldStream: 'world',
        eventStream: 'event',
        uiStream: 'ui',
      },
      history: [
        {
          turn: 0,
          message: 'Spiel vorbereitet.',
          createdAt: '1986-01-01T00:00:00.000Z',
        },
      ],
    } satisfies GameState;

    expect(state.schemaVersion).toBe(1);
    expect(state.profile.secretWord).toBe('amber');
    expect(state.rng.seed).toBe('GAME2026');
  });
});
