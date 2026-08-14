import { validateEntityId } from '../../core/validation/ids';
import {
  isBoundedString,
  isIntegerInRange,
  isRecord,
} from '../../core/validation/runtime-validation';

export const CHARACTER_SCHEMA_VERSION = 1;
export const CHARACTER_TEXT_LIMITS = {
  name: 80,
  role: 80,
  skill: 120,
  weakness: 120,
  relationship: 160,
} as const;

export type CharacterEndingState = 'active' | 'allied' | 'estranged' | 'missing' | 'retired';

export type Character = {
  readonly schemaVersion: typeof CHARACTER_SCHEMA_VERSION;
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly districtId: string;
  readonly loyalty: number;
  readonly trust: number;
  readonly risk: number;
  readonly skill: string;
  readonly weakness: string;
  readonly relationship: string;
  readonly dialogueIds: readonly string[];
  readonly missionIds: readonly string[];
  readonly eventIds: readonly string[];
  readonly possibleEndStates: readonly CharacterEndingState[];
};

export type CharacterValidationResult =
  | { readonly valid: true; readonly character: Character }
  | { readonly valid: false; readonly issues: readonly string[] };

const END_STATES: ReadonlySet<string> = new Set<CharacterEndingState>([
  'active',
  'allied',
  'estranged',
  'missing',
  'retired',
]);

/** Prüft unbekannte Inhaltsdaten, bevor sie als Figur verwendet werden. */
export function validateCharacter(value: unknown): CharacterValidationResult {
  if (!isRecord(value)) {
    return { valid: false, issues: ['Figur muss ein Objekt sein.'] };
  }

  const issues = collectCharacterIssues(value);

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  return { valid: true, character: value as Character };
}

function collectCharacterIssues(value: Readonly<Record<string, unknown>>): string[] {
  const issues: string[] = [];

  checkExactSchemaVersion(value.schemaVersion, issues);
  checkId(value.id, 'id', issues);
  checkText(value.name, 'name', CHARACTER_TEXT_LIMITS.name, issues);
  checkText(value.role, 'role', CHARACTER_TEXT_LIMITS.role, issues);
  checkId(value.districtId, 'districtId', issues);
  checkNormalizedValue(value.loyalty, 'loyalty', issues);
  checkNormalizedValue(value.trust, 'trust', issues);
  checkNormalizedValue(value.risk, 'risk', issues);
  checkText(value.skill, 'skill', CHARACTER_TEXT_LIMITS.skill, issues);
  checkText(value.weakness, 'weakness', CHARACTER_TEXT_LIMITS.weakness, issues);
  checkText(value.relationship, 'relationship', CHARACTER_TEXT_LIMITS.relationship, issues);
  checkIdList(value.dialogueIds, 'dialogueIds', issues);
  checkIdList(value.missionIds, 'missionIds', issues);
  checkIdList(value.eventIds, 'eventIds', issues);
  checkEndStates(value.possibleEndStates, issues);

  return issues;
}

function checkExactSchemaVersion(value: unknown, issues: string[]): void {
  if (value !== CHARACTER_SCHEMA_VERSION) issues.push('schemaVersion muss 1 sein.');
}

function checkId(value: unknown, field: string, issues: string[]): void {
  if (typeof value !== 'string' || !validateEntityId(value).valid) {
    issues.push(`${field} muss eine gültige ID sein.`);
  }
}

function checkText(value: unknown, field: string, maxLength: number, issues: string[]): void {
  if (!isBoundedString(value, { maxLength })) {
    issues.push(`${field} muss Text mit höchstens ${maxLength} Zeichen enthalten.`);
  }
}

function checkNormalizedValue(value: unknown, field: string, issues: string[]): void {
  if (!isIntegerInRange(value, 0, 100)) issues.push(`${field} muss zwischen 0 und 100 liegen.`);
}

function checkIdList(value: unknown, field: string, issues: string[]): void {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((item) => typeof item === 'string' && validateEntityId(item).valid)
  ) {
    issues.push(`${field} muss mindestens eine gültige ID enthalten.`);
  }
}

function checkEndStates(value: unknown, issues: string[]): void {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((item) => typeof item === 'string' && END_STATES.has(item))
  ) {
    issues.push('possibleEndStates muss mindestens einen gültigen Endzustand enthalten.');
  }
}
