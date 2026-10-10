import { describe, expect, it } from 'vitest';
import {
  DIALOGUE_MAX_CHOICES, DIALOGUE_MAX_NODES, DIALOGUE_MAX_VARIANTS,
  DIALOGUE_MAX_REFS, DIALOGUE_SCHEMA_VERSION, validateDialogue,
} from '../../src/game/dialogue/dialogue-schema';

const VALID_DIALOGUE = {
  schemaVersion: DIALOGUE_SCHEMA_VERSION,
  id: 'dialogue-etna-intro',
  characterId: 'etna-ruppen',
  startNodeId: 'node-intro',
  personalizationFields: ['crewName'],
  nodes: [
    {
      id: 'node-intro',
      text: 'Du bist von {{crewName}}?',
      variants: ['Deine Crew {{crewName}} ist also hier?'],
      conditionIds: ['condition-bunker-open'],
      choices: [
        {
          id: 'choice-help',
          label: 'Wir helfen dir.',
          conditionIds: [],
          effectIds: ['effect-goodwill'],
          relationshipChanges: [{ characterId: 'etna-ruppen', trustDelta: 10, loyaltyDelta: 0 }],
          startMissionIds: ['mission-find-tape'],
          nextNodeId: 'node-goodbye',
          deceptive: false,
        },
        {
          id: 'choice-lie',
          label: 'Ich verspreche etwas, das nicht stimmt.',
          conditionIds: ['condition-crew-secret'],
          effectIds: [],
          relationshipChanges: [],
          startMissionIds: [],
          nextNodeId: null,
          deceptive: true,
        },
      ],
    },
    {
      id: 'node-goodbye', text: 'Dann los.', variants: [],
      conditionIds: [], choices: [],
    },
  ],
} as const;

function reject(value: unknown, includes: string): void {
  const result = validateDialogue(value);
  expect(result.valid).toBe(false);
  if (!result.valid) expect(result.issues.join(' ')).toContain(includes);
}
type TestChoice = {
  [key: string]: unknown;
  id: string;
  relationshipChanges: Record<string, unknown>[];
};
type TestNode = {
  [key: string]: unknown;
  id: string;
  choices: TestChoice[];
};
type TestDialogue = {
  [key: string]: unknown;
  nodes: TestNode[];
  startNodeId: string;
};
const copy = (): TestDialogue => structuredClone(VALID_DIALOGUE) as unknown as TestDialogue;

describe('GAME-0209 – Dialogdaten und Verzweigungen', () => {
  it('akzeptiert ein gültiges mehrstufiges Gespräch, inklusive Personalisierung', () => {
    expect(validateDialogue(VALID_DIALOGUE)).toEqual({ valid: true, dialogue: VALID_DIALOGUE });
  });
  it('akzeptiert einen einzelnen abgeschlossenen Knoten ohne Entscheidungen', () => {
    const dialogue = { ...VALID_DIALOGUE, personalizationFields: [],
      nodes: [{ id: 'start', text: 'Guten Tag.', variants: [], conditionIds: [], choices: [] }],
      startNodeId: 'start',
    };
    expect(validateDialogue(dialogue).valid).toBe(true);
  });
  it('lehnt ungültige Versionen, Nichtobjekte und unbekannte Felder ab', () => {
    for (const x of [null, [], false, '']) reject(x, 'Dialog muss ein Objekt sein.');
    reject({ ...VALID_DIALOGUE, schemaVersion: 2 }, 'schemaVersion');
    reject({ ...VALID_DIALOGUE, unexpected: true }, 'unbekanntes Feld');
    const missing: Record<string, unknown> = { ...VALID_DIALOGUE };
    delete missing.nodes;
    reject(missing, 'nodes fehlt');
    reject({ ...VALID_DIALOGUE, [Symbol('meta')]: true }, 'unbekanntes Feld');
  });
  it('prüft IDs, fehlende oder unbekannte verschachtelte Felder und Textgrenzen', () => {
    reject({ ...VALID_DIALOGUE, id: 'UPPER CASE' }, 'id muss');
    reject({ ...VALID_DIALOGUE, characterId: 3 }, 'characterId muss');
    const c = copy(); c.nodes[0].bad = true;
    reject(c, 'unbekanntes Feld');
    const d = copy(); delete d.nodes[0].choices[0].deceptive;
    reject(d, 'deceptive fehlt');
    const e = copy(); e.nodes[0].text = 'x'.repeat(601);
    reject(e, 'text muss');
    const f = copy(); f.nodes[0].choices[0].label = '';
    reject(f, 'label muss');
  });
  it('lehnt ungültige Platzhalter und nicht freigegebene Profilfelder ab', () => {
    const wrong = copy(); wrong.nodes[0].text = 'Hallo {{secretWord}}';
    reject(wrong, 'nicht freigegebenes Profilfeld');
    const broken = copy(); broken.nodes[0].text = 'Hallo {{crewName';
    reject(broken, 'unvollständigen Platzhalter');
    const invalid = copy(); invalid.personalizationFields = ['missingField'];
    reject(invalid, 'personalizationFields');
    const duplicate = copy(); duplicate.personalizationFields = ['crewName', 'crewName'];
    reject(duplicate, 'personalizationFields');
    const alt = copy(); alt.nodes[0].variants = ['{{secretWord}}'];
    reject(alt, 'nicht freigegebenes Profilfeld');
  });
  it('weist doppelte Knoten, Entscheidungen, Varianten und Referenzen zurück', () => {
    const a = copy(); a.nodes[1].id = 'node-intro'; reject(a, 'doppelte Knoten');
    const b = copy(); b.nodes[0].choices[1].id = 'choice-help'; reject(b, 'doppelte Entscheidungs');
    const c = copy(); c.nodes[0].variants = [c.nodes[0].text]; reject(c, 'doppelte Texte');
    const d = copy(); d.nodes[0].conditionIds = ['same-id', 'same-id']; reject(d, 'conditionIds');
    const e = copy(); e.nodes[0].choices[0].startMissionIds = ['x', 'x']; reject(e, 'startMissionIds');
  });
  it('prüft Grenzen und ungültige Listen frühzeitig', () => {
    const a = copy(); a.nodes = Array(DIALOGUE_MAX_NODES + 1).fill(a.nodes[0]); reject(a, 'nodes muss');
    const b = copy(); b.nodes[0].choices = Array(DIALOGUE_MAX_CHOICES + 1).fill(b.nodes[0].choices[0]);
    reject(b, 'choices');
    const c = copy(); c.nodes[0].variants = Array(DIALOGUE_MAX_VARIANTS + 1).fill('hi');
    reject(c, 'variants');
    const d = copy(); d.nodes[0].conditionIds = Array(DIALOGUE_MAX_REFS + 1).fill('condition-b');
    reject(d, 'conditionIds');
    const e = copy(); e.nodes[0].choices[0].conditionIds = {};
    reject(e, 'conditionIds');
  });
  it('verbietet wirkungslose Entscheidungen außer ausdrücklicher Täuschung', () => {
    const dialogue = copy(); dialogue.nodes[0].choices[0].effectIds = [];
    dialogue.nodes[0].choices[0].relationshipChanges = [];
    dialogue.nodes[0].choices[0].startMissionIds = [];
    reject(dialogue, 'nachvollziehbare Folge');
    dialogue.nodes[0].choices[0].deceptive = true;
    expect(validateDialogue(dialogue).valid).toBe(true);
  });
  it('prüft Beziehungsänderungen, Grenzen und eindeutige Figuren', () => {
    const a = copy(); a.nodes[0].choices[0].relationshipChanges[0].trustDelta = 101;
    reject(a, 'trustDelta');
    const b = copy(); b.nodes[0].choices[0].relationshipChanges[0].loyaltyDelta = 1.5;
    reject(b, 'loyaltyDelta');
    const c = copy(); c.nodes[0].choices[0].relationshipChanges[0].trustDelta = 0;
    reject(c, 'wirkungslose Beziehungsänderung');
    const d = copy(); d.nodes[0].choices[0].relationshipChanges.push(
      { characterId: 'etna-ruppen', trustDelta: 1, loyaltyDelta: 0 },
    );
    reject(d, 'doppelte Figuren');
    const e = copy(); e.nodes[0].choices[0].deceptive = 'yes';
    reject(e, 'deceptive muss');
  });
  it('verhindert ungültige Ziele und unerreichbare Dialogknoten', () => {
    const a = copy(); a.startNodeId = 'missing'; reject(a, 'startNodeId verweist');
    const b = copy(); b.nodes[0].choices[0].nextNodeId = 'missing-node';
    reject(b, 'unbekannten Knoten');
    const c = copy(); c.nodes[0].choices[0].nextNodeId = null;
    reject(c, 'nicht erreichbar');
    const d = copy(); d.nodes[0].choices[0].nextNodeId = 7;
    reject(d, 'nextNodeId muss');
  });
  it('weist Endlosschleifen ohne Abschlussweg zurück', () => {
    const a = copy();
    a.nodes[0].choices = [a.nodes[0].choices[0]];
    a.nodes[1].choices = [{
      id: 'choice-repeat', label: 'Noch mal.', conditionIds: [],
      effectIds: ['effect-repeat'], relationshipChanges: [], startMissionIds: [],
      nextNodeId: 'node-intro', deceptive: false,
    }];
    reject(a, 'keinen Weg zu einem Gesprächsende');
  });
  it('akzeptiert Zyklen mit gesichertem Ausweg', () => {
    const a = copy();
    a.nodes[1].choices = [{
      id: 'choice-repeat', label: 'Nochmal?', conditionIds: [],
      effectIds: ['effect-repeat'], relationshipChanges: [], startMissionIds: [],
      nextNodeId: 'node-intro', deceptive: false,
    }, {
      id: 'choice-exit', label: 'Ende.', conditionIds: [],
      effectIds: ['effect-goodbye'], relationshipChanges: [], startMissionIds: [],
      nextNodeId: null, deceptive: false,
    }];
    expect(validateDialogue(a).valid).toBe(true);
  });
  it('sammelt mehrere Probleme und verändert die Eingabe nicht', () => {
    const a = copy(); a.schemaVersion = 999; a.id = 'No!';
    const before = JSON.stringify(a);
    const result = validateDialogue(a);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues.length).toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(a)).toBe(before);
  });
});
