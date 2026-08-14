import { describe, expect, it } from 'vitest';

import {
  CHARACTER_SCHEMA_VERSION,
  validateCharacter,
} from '../../src/game/characters/character-schema';

const VALID_CHARACTER = {
  schemaVersion: CHARACTER_SCHEMA_VERSION,
  id: 'etna-ruppen',
  name: 'Etna Ruppen',
  role: 'Kassettenkuratorin',
  districtId: 'startbezirk',
  loyalty: 60,
  trust: 55,
  risk: 25,
  skill: 'Erkennt seltene Aufnahmen',
  weakness: 'Misstraut großen Versprechen',
  relationship: 'Alte Verbündete von Poppi',
  dialogueIds: ['dialog-etna-start'],
  missionIds: ['mission-etna-kassette'],
  eventIds: ['event-etna-fund'],
  possibleEndStates: ['active', 'allied'],
} as const;

describe('character schema', () => {
  it('akzeptiert eine vollständige Figur', () => {
    expect(validateCharacter(VALID_CHARACTER)).toEqual({
      valid: true,
      character: VALID_CHARACTER,
    });
  });

  it('meldet fehlende und ungültige Pflichtwerte gesammelt', () => {
    const result = validateCharacter({
      ...VALID_CHARACTER,
      name: '   ',
      loyalty: 101,
      dialogueIds: [],
      possibleEndStates: [],
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toHaveLength(4);
    }
  });

  it('lehnt falsche Schemaversionen und Nicht-Objekte ab', () => {
    expect(validateCharacter({ ...VALID_CHARACTER, schemaVersion: 2 }).valid).toBe(false);
    expect(validateCharacter(null)).toEqual({
      valid: false,
      issues: ['Figur muss ein Objekt sein.'],
    });
  });
});
