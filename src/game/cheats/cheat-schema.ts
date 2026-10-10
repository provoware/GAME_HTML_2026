import { validateEntityId } from '../../core/validation/ids';
import { isBoundedString, isIntegerInRange, isRecord } from '../../core/validation/runtime-validation';

export const CHEAT_SCHEMA_VERSION = 1;
export const CHEAT_TEXT_LIMITS = { title: 100, description: 500, feedback: 200 } as const;
export const CHEAT_MAX_WORD_LENGTH = 32;
export const CHEAT_MAX_KEYS = 12;
export const CHEAT_MAX_CASH_BONUS = 1000000;
export const CHEAT_MAX_STAT_CHANGE = 100;

export const CHEAT_KINDS = [
  'money-bonus', 'restore-energy', 'reduce-heat', 'unlock-location',
  'retro-theme', 'debug-stats', 'chaos-mode', 'secret-character',
  'alternate-ending', 'personal-secret-word',
] as const;
export type CheatKind = (typeof CHEAT_KINDS)[number];

export const CHEAT_KEYS = [
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyP', 'KeyO', 'KeyB', 'Enter',
] as const;
export type CheatKey = (typeof CHEAT_KEYS)[number];

export type CheatTrigger =
  | { readonly kind: 'terminal-word'; readonly word: string }
  | { readonly kind: 'key-sequence'; readonly keys: readonly CheatKey[] }
  | { readonly kind: 'profile-secret-word'; readonly profileField: 'secretWord' }
  | { readonly kind: 'hidden-location-action'; readonly locationId: string; readonly actionId: string };

export type CheatEffect =
  | { readonly kind: 'add-cash'; readonly amount: number }
  | { readonly kind: 'restore-energy'; readonly amount: number }
  | { readonly kind: 'reduce-heat'; readonly amount: number }
  | { readonly kind: 'unlock-location'; readonly locationId: string }
  | { readonly kind: 'retro-theme'; readonly theme: 'retro-amber' }
  | { readonly kind: 'show-debug-stats' }
  | { readonly kind: 'enable-chaos-mode' }
  | { readonly kind: 'unlock-character'; readonly characterId: string }
  | { readonly kind: 'alternate-ending'; readonly endingId: string }
  | { readonly kind: 'reveal-easter-egg'; readonly easterEggId: string };

/**
 * Nur feste Auslöser und Effekttypen, nie JavaScript, Shell-Befehle oder URLs.
 * marksSave muss true sein. Die spätere Cheat-Engine übernimmt Clamping,
 * explizite Rückmeldung, Zustandsänderung und dauerhafte Save-Markierung.
 */
export type CheatDefinition = {
  readonly schemaVersion: typeof CHEAT_SCHEMA_VERSION;
  readonly id: string;
  readonly kind: CheatKind;
  readonly title: string;
  readonly description: string;
  readonly trigger: CheatTrigger;
  readonly effect: CheatEffect;
  readonly feedback: string;
  readonly marksSave: true;
  readonly restrictsAchievements: boolean;
};

export type CheatValidationResult =
  | { readonly valid: true; readonly cheat: CheatDefinition }
  | { readonly valid: false; readonly issues: readonly string[] };

const CHEAT_FIELDS = [
  'schemaVersion', 'id', 'kind', 'title', 'description', 'trigger', 'effect',
  'feedback', 'marksSave', 'restrictsAchievements',
] as const;

const EXPECTED_EFFECT: Readonly<Record<CheatKind, CheatEffect['kind']>> = {
  'money-bonus': 'add-cash',
  'restore-energy': 'restore-energy',
  'reduce-heat': 'reduce-heat',
  'unlock-location': 'unlock-location',
  'retro-theme': 'retro-theme',
  'debug-stats': 'show-debug-stats',
  'chaos-mode': 'enable-chaos-mode',
  'secret-character': 'unlock-character',
  'alternate-ending': 'alternate-ending',
  'personal-secret-word': 'reveal-easter-egg',
};
const CHEAT_KIND_SET: ReadonlySet<string> = new Set(CHEAT_KINDS);
const CHEAT_KEY_SET: ReadonlySet<string> = new Set(CHEAT_KEYS);
const WORD_PATTERN = /^[a-z][a-z0-9-]{2,31}$/;

/** Prüft fremde Cheat-Daten und führt niemals selbst eine Wirkung aus. */
export function validateCheat(value: unknown): CheatValidationResult {
  if (!isRecord(value)) return { valid: false, issues: ['Cheat muss ein Objekt sein.'] };

  const issues: string[] = [];
  checkFields(value, CHEAT_FIELDS, 'Cheat', issues);
  if (value.schemaVersion !== CHEAT_SCHEMA_VERSION) issues.push('schemaVersion muss 1 sein.');
  checkId(value.id, 'id', issues);
  if (typeof value.kind !== 'string' || !CHEAT_KIND_SET.has(value.kind)) {
    issues.push('kind muss eine der zehn Cheat-Arten sein.');
  }
  checkText(value.title, 'title', CHEAT_TEXT_LIMITS.title, issues);
  checkText(value.description, 'description', CHEAT_TEXT_LIMITS.description, issues);
  checkTrigger(value.trigger, value.kind, issues);
  checkEffect(value.effect, value.kind, issues);
  checkText(value.feedback, 'feedback', CHEAT_TEXT_LIMITS.feedback, issues);

  if (value.marksSave !== true) issues.push('marksSave muss true sein.');
  if (typeof value.restrictsAchievements !== 'boolean') {
    issues.push('restrictsAchievements muss true oder false sein.');
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, cheat: value as CheatDefinition };
}

function checkFields(
  value: Readonly<Record<string, unknown>>,
  fields: readonly string[],
  label: string,
  issues: string[],
): void {
  for (const field of fields) {
    if (!Object.hasOwn(value, field)) issues.push(label + ': ' + field + ' fehlt.');
  }
  for (const field of Reflect.ownKeys(value)) {
    if (typeof field !== 'string' || !fields.includes(field)) {
      issues.push(label + ': unbekanntes Feld ' + String(field) + '.');
    }
  }
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && validateEntityId(value).valid;
}
function checkId(value: unknown, label: string, issues: string[]): void {
  if (!isId(value)) issues.push(label + ' muss eine gültige ID sein.');
}
function checkText(value: unknown, label: string, maxLength: number, issues: string[]): void {
  if (!isBoundedString(value, { maxLength })) {
    issues.push(label + ' muss nichtleeren Text mit höchstens ' + maxLength + ' Zeichen enthalten.');
  }
}

function checkTrigger(value: unknown, cheatKind: unknown, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push('trigger muss ein gültiges Auslöser-Objekt sein.');
    return;
  }
  switch (value.kind) {
    case 'terminal-word':
      checkFields(value, ['kind', 'word'], 'trigger', issues);
      if (typeof value.word !== 'string' || !WORD_PATTERN.test(value.word)) {
        issues.push('trigger.word muss 3 bis ' + CHEAT_MAX_WORD_LENGTH + ' kleine ASCII-Zeichen enthalten.');
      }
      break;
    case 'key-sequence':
      checkFields(value, ['kind', 'keys'], 'trigger', issues);
      if (
        !Array.isArray(value.keys) || value.keys.length < 2 ||
        value.keys.length > CHEAT_MAX_KEYS ||
        !value.keys.every((key: unknown) => typeof key === 'string' && CHEAT_KEY_SET.has(key))
      ) {
        issues.push('trigger.keys benötigt 2 bis ' + CHEAT_MAX_KEYS + ' erlaubte Spieltasten ohne Systemtasten.');
      }
      break;
    case 'profile-secret-word':
      checkFields(value, ['kind', 'profileField'], 'trigger', issues);
      if (value.profileField !== 'secretWord') {
        issues.push('trigger.profileField muss secretWord sein.');
      }
      break;
    case 'hidden-location-action':
      checkFields(value, ['kind', 'locationId', 'actionId'], 'trigger', issues);
      checkId(value.locationId, 'trigger.locationId', issues);
      checkId(value.actionId, 'trigger.actionId', issues);
      break;
    default:
      issues.push('trigger.kind muss eine der vier erlaubten Auslösearten sein.');
  }

  if (cheatKind === 'personal-secret-word' && value.kind !== 'profile-secret-word') {
    issues.push('personal-secret-word benötigt profile-secret-word als Auslöser.');
  } else if (cheatKind !== 'personal-secret-word' && value.kind === 'profile-secret-word') {
    issues.push('profile-secret-word ist nur für personal-secret-word erlaubt.');
  }
}

function checkEffect(value: unknown, cheatKind: unknown, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push('effect muss ein gültiges Wirkungs-Objekt sein.');
    return;
  }

  switch (value.kind) {
    case 'add-cash':
      checkFields(value, ['kind', 'amount'], 'effect', issues);
      if (!isIntegerInRange(value.amount, 1, CHEAT_MAX_CASH_BONUS)) {
        issues.push('effect.amount muss für Geld zwischen 1 und ' + CHEAT_MAX_CASH_BONUS + ' liegen.');
      }
      break;
    case 'restore-energy':
    case 'reduce-heat':
      checkFields(value, ['kind', 'amount'], 'effect', issues);
      if (!isIntegerInRange(value.amount, 1, CHEAT_MAX_STAT_CHANGE)) {
        issues.push('effect.amount muss für Spielwerte zwischen 1 und ' + CHEAT_MAX_STAT_CHANGE + ' liegen.');
      }
      break;
    case 'unlock-location':
      checkFields(value, ['kind', 'locationId'], 'effect', issues);
      checkId(value.locationId, 'effect.locationId', issues);
      break;
    case 'retro-theme':
      checkFields(value, ['kind', 'theme'], 'effect', issues);
      if (value.theme !== 'retro-amber') issues.push('effect.theme muss retro-amber sein.');
      break;
    case 'show-debug-stats':
    case 'enable-chaos-mode':
      checkFields(value, ['kind'], 'effect', issues);
      break;
    case 'unlock-character':
      checkFields(value, ['kind', 'characterId'], 'effect', issues);
      checkId(value.characterId, 'effect.characterId', issues);
      break;
    case 'alternate-ending':
      checkFields(value, ['kind', 'endingId'], 'effect', issues);
      checkId(value.endingId, 'effect.endingId', issues);
      break;
    case 'reveal-easter-egg':
      checkFields(value, ['kind', 'easterEggId'], 'effect', issues);
      checkId(value.easterEggId, 'effect.easterEggId', issues);
      break;
    default:
      issues.push('effect.kind muss eine der zehn erlaubten Wirkungen sein.');
  }

  if (typeof cheatKind === 'string' && CHEAT_KIND_SET.has(cheatKind)) {
    const expected = EXPECTED_EFFECT[cheatKind as CheatKind];
    if (value.kind !== expected) issues.push('effect.kind passt nicht zur Cheat-Art ' + cheatKind + '.');
  }
}
