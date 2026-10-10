import { describe, expect, it } from 'vitest';
import {
  MISSION_KINDS,
  MISSION_MAX_LIST_LENGTH,
  MISSION_SCHEMA_VERSION,
  validateMission,
} from '../../src/game/missions/mission-schema';

const VALID_MISSION = {
  schemaVersion: MISSION_SCHEMA_VERSION,
  id: 'mission-bunker-kassette',
  title: 'Das verlorene Band',
  kind: 'side',
  startConditionIds: ['flag-bunker-offen'],
  visibleObjectives: [{ id: 'objective-find-band', description: 'Band sichern', targetCount: 1 }],
  hiddenObjectives: [{ id: 'objective-friendship', description: 'Vertrauen gewinnen', targetCount: 2 }],
  steps: [
    { id: 'step-find', objectiveIds: ['objective-find-band'] },
    { id: 'step-trust', objectiveIds: ['objective-friendship'] },
  ],
  timeLimitDays: 14,
  rewardEffectIds: ['reward-reputation'],
  riskIds: ['risk-crew-conflict'],
  failureEffectIds: ['effect-lost-trust'],
  dialogueIds: ['dialogue-etna'],
  personalizationFields: ['crewName'],
  endStateIds: ['ending-band-saved', 'ending-band-lost'],
} as const;

function expectInvalid(input: unknown, match: string): void {
  const result = validateMission(input);
  expect(result.valid).toBe(false);
  if (!result.valid) expect(result.issues.join(' ')).toContain(match);
}

describe('GAME-0207: Missions-Schema', () => {
  it('akzeptiert eine vollständige Version-1-Mission ohne Mutation', () => {
    const result = validateMission(VALID_MISSION);
    expect(result).toEqual({ valid: true, mission: VALID_MISSION });
  });

  it.each(MISSION_KINDS)('erlaubt Missionsart %s', (kind) => {
    expect(validateMission({ ...VALID_MISSION, kind }).valid).toBe(true);
  });

  it('akzeptiert ausdrücklich fristlose Missionen ohne versteckte Ziele', () => {
    const result = validateMission({
      ...VALID_MISSION,
      timeLimitDays: null,
      hiddenObjectives: [],
      steps: [{ id: 'step-find', objectiveIds: ['objective-find-band'] }],
      startConditionIds: [], rewardEffectIds: [], riskIds: [],
      failureEffectIds: [], dialogueIds: [], personalizationFields: [],
    });
    expect(result.valid).toBe(true);
  });

  it('weist Nicht-Objekte, unbekannte Felder und ungültige Versionen zurück', () => {
    expect(validateMission(null)).toEqual({ valid: false, issues: ['Mission muss ein Objekt sein.'] });
    expectInvalid({ ...VALID_MISSION, schemaVersion: 2 }, 'schemaVersion');
    expectInvalid({ ...VALID_MISSION, forbidden: true }, 'unbekanntes Feld');
    const withoutTitle = { ...VALID_MISSION } as Record<string, unknown>;
    delete withoutTitle.title;
    expectInvalid(withoutTitle, 'title fehlt');
  });

  it('weist ungültige Texte, IDs, Arten und Zeitlimits zurück', () => {
    expectInvalid({ ...VALID_MISSION, id: 'Invalid ID' }, 'id muss');
    expectInvalid({ ...VALID_MISSION, title: '  ' }, 'title muss');
    expectInvalid({ ...VALID_MISSION, title: 'x'.repeat(101) }, 'title muss');
    expectInvalid({ ...VALID_MISSION, kind: 'unknown' }, 'kind muss');
    for (const timeLimitDays of [0, -1, 366, 1.5, Number.NaN, '14', undefined]) {
      expectInvalid({ ...VALID_MISSION, timeLimitDays }, 'timeLimitDays');
    }
  });

  it('verhindert falsche Ziele, doppelte IDs und übergroße Listen', () => {
    expectInvalid({ ...VALID_MISSION, visibleObjectives: [] }, 'visibleObjectives');
    expectInvalid({ ...VALID_MISSION, steps: [] }, 'steps');
    expectInvalid({ ...VALID_MISSION, endStateIds: [] }, 'endStateIds');
    expectInvalid({
      ...VALID_MISSION,
      visibleObjectives: [{ id: 'goal', description: '', targetCount: 0 }],
    }, 'targetCount');
    expectInvalid({
      ...VALID_MISSION,
      visibleObjectives: [{ id: 'goal', description: 'x'.repeat(241), targetCount: 1 }],
    }, 'description');
    expectInvalid({ ...VALID_MISSION, startConditionIds: ['flag-a', 'flag-a'] }, 'startConditionIds');
    expectInvalid({
      ...VALID_MISSION, dialogueIds: Array(MISSION_MAX_LIST_LENGTH + 1).fill('dialogue-a'),
    }, 'dialogueIds');
    expectInvalid({ ...VALID_MISSION, personalizationFields: ['doesNotExist'] }, 'personalizationFields');
    expectInvalid({
      ...VALID_MISSION,
      steps: [{ id: 'step-overflow', objectiveIds: Array(MISSION_MAX_LIST_LENGTH + 1).fill('objective-find-band') }],
    }, 'objectiveIds');
    expectInvalid({
      ...VALID_MISSION,
      steps: [{ id: 'step-find', objectiveIds: ['goal-a', 'goal-a'] }],
    }, 'objectiveIds');
  });

  it('sperrt ungültige Schrittreferenzen und nicht erreichbare Ziele', () => {
    expectInvalid({ ...VALID_MISSION, steps: [
      { id: 'step-one', objectiveIds: ['unknown-goal'] },
    ] }, 'unbekanntes Ziel');
    expectInvalid({ ...VALID_MISSION, steps: [
      { id: 'step-one', objectiveIds: ['objective-find-band'] },
    ] }, 'objective-friendship wird von keinem Schritt');
    expectInvalid({ ...VALID_MISSION, hiddenObjectives: [
      { id: 'objective-find-band', description: 'Doppelt', targetCount: 1 },
    ] }, 'teilen Ziel-IDs');
    expectInvalid({ ...VALID_MISSION, steps: [
      { id: 'step-a', objectiveIds: ['objective-find-band'] },
      { id: 'step-b', objectiveIds: ['objective-find-band', 'objective-friendship'] },
    ] }, 'mehrfach in Schritten');
  });

  it('meldet mehrere Fehler gemeinsam, ohne Teilobjekte auszuführen', () => {
    const result = validateMission({ ...VALID_MISSION, title: ' ', kind: 'other', timeLimitDays: -1 });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues.length).toBeGreaterThanOrEqual(3);
  });
});
