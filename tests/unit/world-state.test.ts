import { describe, expect, it } from 'vitest';

import {
  DEFAULT_WORLD_STATE,
  START_DISTRICT_ID,
  START_LOCATION_ID,
  WORLD_STATE_SCHEMA_VERSION,
  createDefaultWorldState,
} from '../../src/game/districts/world-state';

describe('world state schema', () => {
  it('definiert den Startzustand der Spielwelt mit Schemaversion', () => {
    expect(DEFAULT_WORLD_STATE).toEqual({
      schemaVersion: WORLD_STATE_SCHEMA_VERSION,
      currentDistrictId: START_DISTRICT_ID,
      knownDistrictIds: [START_DISTRICT_ID],
      currentLocationId: START_LOCATION_ID,
      unlockedLocationIds: [START_LOCATION_ID],
      lockedLocationIds: [],
      visitedLocationIds: [START_LOCATION_ID],
      flags: [],
      rumors: [],
    });
  });

  it('erzeugt unabhängige Weltzustände für neue Spielstände', () => {
    const firstWorld = createDefaultWorldState();
    const secondWorld = createDefaultWorldState();

    expect(firstWorld).toEqual(secondWorld);
    expect(firstWorld).not.toBe(secondWorld);
    expect(firstWorld.knownDistrictIds).not.toBe(secondWorld.knownDistrictIds);
    expect(firstWorld.unlockedLocationIds).not.toBe(secondWorld.unlockedLocationIds);
    expect(firstWorld.visitedLocationIds).not.toBe(secondWorld.visitedLocationIds);
    expect(firstWorld.flags).not.toBe(secondWorld.flags);
    expect(firstWorld.rumors).not.toBe(secondWorld.rumors);
  });
});
