import { describe, expect, it } from 'vitest';

import {
  createEntityId,
  hasUniqueEntityIds,
  validateEntityId,
  type EntityId,
} from '../../src/core/validation/ids';

describe('validateEntityId', () => {
  it('akzeptiert kleingeschriebene kebab-case IDs', () => {
    expect(validateEntityId('bunkerclub')).toEqual({ valid: true, id: 'bunkerclub' });
    expect(validateEntityId('bar-r-19')).toEqual({ valid: true, id: 'bar-r-19' });
  });

  it('lehnt leere, zu lange oder falsch formatierte IDs ab', () => {
    expect(validateEntityId('').valid).toBe(false);
    expect(validateEntityId('Bunkerclub').valid).toBe(false);
    expect(validateEntityId('bar_r_19').valid).toBe(false);
    expect(validateEntityId('a'.repeat(65)).valid).toBe(false);
  });
});

describe('createEntityId', () => {
  it('liefert typisierte Entity-IDs', () => {
    const locationId = createEntityId('location', 'bunkerclub');

    expect(locationId).toBe('bunkerclub');
  });

  it('meldet ungültige IDs mit Entity-Art', () => {
    expect(() => createEntityId('mission', 'Mission Eins')).toThrow('mission-ID ungültig');
  });
});

describe('hasUniqueEntityIds', () => {
  it('erkennt doppelte IDs', () => {
    const bunkerclub = createEntityId('location', 'bunkerclub');
    const bar = createEntityId('location', 'bar-r-19');

    expect(hasUniqueEntityIds([bunkerclub, bar])).toBe(true);
    expect(hasUniqueEntityIds([bunkerclub, bunkerclub] satisfies readonly EntityId[])).toBe(false);
  });
});
