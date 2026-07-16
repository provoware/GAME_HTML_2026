export const WORLD_STATE_SCHEMA_VERSION = 1;
export const START_DISTRICT_ID = 'startbezirk';
export const START_LOCATION_ID = 'bunkerclub';

export type WorldFlag = {
  readonly id: string;
  readonly active: boolean;
  readonly updatedTurn: number;
};

export type WorldRumor = {
  readonly id: string;
  readonly text: string;
  readonly discoveredTurn: number;
};

export type WorldState = {
  readonly schemaVersion: typeof WORLD_STATE_SCHEMA_VERSION;
  readonly currentDistrictId: string;
  readonly knownDistrictIds: readonly string[];
  readonly currentLocationId: string;
  readonly unlockedLocationIds: readonly string[];
  readonly lockedLocationIds: readonly string[];
  readonly visitedLocationIds: readonly string[];
  readonly flags: readonly WorldFlag[];
  readonly rumors: readonly WorldRumor[];
};

export const DEFAULT_WORLD_STATE: WorldState = {
  schemaVersion: WORLD_STATE_SCHEMA_VERSION,
  currentDistrictId: START_DISTRICT_ID,
  knownDistrictIds: [START_DISTRICT_ID],
  currentLocationId: START_LOCATION_ID,
  unlockedLocationIds: [START_LOCATION_ID],
  lockedLocationIds: [],
  visitedLocationIds: [START_LOCATION_ID],
  flags: [],
  rumors: [],
};

export function createDefaultWorldState(): WorldState {
  return {
    ...DEFAULT_WORLD_STATE,
    knownDistrictIds: [...DEFAULT_WORLD_STATE.knownDistrictIds],
    unlockedLocationIds: [...DEFAULT_WORLD_STATE.unlockedLocationIds],
    lockedLocationIds: [...DEFAULT_WORLD_STATE.lockedLocationIds],
    visitedLocationIds: [...DEFAULT_WORLD_STATE.visitedLocationIds],
    flags: [...DEFAULT_WORLD_STATE.flags],
    rumors: [...DEFAULT_WORLD_STATE.rumors],
  };
}
