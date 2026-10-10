import { describe, expect, it } from 'vitest';

import {
  isBoundedString,
  isIntegerInRange,
  isIsoTimestamp,
  isRecord,
} from '../../src/core/validation/runtime-validation';

describe('runtime validation', () => {
  it('prüft begrenzte und nicht leere Texte', () => {
    expect(isBoundedString('Etna', { maxLength: 5 })).toBe(true);
    expect(isBoundedString('   ', { maxLength: 5 })).toBe(false);
    expect(isBoundedString('Etnaaa', { maxLength: 5 })).toBe(false);
    expect(isBoundedString('', { maxLength: 5, allowBlank: true })).toBe(true);
  });

  it('prüft sichere Ganzzahlen innerhalb der Grenzen', () => {
    expect(isIntegerInRange(0, 0, 100)).toBe(true);
    expect(isIntegerInRange(100, 0, 100)).toBe(true);
    expect(isIntegerInRange(1.5, 0, 100)).toBe(false);
    expect(isIntegerInRange(101, 0, 100)).toBe(false);
  });

  it('prüft ISO-Zeitstempel und einfache Objekte', () => {
    expect(isIsoTimestamp('1986-01-01T08:00:00.000Z')).toBe(true);
    expect(isIsoTimestamp('1986-01-01')).toBe(false);
    expect(isRecord({ name: 'Etna' })).toBe(true);
    expect(isRecord([])).toBe(false);
  });
});
