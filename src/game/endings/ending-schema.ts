import { validateEntityId } from '../../core/validation/ids';
import { isBoundedString, isIntegerInRange, isRecord } from '../../core/validation/runtime-validation';
import { PLAYER_PROFILE_FIELD_LIMITS, type PlayerProfileField } from '../profile/player-profile';
import type { CampaignMode, GameStatus } from '../state/game-state';

export const ENDING_SCHEMA_VERSION = 1;
export const ENDING_TEXT_LIMITS = { title: 100, description: 500, epilogue: 1600 } as const;
export const ENDING_MAX_REFERENCES = 64;
export const ENDING_MAX_PRIORITY = 1000;

/** Die zwölf im Entwicklungsplan vorgesehenen, unterscheidbaren Enden. */
export const ENDING_KINDS = [
  'underground-legend',
  'clean-icon',
  'euronen-monopoly',
  'crew-family',
  'lonely-top',
  'bureaucratic-collapse',
  'debt',
  'investigation-pressure',
  'moral-integrity',
  'rich-and-abandoned',
  'cultural-breakthrough',
  'chaos-crown',
] as const;
export type EndingKind = (typeof ENDING_KINDS)[number];
export const ENDING_CAMPAIGN_MODES = [
  'classic', 'tycoon', 'clean-legend', 'chaos',
] as const satisfies readonly CampaignMode[];
export type EndingOutcome = Extract<GameStatus, 'won' | 'lost'>;
export type EndingConditionMode = 'all' | 'any';
export type EndingCheatPolicy = 'allow' | 'block';

/**
 * Ausschließlich Daten: die spätere Engine wertet conditionIds nach
 * conditionMode aus; Missionen/Erfolge/Ereignisse und Kampagnenmodus sind
 * ZUSÄTZLICHE Bedingungen. priority ordnet konkurrierende erfüllte Enden.
 * Keine Zustandsänderung, kein Abspann-Rendering und kein externer Zugriff.
 */
export type EndingDefinition = {
  readonly schemaVersion: typeof ENDING_SCHEMA_VERSION;
  readonly id: string;
  readonly kind: EndingKind;
  readonly title: string;
  readonly description: string;
  readonly epilogue: string;
  readonly outcome: EndingOutcome;
  readonly priority: number;
  readonly campaignModes: readonly CampaignMode[];
  readonly conditionMode: EndingConditionMode;
  readonly conditionIds: readonly string[];
  readonly requiredMissionIds: readonly string[];
  readonly requiredAchievementIds: readonly string[];
  readonly requiredEventIds: readonly string[];
  readonly personalizationFields: readonly PlayerProfileField[];
  readonly cheatPolicy: EndingCheatPolicy;
  readonly secret: boolean;
};

export type EndingValidationResult =
  | { readonly valid: true; readonly ending: EndingDefinition }
  | { readonly valid: false; readonly issues: readonly string[] };

const ENDING_FIELDS = [
  'schemaVersion', 'id', 'kind', 'title', 'description', 'epilogue', 'outcome',
  'priority', 'campaignModes', 'conditionMode', 'conditionIds',
  'requiredMissionIds', 'requiredAchievementIds', 'requiredEventIds',
  'personalizationFields', 'cheatPolicy', 'secret',
] as const;
const KIND_SET: ReadonlySet<string> = new Set(ENDING_KINDS);
const MODE_SET: ReadonlySet<string> = new Set(ENDING_CAMPAIGN_MODES);
const PROFILE_FIELD_SET: ReadonlySet<string> = new Set(Object.keys(PLAYER_PROFILE_FIELD_LIMITS));

/** Prüft unbekannte Enddaten vollständig und gibt alle Fundstellen zurück. */
export function validateEnding(value: unknown): EndingValidationResult {
  if (!isRecord(value)) {
    return { valid: false, issues: ['Spielende muss ein Objekt sein.'] };
  }
  const issues: string[] = [];
  checkFields(value, ENDING_FIELDS, 'Spielende', issues);

  if (value.schemaVersion !== ENDING_SCHEMA_VERSION) {
    issues.push('schemaVersion muss 1 sein.');
  }
  checkId(value.id, 'id', issues);
  if (typeof value.kind !== 'string' || !KIND_SET.has(value.kind)) {
    issues.push('kind muss eine der zwölf definierten Endarten sein.');
  }
  checkText(value.title, 'title', ENDING_TEXT_LIMITS.title, issues);
  checkText(value.description, 'description', ENDING_TEXT_LIMITS.description, issues);
  checkEpilogue(value.epilogue, value.personalizationFields, issues);

  if (value.outcome !== 'won' && value.outcome !== 'lost') {
    issues.push('outcome muss won oder lost sein.');
  }
  if (!isIntegerInRange(value.priority, 0, ENDING_MAX_PRIORITY)) {
    issues.push('priority muss eine ganze Zahl zwischen 0 und ' + ENDING_MAX_PRIORITY + ' sein.');
  }
  checkCampaignModes(value.campaignModes, issues);
  if (value.conditionMode !== 'all' && value.conditionMode !== 'any') {
    issues.push('conditionMode muss all oder any sein.');
  }
  checkIdList(value.conditionIds, 'conditionIds', false, issues);
  checkIdList(value.requiredMissionIds, 'requiredMissionIds', true, issues);
  checkIdList(value.requiredAchievementIds, 'requiredAchievementIds', true, issues);
  checkIdList(value.requiredEventIds, 'requiredEventIds', true, issues);
  checkProfileFields(value.personalizationFields, issues);

  if (value.cheatPolicy !== 'allow' && value.cheatPolicy !== 'block') {
    issues.push('cheatPolicy muss allow oder block sein.');
  }
  if (typeof value.secret !== 'boolean') {
    issues.push('secret muss true oder false sein.');
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, ending: value as EndingDefinition };
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
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !fields.includes(key)) {
      issues.push(label + ': unbekanntes Feld ' + String(key) + '.');
    }
  }
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && validateEntityId(value).valid;
}

function checkId(value: unknown, label: string, issues: string[]): void {
  if (!isId(value)) issues.push(label + ' muss eine gültige ID sein.');
}

function checkText(value: unknown, label: string, maximum: number, issues: string[]): void {
  if (!isBoundedString(value, { maxLength: maximum })) {
    issues.push(label + ' muss nichtleeren Text mit höchstens ' + maximum + ' Zeichen enthalten.');
  }
}

function checkIdList(value: unknown, label: string, allowEmpty: boolean, issues: string[]): void {
  if (
    !Array.isArray(value) ||
    value.length < (allowEmpty ? 0 : 1) ||
    value.length > ENDING_MAX_REFERENCES ||
    !value.every(isId) ||
    new Set(value).size !== value.length
  ) {
    issues.push(
      label + ' muss eindeutige gültige IDs enthalten (maximal ' + ENDING_MAX_REFERENCES + ').',
    );
  }
}

function checkCampaignModes(value: unknown, issues: string[]): void {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > ENDING_CAMPAIGN_MODES.length ||
    !value.every((mode: unknown) => typeof mode === 'string' && MODE_SET.has(mode)) ||
    new Set(value).size !== value.length
  ) {
    issues.push('campaignModes muss 1 bis 4 verschiedene gültige Spielmodi enthalten.');
  }
}

function checkProfileFields(value: unknown, issues: string[]): void {
  if (
    !Array.isArray(value) ||
    value.length > Object.keys(PLAYER_PROFILE_FIELD_LIMITS).length ||
    !value.every((field: unknown) => typeof field === 'string' && PROFILE_FIELD_SET.has(field)) ||
    new Set(value).size !== value.length
  ) {
    issues.push('personalizationFields muss eindeutige bekannte Profilfelder enthalten.');
  }
}

function checkEpilogue(value: unknown, fields: unknown, issues: string[]): void {
  if (!isBoundedString(value, { maxLength: ENDING_TEXT_LIMITS.epilogue })) {
    issues.push('epilogue muss nichtleeren Text mit höchstens ' + ENDING_TEXT_LIMITS.epilogue + ' Zeichen enthalten.');
    return;
  }

  // Nur ausdrücklich freigegebene Profileigenschaften als reine Textplatzhalter.
  const withoutTokens = value.replace(/\{\{([^{}]*)\}\}/g, (_match: string, name: string) => {
    if (!PROFILE_FIELD_SET.has(name) || !Array.isArray(fields) || !fields.includes(name)) {
      issues.push('epilogue enthält unbekanntes oder nicht freigegebenes Profilfeld ' + name + '.');
    }
    return '';
  });
  if (withoutTokens.includes('{{') || withoutTokens.includes('}}')) {
    issues.push('epilogue enthält einen unvollständigen Platzhalter.');
  }
}
