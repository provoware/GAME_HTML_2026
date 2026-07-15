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

export type PlayerProfileState = {
  readonly playerName: string;
  readonly nickname: string;
  readonly crewName: string;
  readonly homeDistrict: string;
  readonly favoriteSaying: string;
  readonly fear: string;
  readonly goal: string;
  readonly importantPerson: string;
  readonly shopName: string;
  readonly rivalName: string;
  readonly artistName: string;
  readonly secretWord: string;
};

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
