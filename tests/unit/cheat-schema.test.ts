import { describe, expect, it } from 'vitest';
import {
  CHEAT_KEYS, CHEAT_KINDS, CHEAT_MAX_CASH_BONUS, CHEAT_MAX_KEYS,
  CHEAT_MAX_STAT_CHANGE, CHEAT_SCHEMA_VERSION, validateCheat,
} from '../../src/game/cheats/cheat-schema';

const VALID_CHEAT = {
  schemaVersion: CHEAT_SCHEMA_VERSION,
  id: 'cheat-euronen-bonus',
  kind: 'money-bonus',
  title: 'Eine Handvoll Euronen',
  description: 'Ein einmaliger Geldbonus für die nächste Runde.',
  trigger: { kind: 'terminal-word', word: 'euronen86' },
  effect: { kind: 'add-cash', amount: 100 },
  feedback: '100 Euronen gutgeschrieben.',
  marksSave: true,
  restrictsAchievements: true,
} as const;

function expectInvalid(value: unknown, fragment: string): void {
  const result = validateCheat(value);
  expect(result.valid).toBe(false);
  if (!result.valid) expect(result.issues.join(' ')).toContain(fragment);
}

const EFFECT_BY_KIND = {
  'money-bonus': { kind: 'add-cash', amount: 10 },
  'restore-energy': { kind: 'restore-energy', amount: 10 },
  'reduce-heat': { kind: 'reduce-heat', amount: 10 },
  'unlock-location': { kind: 'unlock-location', locationId: 'location-bunker' },
  'retro-theme': { kind: 'retro-theme', theme: 'retro-amber' },
  'debug-stats': { kind: 'show-debug-stats' },
  'chaos-mode': { kind: 'enable-chaos-mode' },
  'secret-character': { kind: 'unlock-character', characterId: 'character-secret' },
  'alternate-ending': { kind: 'alternate-ending', endingId: 'ending-secret' },
  'personal-secret-word': { kind: 'reveal-easter-egg', easterEggId: 'easter-egg-secret' },
} as const;

describe('GAME-0212: versioniertes Cheat-Schema mit Sicherheitsgrenzen', () => {
  it('akzeptiert den sicheren Geldbonus unverändert', () => {
    expect(validateCheat(VALID_CHEAT)).toEqual({ valid: true, cheat: VALID_CHEAT });
  });

  it('unterstützt exakt die zehn vorgeschriebenen Cheat-Arten', () => {
    expect(CHEAT_KINDS).toHaveLength(10);
    expect(new Set(CHEAT_KINDS).size).toBe(10);
  });

  it.each(CHEAT_KINDS)('akzeptiert den vorgesehenen Effekt für %s', (kind) => {
    const cheat = {
      ...VALID_CHEAT, kind, effect: EFFECT_BY_KIND[kind],
      trigger: kind === 'personal-secret-word'
        ? { kind: 'profile-secret-word', profileField: 'secretWord' }
        : VALID_CHEAT.trigger,
    };
    expect(validateCheat(cheat).valid).toBe(true);
  });

  it('prüft alle vier sicheren Auslösewege', () => {
    const triggers = [
      { kind: 'terminal-word', word: 'euro86' },
      { kind: 'key-sequence', keys: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'Enter'] },
      { kind: 'hidden-location-action', locationId: 'location-bunker', actionId: 'action-secret' },
    ];
    for (const trigger of triggers) {
      expect(validateCheat({ ...VALID_CHEAT, trigger }).valid).toBe(true);
    }
    expect(validateCheat({
      ...VALID_CHEAT, kind: 'personal-secret-word',
      trigger: { kind: 'profile-secret-word', profileField: 'secretWord' },
      effect: { kind: 'reveal-easter-egg', easterEggId: 'easter-egg-hidden' },
    }).valid).toBe(true);
  });

  it('akzeptiert obere und untere Wirkungsgrenzen sowie wiederholte Spieltasten', () => {
    for (const amount of [1, CHEAT_MAX_CASH_BONUS]) {
      expect(validateCheat({
        ...VALID_CHEAT, effect: { kind: 'add-cash', amount },
      }).valid).toBe(true);
    }
    for (const kind of ['restore-energy', 'reduce-heat'] as const) {
      for (const amount of [1, CHEAT_MAX_STAT_CHANGE]) {
        expect(validateCheat({
          ...VALID_CHEAT, kind, effect: { kind, amount },
        }).valid).toBe(true);
      }
    }
    expect(validateCheat({
      ...VALID_CHEAT, trigger: { kind: 'key-sequence', keys: Array(CHEAT_MAX_KEYS).fill(CHEAT_KEYS[0]) },
      restrictsAchievements: false,
    }).valid).toBe(true);
  });

  it('weist Nicht-Objekte, fremde Versionen und fehlende Pflichtfelder ab', () => {
    for (const value of [null, [], '', false, 23]) {
      expectInvalid(value, 'Cheat muss ein Objekt sein.');
    }
    expectInvalid({ ...VALID_CHEAT, schemaVersion: 2 }, 'schemaVersion');
    const missing: Record<string, unknown> = { ...VALID_CHEAT };
    delete missing.feedback;
    expectInvalid(missing, 'feedback fehlt');
    const inherited = Object.assign(Object.create({ feedback: 'geerbt' }), { ...VALID_CHEAT });
    delete inherited.feedback;
    expectInvalid(inherited, 'feedback fehlt');
  });

  it('verbietet unbekannte Felder und technische Befehlsfelder auf jeder Ebene', () => {
    expectInvalid({ ...VALID_CHEAT, execute: 'evil()' }, 'unbekanntes Feld');
    expectInvalid({ ...VALID_CHEAT, [Symbol('hidden')]: true }, 'unbekanntes Feld');
    expectInvalid({
      ...VALID_CHEAT, trigger: { kind: 'terminal-word', word: 'euro86', command: 'rm -rf' },
    }, 'unbekanntes Feld');
    expectInvalid({
      ...VALID_CHEAT, effect: { kind: 'add-cash', amount: 100, script: 'eval()' },
    }, 'unbekanntes Feld');
  });

  it.each([
    ['id', 'BAD ID', 'id muss'],
    ['kind', 'free-execution', 'kind muss'],
    ['title', ' ', 'title muss'],
    ['title', 'x'.repeat(101), 'title muss'],
    ['description', '', 'description muss'],
    ['description', 'x'.repeat(501), 'description muss'],
    ['feedback', '', 'feedback muss'],
    ['feedback', 'x'.repeat(201), 'feedback muss'],
    ['marksSave', false, 'marksSave muss'],
    ['restrictsAchievements', 'yes', 'restrictsAchievements muss'],
  ])('weist ungültiges Feld %s zurück', (field, value, message) => {
    expectInvalid({ ...VALID_CHEAT, [field]: value }, message);
  });

  it('weist alle falschen Effekt-Zuordnungen ab', () => {
    for (const kind of CHEAT_KINDS) {
      const mismatched = CHEAT_KINDS.find((other) => other !== kind);
      if (mismatched === undefined) throw new Error('Testfehler: Es fehlt eine zweite Art.');
      expectInvalid({
        ...VALID_CHEAT, kind,
        trigger: kind === 'personal-secret-word'
          ? { kind: 'profile-secret-word', profileField: 'secretWord' }
          : VALID_CHEAT.trigger,
        effect: EFFECT_BY_KIND[mismatched],
      }, 'effect.kind passt nicht');
    }
  });

  it.each([0, -1, 1.5, NaN, Infinity, CHEAT_MAX_CASH_BONUS + 1, '100'])(
    'verbietet ungültigen Geldbetrag %s', (amount) => {
      expectInvalid({ ...VALID_CHEAT, effect: { kind: 'add-cash', amount } }, 'effect.amount');
    },
  );

  it.each([0, -1, 1.5, NaN, Infinity, CHEAT_MAX_STAT_CHANGE + 1, '50'])(
    'verbietet ungültige Änderung eines Spielwerts %s', (amount) => {
      expectInvalid({
        ...VALID_CHEAT, kind: 'restore-energy', effect: { kind: 'restore-energy', amount },
      }, 'effect.amount');
      expectInvalid({
        ...VALID_CHEAT, kind: 'reduce-heat', effect: { kind: 'reduce-heat', amount },
      }, 'effect.amount');
    },
  );

  it('verbietet fremde Tastencodes, Systemtasten und ungeeignete Tastenlisten', () => {
    for (const keys of [[], ['ArrowUp'], Array(CHEAT_MAX_KEYS + 1).fill('Enter'),
      ['Control', 'KeyP'], ['Alt', 'Enter'], ['Meta', 'KeyP'], 'ArrowUp']) {
      expectInvalid({ ...VALID_CHEAT, trigger: { kind: 'key-sequence', keys } }, 'trigger.keys');
    }
  });

  it('erlaubt keine rohen Geheimnisse, gefährliche Worte oder falsch zugewiesene Geheimwörter', () => {
    for (const word of ['ab', 'rm -rf /', 'DROP TABLE', 'a'.repeat(33), 'Ärger', '', 6]) {
      expectInvalid({ ...VALID_CHEAT, trigger: { kind: 'terminal-word', word } }, 'trigger.word');
    }
    expectInvalid({
      ...VALID_CHEAT, trigger: { kind: 'profile-secret-word', profileField: 'secretWord' },
    }, 'nur für personal-secret-word');
    expectInvalid({
      ...VALID_CHEAT, kind: 'personal-secret-word',
      effect: EFFECT_BY_KIND['personal-secret-word'],
    }, 'benötigt profile-secret-word');
    expectInvalid({
      ...VALID_CHEAT, kind: 'personal-secret-word',
      trigger: { kind: 'profile-secret-word', profileField: 'playerName' },
      effect: EFFECT_BY_KIND['personal-secret-word'],
    }, 'trigger.profileField');
  });

  it('lehnt unbekannte Auslöser und ungültige Ortsreferenzen ab', () => {
    expectInvalid({ ...VALID_CHEAT, trigger: { kind: 'browser-api', url: 'https://evil' } }, 'trigger.kind');
    expectInvalid({ ...VALID_CHEAT, trigger: null }, 'trigger muss');
    expectInvalid({
      ...VALID_CHEAT, trigger: { kind: 'hidden-location-action', locationId: 'BAD', actionId: 'action-x' },
    }, 'trigger.locationId');
    expectInvalid({
      ...VALID_CHEAT, trigger: { kind: 'hidden-location-action', locationId: 'location-x' },
    }, 'actionId fehlt');
  });

  it('prüft alle festen Effektarten auf zusätzliche oder ungültige Parameter', () => {
    for (const effect of [
      { kind: 'unlock-location', locationId: '../secret' },
      { kind: 'retro-theme', theme: 'javascript:alert(1)' },
      { kind: 'unlock-character', characterId: 'BAD ID' },
      { kind: 'alternate-ending', endingId: '' },
      { kind: 'reveal-easter-egg', easterEggId: 'BAD' },
    ]) {
      expectInvalid({ ...VALID_CHEAT, effect }, 'effect.');
    }
    expectInvalid({ ...VALID_CHEAT, effect: { kind: 'show-debug-stats', script: 'evil()' } }, 'unbekanntes Feld');
    expectInvalid({ ...VALID_CHEAT, effect: { kind: 'enable-chaos-mode', amount: 999 } }, 'unbekanntes Feld');
    expectInvalid({ ...VALID_CHEAT, effect: { kind: 'remote-code', url: 'http://example.com' } }, 'effect.kind');
  });

  it('erkennt Mehrfachfehler und verändert die Eingaben nicht', () => {
    const broken = {
      ...VALID_CHEAT, title: '  ', marksSave: false,
      effect: { kind: 'add-cash', amount: -100 },
    };
    const original = JSON.stringify(broken);
    const result = validateCheat(broken);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(broken)).toBe(original);
  });
});
