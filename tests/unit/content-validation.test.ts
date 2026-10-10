import { describe, expect, it } from 'vitest';
import { CONTENT_CATEGORIES, validateContent } from '../../src/game/content/content-validation';

const event = {
  schemaVersion: 1, id: 'event-demo', title: 'Demotag', description: 'Beschreibung',
  weight: 1, cooldownTurns: 0, conditionIds: [], conflictGroupIds: [],
  repeatLimit: null, effectIds: ['effect-demo'], followUpEventIds: [],
  rngStream: 'event', randomDrawId: 'draw-demo',
};

const character = {
  schemaVersion: 1, id: 'etna-ruppen', name: 'Etna Ruppen',
  role: 'Künstlerin', districtId: 'startbezirk', loyalty: 50, trust: 50,
  risk: 30, skill: 'Kreativ', weakness: 'Misstrauisch', relationship: 'Kontakt',
  dialogueIds: ['dialogue-demo'], missionIds: ['mission-demo'],
  eventIds: ['event-demo'], possibleEndStates: ['active'],
};
const location = {
  schemaVersion: 1, id: 'bunkerclub', name: 'Bunker', districtId: 'startbezirk',
  description: 'Ein Club.', accessConditionIds: [], actionIds: ['action-demo'],
  risks: [{ id: 'risk-demo', severity: 20 }], characterIds: ['etna-ruppen'],
  eventIds: ['event-demo'],
  media: { audioAssetPath: 'audio/bunker.ogg', imageAssetPath: 'images/bunker.webp' },
  accessibilityLabel: 'Club',
};
const mission = {
  schemaVersion: 1, id: 'mission-demo', title: 'Testmission', kind: 'side',
  startConditionIds: [], visibleObjectives: [{ id: 'objective-demo', description: 'Ziel', targetCount: 1 }],
  hiddenObjectives: [], steps: [{ id: 'step-demo', objectiveIds: ['objective-demo'] }],
  timeLimitDays: null, rewardEffectIds: [], riskIds: [],
  failureEffectIds: [], dialogueIds: [], personalizationFields: [], endStateIds: ['ending-demo'],
};
const dialogue = {
  schemaVersion: 1, id: 'dialogue-demo', characterId: 'etna-ruppen',
  startNodeId: 'node-demo', personalizationFields: [],
  nodes: [{ id: 'node-demo', text: 'Hallo.', variants: [], conditionIds: [], choices: [] }],
};
const achievement = {
  schemaVersion: 1, id: 'achievement-demo', title: 'Demo', description: 'Erfolg',
  visibility: 'visible', unlockMode: 'all', conditionIds: ['condition-demo'],
  progress: null, cheatPolicy: 'block', rewardEffectIds: [],
};
const ending = {
  schemaVersion: 1, id: 'ending-demo', kind: 'debt', title: 'Schuldenende',
  description: 'Die Schulden wachsen.', epilogue: 'Das war es.',
  outcome: 'lost', priority: 1, campaignModes: ['classic'],
  conditionMode: 'all', conditionIds: ['condition-debt'],
  requiredMissionIds: [], requiredAchievementIds: [], requiredEventIds: [],
  personalizationFields: [], cheatPolicy: 'allow', secret: false,
};
const cheat = {
  schemaVersion: 1, id: 'cheat-demo', kind: 'money-bonus',
  title: 'Euronen', description: 'Geldbonus',
  trigger: { kind: 'terminal-word', word: 'euronen86' },
  effect: { kind: 'add-cash', amount: 50 }, feedback: 'Geld erhalten',
  marksSave: true, restrictsAchievements: true,
};
const samples = { characters: character, locations: location, missions: mission,
  events: event, dialogues: dialogue, achievements: achievement,
  endings: ending, cheats: cheat,
};

function rejects(category: unknown, value: unknown, fragment: string): void {
  const result = validateContent(category, value);
  expect(result.valid).toBe(false);
  if (!result.valid) expect(result.issues.join(' ')).toContain(fragment);
}

describe('GAME-0215 – Zuordnung zu vorhandenen Inhaltsprüfungen', () => {
  it('erfasst exakt acht bekannte Inhaltsarten', () => {
    expect(CONTENT_CATEGORIES).toHaveLength(8);
    expect(new Set(CONTENT_CATEGORIES).size).toBe(8);
  });

  it.each(CONTENT_CATEGORIES)('prüft eine gültige %s-Definition', (category) => {
    const definition = samples[category];
    const snapshot = JSON.stringify(definition);
    expect(validateContent(category, definition)).toEqual({
      valid: true, category, id: definition.id,
    });
    expect(JSON.stringify(definition)).toBe(snapshot);
  });

  it.each(CONTENT_CATEGORIES)('lehnt kaputtes Schema für %s ab', (category) => {
    rejects(category, { ...samples[category], schemaVersion: 200 }, 'schemaVersion');
    rejects(category, null, 'Objekt');
  });

  it('lehnt unbekannte Kategorien ohne Ausführung von Inhalten ab', () => {
    rejects('executables', { script: 'eval(1)' }, 'Unbekannte Inhaltskategorie');
    rejects('../events', event, 'Unbekannte Inhaltskategorie');
  });

  it('verhindert zusätzliche und geerbte Felder bei Figuren', () => {
    rejects('characters', { ...character, injected: true }, 'unbekanntes Feld');
    rejects('characters', { ...character, [Symbol('hidden')]: true }, 'unbekanntes Feld');
    const inherited = Object.assign(Object.create({ role: 'Geerbt' }), character);
    delete inherited.role;
    rejects('characters', inherited, 'role fehlt');
  });

  it('verhindert unerwartete Felder bei Orten, Medien und Risiken', () => {
    rejects('locations', { ...location, admin: true }, 'unbekanntes Feld');
    rejects('locations', { ...location, media: { ...location.media, script: 'evil()' } }, 'unbekanntes Feld');
    rejects('locations', {
      ...location, risks: [{ id: 'risk-demo', severity: 20, command: 'evil' }],
    }, 'unbekanntes Feld');
  });

  it('findet ungültige interne Schritt-, Knoten- und Selbstreferenzen', () => {
    rejects('missions', {
      ...mission, steps: [{ id: 'step-demo', objectiveIds: ['objective-not-found'] }],
    }, 'unbekanntes Ziel');
    rejects('dialogues', { ...dialogue, startNodeId: 'missing-node' }, 'Start');
    rejects('events', { ...event, followUpEventIds: [event.id] }, 'Selbstreferenz');
  });

  it('lehnt unbekannte Felder und ungültige Grenzen der weiteren Schemas ab', () => {
    rejects('events', { ...event, weight: 0 }, 'weight');
    rejects('achievements', { ...achievement, progress: { metricId: 'metric-demo', targetCount: -1 } }, 'targetCount');
    rejects('endings', { ...ending, priority: 1001 }, 'priority');
    rejects('cheats', { ...cheat, effect: { kind: 'add-cash', amount: 1, command: 'eval' } }, 'unbekanntes Feld');
  });
});
