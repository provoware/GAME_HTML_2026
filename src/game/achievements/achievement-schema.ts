import { validateEntityId } from '../../core/validation/ids';
import { isBoundedString, isIntegerInRange, isRecord } from '../../core/validation/runtime-validation';

export const ACHIEVEMENT_SCHEMA_VERSION = 1;
export const ACHIEVEMENT_TEXT_LIMITS = { title: 100, description: 500 } as const;
export const ACHIEVEMENT_MAX_REFERENCES = 64;
export const ACHIEVEMENT_MAX_PROGRESS_TARGET = 1000000;

export type AchievementVisibility = 'visible' | 'secret';
export type AchievementUnlockMode = 'all' | 'any';
export type AchievementCheatPolicy = 'allow' | 'block';

export type AchievementProgressRequirement = {
  readonly metricId: string;
  readonly targetCount: number;
};

/**
 * Versionierter Inhaltsvertrag für Spielerfolge.
 *
 * conditionIds werden nach unlockMode (all/any) kombiniert. Eine optionale
 * Fortschrittsanforderung muss ZUSÄTZLICH zu diesen Bedingungen erfüllt sein.
 * Die spätere Achievement-Engine wertet die IDs und Zahlen aus; dieses
 * Schema liest keine Spielstände und vergibt keine Erfolge.
 */
export type AchievementDefinition = {
  readonly schemaVersion: typeof ACHIEVEMENT_SCHEMA_VERSION;
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly visibility: AchievementVisibility;
  readonly unlockMode: AchievementUnlockMode;
  readonly conditionIds: readonly string[];
  readonly progress: AchievementProgressRequirement | null;
  readonly cheatPolicy: AchievementCheatPolicy;
  readonly rewardEffectIds: readonly string[];
};

export type AchievementValidationResult =
  | { readonly valid: true; readonly achievement: AchievementDefinition }
  | { readonly valid: false; readonly issues: readonly string[] };

const ACHIEVEMENT_FIELDS = [
  'schemaVersion', 'id', 'title', 'description', 'visibility',
  'unlockMode', 'conditionIds', 'progress', 'cheatPolicy', 'rewardEffectIds',
] as const;
const PROGRESS_FIELDS = ['metricId', 'targetCount'] as const;

/** Liefert verständliche Fehler statt teilweise akzeptierter Inhaltsdaten. */
export function validateAchievement(value: unknown): AchievementValidationResult {
  if (!isRecord(value)) {
    return { valid: false, issues: ['Spielerfolg muss ein Objekt sein.'] };
  }

  const issues: string[] = [];
  checkExactFields(value, ACHIEVEMENT_FIELDS, 'Spielerfolg', issues);

  if (value.schemaVersion !== ACHIEVEMENT_SCHEMA_VERSION) {
    issues.push('schemaVersion muss 1 sein.');
  }
  checkId(value.id, 'id', issues);
  checkText(value.title, 'title', ACHIEVEMENT_TEXT_LIMITS.title, issues);
  checkText(value.description, 'description', ACHIEVEMENT_TEXT_LIMITS.description, issues);

  if (value.visibility !== 'visible' && value.visibility !== 'secret') {
    issues.push('visibility muss visible oder secret sein.');
  }
  if (value.unlockMode !== 'all' && value.unlockMode !== 'any') {
    issues.push('unlockMode muss all oder any sein.');
  }
  checkIdList(value.conditionIds, 'conditionIds', false, issues);
  checkProgress(value.progress, issues);

  if (value.cheatPolicy !== 'allow' && value.cheatPolicy !== 'block') {
    issues.push('cheatPolicy muss allow oder block sein.');
  }
  checkIdList(value.rewardEffectIds, 'rewardEffectIds', true, issues);

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, achievement: value as AchievementDefinition };
}

function checkExactFields(
  object: Readonly<Record<string, unknown>>,
  fields: readonly string[],
  label: string,
  issues: string[],
): void {
  for (const field of fields) {
    if (!Object.hasOwn(object, field)) issues.push(label + ': ' + field + ' fehlt.');
  }
  for (const key of Reflect.ownKeys(object)) {
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

function checkText(value: unknown, label: string, maxLength: number, issues: string[]): void {
  if (!isBoundedString(value, { maxLength })) {
    issues.push(label + ' muss nichtleeren Text mit höchstens ' + maxLength + ' Zeichen enthalten.');
  }
}

function checkIdList(value: unknown, label: string, allowEmpty: boolean, issues: string[]): void {
  if (
    !Array.isArray(value) ||
    value.length < (allowEmpty ? 0 : 1) ||
    value.length > ACHIEVEMENT_MAX_REFERENCES ||
    !value.every(isId) ||
    new Set(value).size !== value.length
  ) {
    issues.push(
      label + ' muss eindeutige gültige IDs enthalten (höchstens ' + ACHIEVEMENT_MAX_REFERENCES + ').',
    );
  }
}

function checkProgress(value: unknown, issues: string[]): void {
  if (value === null) return;
  if (!isRecord(value)) {
    issues.push('progress muss null oder eine Fortschrittsanforderung sein.');
    return;
  }

  checkExactFields(value, PROGRESS_FIELDS, 'progress', issues);
  checkId(value.metricId, 'progress.metricId', issues);
  if (!isIntegerInRange(value.targetCount, 1, ACHIEVEMENT_MAX_PROGRESS_TARGET)) {
    issues.push(
      'progress.targetCount muss eine ganze Zahl zwischen 1 und ' +
        ACHIEVEMENT_MAX_PROGRESS_TARGET + ' sein.',
    );
  }
}
