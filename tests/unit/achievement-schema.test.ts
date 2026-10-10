import { describe, expect, it } from 'vitest';

import {
  ACHIEVEMENT_MAX_PROGRESS_TARGET,
  ACHIEVEMENT_MAX_REFERENCES,
  ACHIEVEMENT_SCHEMA_VERSION,
  validateAchievement,
} from '../../src/game/achievements/achievement-schema';

const VALID_ACHIEVEMENT = {
  schemaVersion: ACHIEVEMENT_SCHEMA_VERSION,
  id: 'achievement-bunker-legende',
  title: 'Bunkerlegende',
  description: 'Zeige Ausdauer und Kreativität im Untergrund.',
  visibility: 'visible',
  unlockMode: 'all',
  conditionIds: ['condition-bunker-open', 'condition-crew-loyal'],
  progress: { metricId: 'metric-bunker-gigs', targetCount: 10 },
  cheatPolicy: 'block',
  rewardEffectIds: ['effect-new-title'],
} as const;

function expectInvalid(value: unknown, message: string): void {
  const result = validateAchievement(value);
  expect(result.valid).toBe(false);
  if (!result.valid) expect(result.issues.join(' ')).toContain(message);
}

describe('GAME-0210 – Achievement-Schema V1', () => {
  it('akzeptiert eine vollständige Definition ohne Mutation', () => {
    expect(validateAchievement(VALID_ACHIEVEMENT)).toEqual({
      valid: true,
      achievement: VALID_ACHIEVEMENT,
    });
  });

  it('akzeptiert geheime, nicht durch Cheats gesperrte Erfolge ohne Fortschrittszähler', () => {
    const secret = {
      ...VALID_ACHIEVEMENT,
      visibility: 'secret',
      unlockMode: 'any',
      progress: null,
      cheatPolicy: 'allow',
      rewardEffectIds: [],
    };
    expect(validateAchievement(secret)).toEqual({ valid: true, achievement: secret });
  });

  it('akzeptiert die erlaubten Fortschritts- und Listengrenzen', () => {
    const achievement = {
      ...VALID_ACHIEVEMENT,
      progress: { metricId: 'metric-gigs', targetCount: ACHIEVEMENT_MAX_PROGRESS_TARGET },
      conditionIds: Array.from({ length: ACHIEVEMENT_MAX_REFERENCES }, (_, i) => 'condition-' + (i + 1)),
    };
    expect(validateAchievement(achievement).valid).toBe(true);
    expect(validateAchievement({
      ...VALID_ACHIEVEMENT,
      progress: { metricId: 'metric-gigs', targetCount: 1 },
    }).valid).toBe(true);
  });

  it('lehnt Nicht-Objekte und falsche Schemaversionen ab', () => {
    for (const value of [null, [], false, 99, '']) {
      expectInvalid(value, 'Spielerfolg muss ein Objekt sein.');
    }
    expectInvalid({ ...VALID_ACHIEVEMENT, schemaVersion: 2 }, 'schemaVersion');
    expectInvalid({ ...VALID_ACHIEVEMENT, schemaVersion: '1' }, 'schemaVersion');
  });

  it('lehnt fehlende und unbekannte Felder einschließlich Symbolen ab', () => {
    const missing: Record<string, unknown> = { ...VALID_ACHIEVEMENT };
    delete missing.cheatPolicy;
    expectInvalid(missing, 'cheatPolicy fehlt');
    expectInvalid({ ...VALID_ACHIEVEMENT, admin: true }, 'unbekanntes Feld');
    expectInvalid({ ...VALID_ACHIEVEMENT, [Symbol('hidden')]: true }, 'unbekanntes Feld');
  });

  it.each([
    ['id', 'BAD ID', 'id muss'],
    ['title', ' ', 'title muss'],
    ['title', 'x'.repeat(101), 'title muss'],
    ['description', '', 'description muss'],
    ['description', 'x'.repeat(501), 'description muss'],
    ['visibility', 'hidden', 'visibility muss'],
    ['unlockMode', 'some', 'unlockMode muss'],
    ['cheatPolicy', 'ignore', 'cheatPolicy muss'],
  ])('weist ungültiges Feld %s zurück', (field, invalid, message) => {
    expectInvalid({ ...VALID_ACHIEVEMENT, [field]: invalid }, message);
  });

  it('fordert mindestens eine gültige Freischaltbedingung', () => {
    for (const conditionIds of [[], ['INVALID'], ['same-id', 'same-id'], null, 5]) {
      expectInvalid({ ...VALID_ACHIEVEMENT, conditionIds }, 'conditionIds');
    }
  });

  it('verhindert übergroße, doppelte oder fehlerhafte Effektverweise', () => {
    const tooMany = Array.from(
      { length: ACHIEVEMENT_MAX_REFERENCES + 1 }, (_, i) => 'condition-' + (i + 1),
    );
    expectInvalid({ ...VALID_ACHIEVEMENT, conditionIds: tooMany }, 'conditionIds');
    expectInvalid({ ...VALID_ACHIEVEMENT, rewardEffectIds: ['effect-a', 'effect-a'] }, 'rewardEffectIds');
    expectInvalid({ ...VALID_ACHIEVEMENT, rewardEffectIds: ['bad ID'] }, 'rewardEffectIds');
    expectInvalid({ ...VALID_ACHIEVEMENT, rewardEffectIds: Array(65).fill('effect-a') }, 'rewardEffectIds');
  });

  it.each([0, -1, 1.5, NaN, Infinity, ACHIEVEMENT_MAX_PROGRESS_TARGET + 1, '10', null])(
    'weist ungültigen Fortschrittszielwert %s zurück', (targetCount) => {
      expectInvalid({
        ...VALID_ACHIEVEMENT, progress: { metricId: 'metric-gigs', targetCount },
      }, 'progress.targetCount');
    },
  );

  it('prüft Fortschrittsdaten streng einschließlich fehlender, geerbter und fremder Werte', () => {
    expectInvalid({ ...VALID_ACHIEVEMENT, progress: undefined }, 'progress muss');
    expectInvalid({ ...VALID_ACHIEVEMENT, progress: [] }, 'progress muss');
    expectInvalid({ ...VALID_ACHIEVEMENT, progress: { metricId: 'BAD', targetCount: 1 } }, 'progress.metricId');
    expectInvalid({ ...VALID_ACHIEVEMENT, progress: {
      metricId: 'metric-gigs', targetCount: 1, executable: true,
    } }, 'unbekanntes Feld');
    expectInvalid({ ...VALID_ACHIEVEMENT, progress: { metricId: 'metric-gigs' } }, 'targetCount fehlt');
    const inherited = Object.assign(Object.create({ metricId: 'metric-gigs' }), { targetCount: 1 });
    expectInvalid({ ...VALID_ACHIEVEMENT, progress: inherited }, 'metricId fehlt');
  });

  it('akzeptiert Zahlgrenzen, ohne Berechnungen oder Freischaltungen auszuführen', () => {
    const achievement = structuredClone(VALID_ACHIEVEMENT);
    const old = JSON.stringify(achievement);
    const result = validateAchievement(achievement);
    expect(result.valid).toBe(true);
    expect(JSON.stringify(achievement)).toBe(old);
  });

  it('meldet mehrere ungültige Eingaben in einem einzigen Ergebnis', () => {
    const result = validateAchievement({
      ...VALID_ACHIEVEMENT,
      visibility: 'invisible',
      conditionIds: [],
      cheatPolicy: 'whatever',
      progress: { metricId: 'BAD', targetCount: 0 },
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues.length).toBeGreaterThanOrEqual(4);
  });
});
