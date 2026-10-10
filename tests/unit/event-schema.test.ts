import { describe, expect, it } from 'vitest';
import {
  EVENT_SCHEMA_VERSION, EVENT_MAX_LIST_LENGTH, EVENT_MAX_WEIGHT,
  EVENT_MAX_COOLDOWN_TURNS, EVENT_MAX_REPETITIONS, validateEvent,
} from '../../src/game/events/event-schema';

const VALID_EVENT = {
  schemaVersion: EVENT_SCHEMA_VERSION,
  id: 'event-kassettenfund',
  title: 'Verlorenes Tonband gefunden',
  description: 'Eine alte Aufnahme taucht im Bunker wieder auf.',
  weight: 40,
  cooldownTurns: 7,
  conditionIds: ['condition-bunker-open'],
  conflictGroupIds: ['conflict-kassette'],
  repeatLimit: 2,
  effectIds: ['effect-reputation-up'],
  followUpEventIds: ['event-etna-reaction'],
  rngStream: 'event',
  randomDrawId: 'draw-kassettenfund',
} as const;

function expectInvalid(value: unknown, message: string): void {
  const result = validateEvent(value);
  expect(result.valid).toBe(false);
  if (!result.valid) expect(result.issues.join(' ')).toContain(message);
}

describe('GAME-0208: versioniertes Ereignis-Schema', () => {
  it('akzeptiert eine vollständig definierte Veranstaltung ohne Mutation', () => {
    const result = validateEvent(VALID_EVENT);
    expect(result).toEqual({ valid: true, event: VALID_EVENT });
  });

  it('erlaubt null als unbegrenzte Wiederholung und leere optionale ID-Listen', () => {
    expect(validateEvent({
      ...VALID_EVENT, cooldownTurns: 0, repeatLimit: null,
      conditionIds: [], conflictGroupIds: [], followUpEventIds: [],
    }).valid).toBe(true);
  });

  it('akzeptiert exakt die erlaubten Grenzwerte', () => {
    expect(validateEvent({
      ...VALID_EVENT, weight: 1, cooldownTurns: EVENT_MAX_COOLDOWN_TURNS,
      repeatLimit: EVENT_MAX_REPETITIONS,
    }).valid).toBe(true);
    expect(validateEvent({
      ...VALID_EVENT, weight: EVENT_MAX_WEIGHT, cooldownTurns: 0, repeatLimit: 1,
    }).valid).toBe(true);
  });

  it('weist Nicht-Objekte, Versionsänderungen und fehlende Pflichtfelder ab', () => {
    for (const value of [null, [], '', 12]) expectInvalid(value, 'Ereignis muss ein Objekt sein.');
    expectInvalid({ ...VALID_EVENT, schemaVersion: 2 }, 'schemaVersion');
    const withoutField: Record<string, unknown> = { ...VALID_EVENT };
    delete withoutField.rngStream;
    expectInvalid(withoutField, 'rngStream fehlt');
  });

  it('erkennt unbekannte Zusatzfelder sowie symbolische Metadaten', () => {
    expectInvalid({ ...VALID_EVENT, administrator: true }, 'Unbekanntes Ereignisfeld');
    const withSymbol = { ...VALID_EVENT, [Symbol('hidden')]: 'not-allowed' };
    expectInvalid(withSymbol, 'Unbekanntes Ereignisfeld');
  });

  it.each([
    ['id', 'Event Invalid', 'id muss'],
    ['title', '  ', 'title muss'],
    ['title', 'x'.repeat(101), 'title muss'],
    ['description', '', 'description muss'],
    ['description', 'x'.repeat(501), 'description muss'],
    ['randomDrawId', 'BAD DRAW', 'randomDrawId muss'],
    ['rngStream', 'ui', 'rngStream muss'],
  ])('weist ungültiges Feld %s zurück', (field, invalid, message) => {
    expectInvalid({ ...VALID_EVENT, [field]: invalid }, message);
  });

  it.each([0, -1, 1.5, EVENT_MAX_WEIGHT + 1, '100', null, Number.NaN, Infinity])(
    'weist ungültiges Gewicht %s zurück', (weight) => {
      expectInvalid({ ...VALID_EVENT, weight }, 'weight muss');
    },
  );

  it.each([-1, 1.1, EVENT_MAX_COOLDOWN_TURNS + 1, null, '2', NaN, Infinity])(
    'weist ungültige Sperrzeit %s zurück', (cooldownTurns) => {
      expectInvalid({ ...VALID_EVENT, cooldownTurns }, 'cooldownTurns muss');
    },
  );

  it.each([0, -1, 1.5, EVENT_MAX_REPETITIONS + 1, '5', undefined, NaN])(
    'weist ungültige Wiederholungsgrenze %s zurück', (repeatLimit) => {
      expectInvalid({ ...VALID_EVENT, repeatLimit }, 'repeatLimit muss');
    },
  );

  it('verlangt mindestens einen Folgewirkungs-Verweis', () => {
    expectInvalid({ ...VALID_EVENT, effectIds: [] }, 'effectIds');
    expectInvalid({ ...VALID_EVENT, effectIds: null }, 'effectIds');
  });

  it('weist ungültige, doppelte und übergroße ID-Listen für alle Referenzen zurück', () => {
    const fields = [
      'conditionIds', 'conflictGroupIds', 'effectIds', 'followUpEventIds',
    ] as const;
    for (const field of fields) {
      expectInvalid({ ...VALID_EVENT, [field]: ['bad ID'] }, field);
      expectInvalid({ ...VALID_EVENT, [field]: ['same-id', 'same-id'] }, field);
      expectInvalid({
        ...VALID_EVENT, [field]: Array(EVENT_MAX_LIST_LENGTH + 1).fill('some-id'),
      }, field);
      expectInvalid({ ...VALID_EVENT, [field]: { 0: 'fake-id', length: 1 } }, field);
    }
  });

  it('verhindert direkte Ereignis-Selbstverkettung', () => {
    expectInvalid({
      ...VALID_EVENT, followUpEventIds: [VALID_EVENT.id],
    }, 'direkte Selbstreferenz');
  });

  it('aggregiert mehrere Fehler und verändert die Eingabe nicht', () => {
    const broken = { ...VALID_EVENT, weight: 0, cooldownTurns: -1, rngStream: 'unknown' };
    const snapshot = JSON.stringify(broken);
    const result = validateEvent(broken);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(broken)).toBe(snapshot);
  });

  it('weist geerbte statt explizit übergebene Pflichtfelder zurück', () => {
    const inherited = Object.assign(Object.create({ randomDrawId: 'draw-hidden' }), {
      ...VALID_EVENT, randomDrawId: undefined,
    });
    delete inherited.randomDrawId;
    expectInvalid(inherited, 'randomDrawId fehlt');
  });
});
