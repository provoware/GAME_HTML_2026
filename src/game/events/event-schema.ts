import { validateEntityId } from '../../core/validation/ids';
import { isBoundedString, isIntegerInRange, isRecord } from '../../core/validation/runtime-validation';

export const EVENT_SCHEMA_VERSION = 1;
export const EVENT_TEXT_LIMITS = { title: 100, description: 500 } as const;
export const EVENT_MAX_LIST_LENGTH = 64;
export const EVENT_MAX_WEIGHT = 10000;
export const EVENT_MAX_COOLDOWN_TURNS = 3650;
export const EVENT_MAX_REPETITIONS = 1000;

/**
 * Reiner Inhaltsvertrag. Die spätere Ereignis-Engine bestimmt Auswahl,
 * Sperrzeiten, Konflikte und Effekte. randomDrawId benennt nur die
 * protokollierbare Zufallsziehung – sie wird hier nicht ausgeführt.
 */
export type EventDefinition = {
  readonly schemaVersion: typeof EVENT_SCHEMA_VERSION;
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Positives ganzzahliges Gewicht: 1–10.000. */
  readonly weight: number;
  /** Anzahl bestätigter Züge bis zur erneuten Auswahl; 0 = keine Sperrzeit. */
  readonly cooldownTurns: number;
  readonly conditionIds: readonly string[];
  readonly conflictGroupIds: readonly string[];
  /** null = keine Wiederholungsgrenze, andernfalls positive ganze Zahl. */
  readonly repeatLimit: number | null;
  readonly effectIds: readonly string[];
  readonly followUpEventIds: readonly string[];
  /** Fester Verweis auf den bereits definierten GameState.rng.eventStream. */
  readonly rngStream: 'event';
  /** Stabile ID zur späteren Zuordnung eines protokollierten RNG-Zugs. */
  readonly randomDrawId: string;
};

export type EventValidationResult =
  | { readonly valid: true; readonly event: EventDefinition }
  | { readonly valid: false; readonly issues: readonly string[] };

const EVENT_FIELDS = [
  'schemaVersion', 'id', 'title', 'description', 'weight', 'cooldownTurns',
  'conditionIds', 'conflictGroupIds', 'repeatLimit', 'effectIds',
  'followUpEventIds', 'rngStream', 'randomDrawId',
] as const;

/** Verwirft beschädigte oder unerwartete Ereignisdaten ohne Seiteneffekte. */
export function validateEvent(value: unknown): EventValidationResult {
  if (!isRecord(value)) {
    return { valid: false, issues: ['Ereignis muss ein Objekt sein.'] };
  }

  const issues: string[] = [];
  checkFields(value, issues);

  if (value.schemaVersion !== EVENT_SCHEMA_VERSION) {
    issues.push('schemaVersion muss 1 sein.');
  }
  checkId(value.id, 'id', issues);
  checkText(value.title, 'title', EVENT_TEXT_LIMITS.title, issues);
  checkText(value.description, 'description', EVENT_TEXT_LIMITS.description, issues);

  if (!isIntegerInRange(value.weight, 1, EVENT_MAX_WEIGHT)) {
    issues.push('weight muss eine ganze Zahl zwischen 1 und ' + EVENT_MAX_WEIGHT + ' sein.');
  }
  if (!isIntegerInRange(value.cooldownTurns, 0, EVENT_MAX_COOLDOWN_TURNS)) {
    issues.push('cooldownTurns muss eine ganze Zahl zwischen 0 und ' + EVENT_MAX_COOLDOWN_TURNS + ' sein.');
  }

  checkIdList(value.conditionIds, 'conditionIds', true, issues);
  checkIdList(value.conflictGroupIds, 'conflictGroupIds', true, issues);
  if (value.repeatLimit !== null && !isIntegerInRange(value.repeatLimit, 1, EVENT_MAX_REPETITIONS)) {
    issues.push('repeatLimit muss null oder eine ganze Zahl zwischen 1 und ' + EVENT_MAX_REPETITIONS + ' sein.');
  }
  checkIdList(value.effectIds, 'effectIds', false, issues);
  checkIdList(value.followUpEventIds, 'followUpEventIds', true, issues);

  if (value.rngStream !== 'event') {
    issues.push('rngStream muss event sein.');
  }
  checkId(value.randomDrawId, 'randomDrawId', issues);

  if (
    typeof value.id === 'string' &&
    Array.isArray(value.followUpEventIds) &&
    value.followUpEventIds.includes(value.id)
  ) {
    issues.push('followUpEventIds darf keine direkte Selbstreferenz enthalten.');
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, event: value as EventDefinition };
}

function checkFields(value: Readonly<Record<string, unknown>>, issues: string[]): void {
  for (const field of EVENT_FIELDS) {
    if (!Object.hasOwn(value, field)) issues.push(field + ' fehlt.');
  }
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !EVENT_FIELDS.includes(key as (typeof EVENT_FIELDS)[number])) {
      issues.push('Unbekanntes Ereignisfeld: ' + String(key) + '.');
    }
  }
}

function checkId(value: unknown, label: string, issues: string[]): void {
  if (typeof value !== 'string' || !validateEntityId(value).valid) {
    issues.push(label + ' muss eine gültige ID sein.');
  }
}

function checkText(value: unknown, label: string, maxLength: number, issues: string[]): void {
  if (!isBoundedString(value, { maxLength })) {
    issues.push(label + ' muss Text mit höchstens ' + maxLength + ' Zeichen enthalten.');
  }
}

function checkIdList(value: unknown, label: string, allowEmpty: boolean, issues: string[]): void {
  if (
    !Array.isArray(value) ||
    value.length < (allowEmpty ? 0 : 1) ||
    value.length > EVENT_MAX_LIST_LENGTH ||
    !value.every((item: unknown) => typeof item === 'string' && validateEntityId(item).valid) ||
    new Set(value).size !== value.length
  ) {
    issues.push(label + ' muss eindeutige gültige IDs enthalten (höchstens ' + EVENT_MAX_LIST_LENGTH + ').');
  }
}
