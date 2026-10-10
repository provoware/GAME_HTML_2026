import { validateEntityId } from '../../core/validation/ids';
import { isBoundedString, isIntegerInRange, isRecord } from '../../core/validation/runtime-validation';
import { PLAYER_PROFILE_FIELD_LIMITS, type PlayerProfileField } from '../profile/player-profile';

export const MISSION_SCHEMA_VERSION = 1;
export const MISSION_TEXT_LIMITS = { title: 100, objective: 240 } as const;
export const MISSION_MAX_LIST_LENGTH = 64;
export const MISSION_MAX_TARGET_COUNT = 1000;
export const MISSION_MAX_TIME_LIMIT_DAYS = 365;

export const MISSION_KINDS = [
  'main', 'side', 'character', 'district', 'monthly',
  'random', 'moral-choice', 'crisis', 'secret', 'personalized',
] as const;
export type MissionKind = (typeof MISSION_KINDS)[number];

export type MissionObjective = {
  readonly id: string;
  readonly description: string;
  readonly targetCount: number;
};

export type MissionStep = {
  readonly id: string;
  readonly objectiveIds: readonly string[];
};

/**
 * Reiner Inhaltsvertrag. Spätere Engines lösen Bedingungen, Effekte und Endzustände
 * über stabile IDs auf; das Schema führt keine Spielaktionen aus.
 */
export type MissionDefinition = {
  readonly schemaVersion: typeof MISSION_SCHEMA_VERSION;
  readonly id: string;
  readonly title: string;
  readonly kind: MissionKind;
  readonly startConditionIds: readonly string[];
  readonly visibleObjectives: readonly MissionObjective[];
  readonly hiddenObjectives: readonly MissionObjective[];
  readonly steps: readonly MissionStep[];
  /** null bedeutet ausdrücklich: keine Frist; sonst positive Anzahl Spieltage. */
  readonly timeLimitDays: number | null;
  readonly rewardEffectIds: readonly string[];
  readonly riskIds: readonly string[];
  readonly failureEffectIds: readonly string[];
  readonly dialogueIds: readonly string[];
  readonly personalizationFields: readonly PlayerProfileField[];
  readonly endStateIds: readonly string[];
};

export type MissionValidationResult =
  | { readonly valid: true; readonly mission: MissionDefinition }
  | { readonly valid: false; readonly issues: readonly string[] };

const MISSION_FIELDS = [
  'schemaVersion', 'id', 'title', 'kind', 'startConditionIds',
  'visibleObjectives', 'hiddenObjectives', 'steps', 'timeLimitDays',
  'rewardEffectIds', 'riskIds', 'failureEffectIds', 'dialogueIds',
  'personalizationFields', 'endStateIds',
] as const;
const OBJECTIVE_FIELDS = ['id', 'description', 'targetCount'] as const;
const STEP_FIELDS = ['id', 'objectiveIds'] as const;
const MISSION_KIND_SET: ReadonlySet<string> = new Set(MISSION_KINDS);
const PROFILE_FIELD_SET: ReadonlySet<string> = new Set(Object.keys(PLAYER_PROFILE_FIELD_LIMITS));

/** Gibt alle gefundenen Fehler zurück, ohne beschädigte Inhalte still zu akzeptieren. */
export function validateMission(value: unknown): MissionValidationResult {
  if (!isRecord(value)) {
    return { valid: false, issues: ['Mission muss ein Objekt sein.'] };
  }

  const issues: string[] = [];
  checkExactFields(value, MISSION_FIELDS, 'Mission', issues);

  if (value.schemaVersion !== MISSION_SCHEMA_VERSION) {
    issues.push('schemaVersion muss 1 sein.');
  }
  checkId(value.id, 'id', issues);
  if (!isBoundedString(value.title, { maxLength: MISSION_TEXT_LIMITS.title })) {
    issues.push('title muss Text mit höchstens ' + MISSION_TEXT_LIMITS.title + ' Zeichen enthalten.');
  }
  if (typeof value.kind !== 'string' || !MISSION_KIND_SET.has(value.kind)) {
    issues.push('kind muss eine der zehn definierten Missionsarten sein.');
  }

  checkIdList(value.startConditionIds, 'startConditionIds', true, issues);
  checkObjectives(value.visibleObjectives, 'visibleObjectives', false, issues);
  checkObjectives(value.hiddenObjectives, 'hiddenObjectives', true, issues);
  checkSteps(value.steps, issues);

  if (
    value.timeLimitDays !== null &&
    !isIntegerInRange(value.timeLimitDays, 1, MISSION_MAX_TIME_LIMIT_DAYS)
  ) {
    issues.push('timeLimitDays muss null oder 1 bis ' + MISSION_MAX_TIME_LIMIT_DAYS + ' sein.');
  }

  checkIdList(value.rewardEffectIds, 'rewardEffectIds', true, issues);
  checkIdList(value.riskIds, 'riskIds', true, issues);
  checkIdList(value.failureEffectIds, 'failureEffectIds', true, issues);
  checkIdList(value.dialogueIds, 'dialogueIds', true, issues);
  checkProfileFields(value.personalizationFields, issues);
  checkIdList(value.endStateIds, 'endStateIds', false, issues);
  checkObjectiveReferences(value.visibleObjectives, value.hiddenObjectives, value.steps, issues);

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, mission: value as MissionDefinition };
}

function checkExactFields(
  value: Readonly<Record<string, unknown>>,
  fields: readonly string[],
  label: string,
  issues: string[],
): void {
  for (const field of fields) {
    if (!Object.hasOwn(value, field)) issues.push(label + ': ' + field + ' fehlt.');
  }
  for (const field of Object.keys(value)) {
    if (!fields.includes(field)) issues.push(label + ': unbekanntes Feld ' + field + '.');
  }
}

function checkId(value: unknown, label: string, issues: string[]): void {
  if (typeof value !== 'string' || !validateEntityId(value).valid) {
    issues.push(label + ' muss eine gültige ID sein.');
  }
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && validateEntityId(value).valid;
}

function isLimitedArray(value: unknown, minLength: number): value is readonly unknown[] {
  return Array.isArray(value) && value.length >= minLength && value.length <= MISSION_MAX_LIST_LENGTH;
}

function checkIdList(value: unknown, label: string, allowEmpty: boolean, issues: string[]): void {
  if (
    !isLimitedArray(value, allowEmpty ? 0 : 1) ||
    !value.every(isId) ||
    new Set(value).size !== value.length
  ) {
    issues.push(label + ' muss eindeutige gültige IDs enthalten (höchstens ' + MISSION_MAX_LIST_LENGTH + ').');
  }
}

function checkObjectives(value: unknown, label: string, allowEmpty: boolean, issues: string[]): void {
  if (!isLimitedArray(value, allowEmpty ? 0 : 1)) {
    issues.push(label + ' muss ' + (allowEmpty ? '0 bis ' : '1 bis ') + MISSION_MAX_LIST_LENGTH + ' Ziele enthalten.');
    return;
  }

  const ids: string[] = [];
  value.forEach((item, index) => {
    const prefix = label + '[' + index + ']';
    if (!isRecord(item)) {
      issues.push(prefix + ' muss ein Objekt sein.');
      return;
    }
    checkExactFields(item, OBJECTIVE_FIELDS, prefix, issues);
    if (!isId(item.id)) issues.push(prefix + '.id muss eine gültige ID sein.');
    else ids.push(item.id);
    if (!isBoundedString(item.description, { maxLength: MISSION_TEXT_LIMITS.objective })) {
      issues.push(prefix + '.description muss Text mit höchstens ' + MISSION_TEXT_LIMITS.objective + ' Zeichen enthalten.');
    }
    if (!isIntegerInRange(item.targetCount, 1, MISSION_MAX_TARGET_COUNT)) {
      issues.push(prefix + '.targetCount muss 1 bis ' + MISSION_MAX_TARGET_COUNT + ' sein.');
    }
  });
  if (new Set(ids).size !== ids.length) issues.push(label + ' enthält doppelte Ziel-IDs.');
}

function checkSteps(value: unknown, issues: string[]): void {
  if (!isLimitedArray(value, 1)) {
    issues.push('steps muss 1 bis ' + MISSION_MAX_LIST_LENGTH + ' Schritte enthalten.');
    return;
  }
  const ids: string[] = [];
  value.forEach((item, index) => {
    const prefix = 'steps[' + index + ']';
    if (!isRecord(item)) {
      issues.push(prefix + ' muss ein Objekt sein.');
      return;
    }
    checkExactFields(item, STEP_FIELDS, prefix, issues);
    if (!isId(item.id)) issues.push(prefix + '.id muss eine gültige ID sein.');
    else ids.push(item.id);
    checkIdList(item.objectiveIds, prefix + '.objectiveIds', false, issues);
  });
  if (new Set(ids).size !== ids.length) issues.push('steps enthält doppelte Schritt-IDs.');
}

function checkProfileFields(value: unknown, issues: string[]): void {
  if (
    !isLimitedArray(value, 0) ||
    !value.every((field) => typeof field === 'string' && PROFILE_FIELD_SET.has(field)) ||
    new Set(value).size !== value.length
  ) {
    issues.push('personalizationFields muss eindeutige bekannte Profilfelder enthalten.');
  }
}

/** Verhindert lose, doppelt verbuchte und unbekannte Ziele innerhalb einer Mission. */
function checkObjectiveReferences(
  visible: unknown,
  hidden: unknown,
  steps: unknown,
  issues: string[],
): void {
  if (!isLimitedArray(visible, 1) || !isLimitedArray(hidden, 0) || !isLimitedArray(steps, 1)) {
    return;
  }
  const allObjectives = [...visible, ...hidden];
  if (!allObjectives.every((item) => isRecord(item) && isId(item.id))) return;
  if (!steps.every((item) => isRecord(item) && isLimitedArray(item.objectiveIds, 1))) return;

  const ids = allObjectives.map((item) => (item as { readonly id: string }).id);
  const defined = new Set(ids);
  if (defined.size !== ids.length) issues.push('visibleObjectives und hiddenObjectives teilen Ziel-IDs.');

  const used: string[] = [];
  for (const step of steps) {
    const references = (step as { readonly objectiveIds: readonly unknown[] }).objectiveIds;
    for (const ref of references) {
      if (typeof ref !== 'string') continue;
      if (!defined.has(ref)) issues.push('steps verweist auf unbekanntes Ziel ' + ref + '.');
      else used.push(ref);
    }
  }
  if (new Set(used).size !== used.length) issues.push('Ein Missionsziel wird mehrfach in Schritten verwendet.');
  for (const id of defined) {
    if (!used.includes(id)) issues.push('Ziel ' + id + ' wird von keinem Schritt erreicht.');
  }
}
