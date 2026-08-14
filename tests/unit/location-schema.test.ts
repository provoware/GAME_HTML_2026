import { describe, expect, it } from 'vitest';

import {
  LOCATION_SCHEMA_VERSION,
  validateLocation,
} from '../../src/game/districts/location-schema';

const VALID_LOCATION = {
  schemaVersion: LOCATION_SCHEMA_VERSION,
  id: 'bunkerclub',
  name: 'Bunkerclub',
  districtId: 'startbezirk',
  description: 'Ein tiefer Club mit flackerndem Licht und klaren Konsequenzen.',
  accessConditionIds: [],
  actionIds: ['action-club-assist'],
  risks: [{ id: 'risk-hearing', severity: 20 }],
  characterIds: ['etna-ruppen'],
  eventIds: ['event-club-opening'],
  media: {
    audioAssetPath: 'audio/bunkerclub.ogg',
    imageAssetPath: 'images/bunkerclub.webp',
  },
  accessibilityLabel: 'Bunkerclub, öffentlich zugänglicher Veranstaltungsort',
} as const;

describe('location schema', () => {
  it('akzeptiert einen vollständigen Ort ohne Zugangshürde', () => {
    expect(validateLocation(VALID_LOCATION)).toEqual({
      valid: true,
      location: VALID_LOCATION,
    });
  });

  it('meldet ungültige Pflichtwerte gesammelt', () => {
    const result = validateLocation({
      ...VALID_LOCATION,
      description: '   ',
      actionIds: [],
      risks: [{ id: 'risk-hearing', severity: 101 }],
      media: {
        ...VALID_LOCATION.media,
        imageAssetPath: 'https://example.invalid/bunkerclub.webp',
      },
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toHaveLength(4);
    }
  });

  it('lehnt falsche Schemaversionen und Nicht-Objekte ab', () => {
    expect(validateLocation({ ...VALID_LOCATION, schemaVersion: 2 }).valid).toBe(false);
    expect(
      validateLocation({
        ...VALID_LOCATION,
        media: { ...VALID_LOCATION.media, audioAssetPath: '../privat.ogg' },
      }).valid,
    ).toBe(false);
    expect(validateLocation([])).toEqual({
      valid: false,
      issues: ['Ort muss ein Objekt sein.'],
    });
  });
});
