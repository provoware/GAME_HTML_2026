export const PLAYER_PROFILE_SCHEMA_VERSION = 1;

export const PLAYER_PROFILE_FIELD_LIMITS = {
  playerName: 40,
  nickname: 24,
  crewName: 40,
  homeDistrict: 40,
  favoriteSaying: 120,
  fear: 80,
  goal: 100,
  importantPerson: 40,
  shopName: 40,
  rivalName: 40,
  artistName: 40,
  secretWord: 32,
} as const;

export type PlayerProfileField = keyof typeof PLAYER_PROFILE_FIELD_LIMITS;

export type PlayerProfile = {
  readonly schemaVersion: typeof PLAYER_PROFILE_SCHEMA_VERSION;
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

export const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  schemaVersion: PLAYER_PROFILE_SCHEMA_VERSION,
  playerName: 'PPPoppi Poppsen',
  nickname: 'Poppi',
  crewName: 'Kassettencrew',
  homeDistrict: 'startbezirk',
  favoriteSaying: 'Alles rauscht, aber wir bleiben wach.',
  fear: 'Stillstand',
  goal: 'Euronen, Ehre und ein sauberer Abgang',
  importantPerson: 'Etna Ruppen',
  shopName: 'Rumpelregal 86',
  rivalName: 'Moni Monopol',
  artistName: 'PPPoppi',
  secretWord: 'amber',
};

export function createDefaultPlayerProfile(): PlayerProfile {
  return { ...DEFAULT_PLAYER_PROFILE };
}

export function getPlayerProfileFieldLimit(field: PlayerProfileField): number {
  return PLAYER_PROFILE_FIELD_LIMITS[field];
}
