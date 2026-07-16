import { createDefaultPlayerProfile, type PlayerProfile } from '../../game/profile/player-profile';

export type CampaignMode = 'classic' | 'tycoon' | 'clean-legend' | 'chaos';

export type CampaignLengthMonths = 12 | 24 | 36 | 'endless';

export type GameStatus = 'setup' | 'running' | 'won' | 'lost';

export type GameCalendarState = {
  readonly day: number;
  readonly week: number;
  readonly month: number;
  readonly year: 1986;
  readonly actionPoints: number;
};

export type PlayerProfileState = PlayerProfile;

export type PlayerStatsState = {
  readonly reputation: number;
  readonly shadow: number;
  readonly morality: number;
  readonly influence: number;
  readonly creativity: number;
  readonly energy: number;
  readonly stress: number;
  readonly heat: number;
  readonly crewLoyalty: number;
  readonly resonance: number;
  readonly rank: number;
  readonly xp: number;
};

export type EconomyState = {
  readonly cash: number;
  readonly savings: number;
  readonly debt: number;
};

export type WorldState = {
  readonly currentDistrictId: string;
  readonly currentLocationId: string;
  readonly unlockedLocationIds: readonly string[];
};

export type MissionState = {
  readonly activeMissionIds: readonly string[];
  readonly completedMissionIds: readonly string[];
  readonly failedMissionIds: readonly string[];
};

export type EventState = {
  readonly activeEventIds: readonly string[];
  readonly resolvedEventIds: readonly string[];
};

export type RelationshipState = {
  readonly characterId: string;
  readonly loyalty: number;
  readonly trust: number;
};

export type AchievementState = {
  readonly unlockedIds: readonly string[];
  readonly restrictedByCheats: boolean;
};

export type SettingsState = {
  readonly theme: 'retro-amber' | 'neon-night' | 'concrete-gray' | 'high-contrast';
  readonly reducedMotion: boolean;
  readonly audioEnabled: boolean;
};

export type RngState = {
  readonly seed: string;
  readonly worldStream: string;
  readonly eventStream: string;
  readonly uiStream: string;
};

export type HistoryEntry = {
  readonly turn: number;
  readonly message: string;
  readonly createdAt: string;
};

export type GameState = {
  readonly schemaVersion: number;
  readonly gameVersion: string;
  readonly status: GameStatus;
  readonly mode: CampaignMode;
  readonly campaignLengthMonths: CampaignLengthMonths;
  readonly calendar: GameCalendarState;
  readonly profile: PlayerProfileState;
  readonly player: PlayerStatsState;
  readonly economy: EconomyState;
  readonly world: WorldState;
  readonly missions: MissionState;
  readonly events: EventState;
  readonly relationships: readonly RelationshipState[];
  readonly achievements: AchievementState;
  readonly settings: SettingsState;
  readonly rng: RngState;
  readonly history: readonly HistoryEntry[];
};

export const INITIAL_SCHEMA_VERSION = 1;
export const INITIAL_GAME_VERSION = '0.0.0';
export const INITIAL_ACTION_POINTS = 3;
export const INITIAL_RNG_SEED = 'GAME2026';
export const INITIAL_HISTORY_TIMESTAMP = '1986-01-01T00:00:00.000Z';

/**
 * Erzeugt einen frischen, vollständigen Startzustand für neue Kampagnen.
 */
export function createInitialGameState(): GameState {
  return {
    schemaVersion: INITIAL_SCHEMA_VERSION,
    gameVersion: INITIAL_GAME_VERSION,
    status: 'setup',
    mode: 'classic',
    campaignLengthMonths: 12,
    calendar: {
      day: 1,
      week: 1,
      month: 1,
      year: 1986,
      actionPoints: INITIAL_ACTION_POINTS,
    },
    profile: createDefaultPlayerProfile(),
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
      seed: INITIAL_RNG_SEED,
      worldStream: `${INITIAL_RNG_SEED}:world`,
      eventStream: `${INITIAL_RNG_SEED}:event`,
      uiStream: `${INITIAL_RNG_SEED}:ui`,
    },
    history: [
      {
        turn: 0,
        message: 'Spiel vorbereitet.',
        createdAt: INITIAL_HISTORY_TIMESTAMP,
      },
    ],
  };
}
