import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../../src/game/state/game-state';

describe('Startzustand nach Architekturkorrektur', () => {
  it('erhält jeden ursprünglichen Feldnamen und Startwert', () => {
    expect(createInitialGameState()).toEqual({
      schemaVersion: 1, gameVersion: '0.0.0', status: 'setup',
      mode: 'classic', campaignLengthMonths: 12,
      calendar: { day: 1, week: 1, month: 1, year: 1986, actionPoints: 3 },
      profile: {
        schemaVersion: 1, playerName: 'PPPoppi Poppsen', nickname: 'Poppi',
        crewName: 'Kassettencrew', homeDistrict: 'startbezirk',
        favoriteSaying: 'Alles rauscht, aber wir bleiben wach.',
        fear: 'Stillstand', goal: 'Euronen, Ehre und ein sauberer Abgang',
        importantPerson: 'Etna Ruppen', shopName: 'Rumpelregal 86',
        rivalName: 'Moni Monopol', artistName: 'PPPoppi', secretWord: 'amber',
      },
      player: {
        reputation: 10, shadow: 0, morality: 50, influence: 5, creativity: 20,
        energy: 80, stress: 10, heat: 0, crewLoyalty: 50, resonance: 0, rank: 1, xp: 0,
      },
      economy: {
        schemaVersion: 1, cash: 120, savings: 0, debt: 0, fixedCosts: 35,
        upkeep: 20, monthlyWage: 90, savingsInterestRateBasisPoints: 25,
        debtInterestRateBasisPoints: 300, ledger: { earned: 0, spent: 0 },
      },
      world: {
        schemaVersion: 1, currentDistrictId: 'startbezirk',
        knownDistrictIds: ['startbezirk'], currentLocationId: 'bunkerclub',
        unlockedLocationIds: ['bunkerclub'], lockedLocationIds: [],
        visitedLocationIds: ['bunkerclub'], flags: [], rumors: [],
      },
      missions: { activeMissionIds: [], completedMissionIds: [], failedMissionIds: [] },
      events: { activeEventIds: [], resolvedEventIds: [] },
      relationships: [{ characterId: 'etna-ruppen', loyalty: 50, trust: 50 }],
      achievements: { unlockedIds: [], restrictedByCheats: false },
      settings: { theme: 'retro-amber', reducedMotion: false, audioEnabled: true },
      rng: {
        seed: 'GAME2026', worldStream: 'GAME2026:world',
        eventStream: 'GAME2026:event', uiStream: 'GAME2026:ui',
      },
      history: [{ turn: 0, message: 'Spiel vorbereitet.', createdAt: '1986-01-01T00:00:00.000Z' }],
    });
  });
});
