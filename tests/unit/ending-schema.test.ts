import { describe, expect, it } from 'vitest';
import {
  ENDING_CAMPAIGN_MODES, ENDING_KINDS, ENDING_MAX_PRIORITY, ENDING_MAX_REFERENCES,
  ENDING_SCHEMA_VERSION, validateEnding,
} from '../../src/game/endings/ending-schema';

const VALID_ENDING = {
  schemaVersion: ENDING_SCHEMA_VERSION,
  id: 'ending-underground-legend',
  kind: 'underground-legend',
  title: 'Untergrundlegende',
  description: 'Die Crew hat sich ihren Platz in der Geschichte erkämpft.',
  epilogue: 'Die {{crewName}} bleibt in Erinnerung.',
  outcome: 'won',
  priority: 700,
  campaignModes: ['classic', 'tycoon'],
  conditionMode: 'all',
  conditionIds: ['condition-reputation', 'condition-gigs'],
  requiredMissionIds: ['mission-last-gig'],
  requiredAchievementIds: ['achievement-bunker-legende'],
  requiredEventIds: ['event-radio-breakthrough'],
  personalizationFields: ['crewName'],
  cheatPolicy: 'block',
  secret: false,
} as const;

function reject(input: unknown, pattern: string): void {
  const result = validateEnding(input);
  expect(result.valid).toBe(false);
  if (!result.valid) expect(result.issues.join(' ')).toContain(pattern);
}

describe('GAME-0211 – versioniertes Spielenden-Schema', () => {
  it('akzeptiert vollständige Siegesdaten ohne Mutation', () => {
    expect(validateEnding(VALID_ENDING)).toEqual({ valid: true, ending: VALID_ENDING });
  });

  it('bildet exakt die zwölf vorgeschriebenen Endarten ab', () => {
    expect(ENDING_KINDS).toHaveLength(12);
    expect(new Set(ENDING_KINDS).size).toBe(12);
  });

  it.each(ENDING_KINDS)('akzeptiert Spielende %s', (kind) => {
    expect(validateEnding({ ...VALID_ENDING, kind }).valid).toBe(true);
  });

  it('akzeptiert eine geheime Niederlage in allen Spielmodi ohne optionale Bezüge', () => {
    const ending = {
      ...VALID_ENDING,
      id: 'ending-debt',
      kind: 'debt',
      title: 'Schulden-Ende',
      epilogue: 'Ein stiller Abgang.',
      outcome: 'lost',
      priority: 0,
      campaignModes: [...ENDING_CAMPAIGN_MODES],
      conditionMode: 'any',
      conditionIds: ['condition-debt-limit'],
      requiredMissionIds: [],
      requiredAchievementIds: [],
      requiredEventIds: [],
      personalizationFields: [],
      cheatPolicy: 'allow',
      secret: true,
    };
    expect(validateEnding(ending)).toEqual({ valid: true, ending });
  });

  it('akzeptiert die erlaubten Zahl-, Text- und Listenobergrenzen', () => {
    expect(validateEnding({
      ...VALID_ENDING,
      priority: ENDING_MAX_PRIORITY,
      title: 'T'.repeat(100),
      description: 'D'.repeat(500),
      epilogue: 'E'.repeat(1600),
      conditionIds: Array.from({ length: ENDING_MAX_REFERENCES }, (_, index) => 'condition-' + (index + 1)),
    }).valid).toBe(true);
  });

  it('lehnt Nichtobjekte, alte Versionen und vererbte Pflichtfelder ab', () => {
    for (const value of [null, undefined, [], '', 12, false]) {
      reject(value, 'Spielende muss ein Objekt sein.');
    }
    reject({ ...VALID_ENDING, schemaVersion: 2 }, 'schemaVersion');
    const missing: Record<string, unknown> = { ...VALID_ENDING };
    delete missing.title;
    reject(missing, 'title fehlt');
    const inherited = Object.assign(Object.create({ title: VALID_ENDING.title }), { ...VALID_ENDING });
    delete inherited.title;
    reject(inherited, 'title fehlt');
  });

  it('lehnt unbekannte Zusatzfelder einschließlich Symbolen ab', () => {
    reject({ ...VALID_ENDING, injected: true }, 'unbekanntes Feld');
    reject({ ...VALID_ENDING, [Symbol('hidden')]: true }, 'unbekanntes Feld');
  });

  it.each([
    ['id', 'BAD ID', 'id muss'],
    ['kind', 'another-ending', 'kind muss'],
    ['title', '  ', 'title muss'],
    ['title', 'X'.repeat(101), 'title muss'],
    ['description', '', 'description muss'],
    ['description', 'X'.repeat(501), 'description muss'],
    ['epilogue', ' ', 'epilogue muss'],
    ['epilogue', 'X'.repeat(1601), 'epilogue muss'],
    ['outcome', 'draw', 'outcome muss'],
    ['conditionMode', 'none', 'conditionMode muss'],
    ['cheatPolicy', 'ignore', 'cheatPolicy muss'],
    ['secret', 'false', 'secret muss'],
  ])('weist ungültiges Feld %s zurück', (field, invalid, message) => {
    reject({ ...VALID_ENDING, [field]: invalid }, message);
  });

  it.each([-1, 1001, 0.5, NaN, Infinity, '5', null])(
    'weist ungültige Priorität %s zurück', (priority) => {
      reject({ ...VALID_ENDING, priority }, 'priority');
    },
  );

  it('verhindert unbekannte oder doppelte Spielmodi und ungültige Modus-Listen', () => {
    for (const campaignModes of [[], ['classic', 'classic'], ['invalid'], [3], null, 'classic', [...ENDING_CAMPAIGN_MODES, 'classic']]) {
      reject({ ...VALID_ENDING, campaignModes }, 'campaignModes');
    }
  });

  it('fordert mindestens eine Freischaltbedingung', () => {
    for (const conditionIds of [[], null, ['BAD ID'], ['same-id', 'same-id'], Array(65).fill('same-id')]) {
      reject({ ...VALID_ENDING, conditionIds }, 'conditionIds');
    }
  });

  it.each(['requiredMissionIds', 'requiredAchievementIds', 'requiredEventIds'])(
    'prüft die Verknüpfungen in %s',
    (field) => {
      for (const invalid of [['bad ID'], ['same-id', 'same-id'], Array(65).fill('same-id'), 12, null]) {
        reject({ ...VALID_ENDING, [field]: invalid }, field);
      }
    },
  );

  it('verbietet ungeprüfte und doppelte Personalisierungsfelder', () => {
    reject({ ...VALID_ENDING, personalizationFields: ['unknown'] }, 'personalizationFields');
    reject({ ...VALID_ENDING, personalizationFields: ['crewName', 'crewName'] }, 'personalizationFields');
    reject({ ...VALID_ENDING, epilogue: '{{secretWord}}' }, 'nicht freigegebenes Profilfeld');
    reject({ ...VALID_ENDING, epilogue: '{{crewName' }, 'unvollständigen Platzhalter');
    reject({ ...VALID_ENDING, epilogue: '{{unknown}}' }, 'nicht freigegebenes Profilfeld');
    expect(validateEnding({
      ...VALID_ENDING, personalizationFields: ['crewName', 'playerName'],
      epilogue: '{{crewName}} und {{playerName}}.',
    }).valid).toBe(true);
  });

  it('sammelt verschiedene Fehler und verändert den Eingabewert nicht', () => {
    const ending = { ...VALID_ENDING, priority: -1, conditionIds: [], outcome: 'aborted' };
    const old = JSON.stringify(ending);
    const result = validateEnding(ending);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(ending)).toBe(old);
  });
});
