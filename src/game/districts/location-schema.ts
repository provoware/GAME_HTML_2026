import { validateEntityId } from '../../core/validation/ids';
import {
  isBoundedString,
  isIntegerInRange,
  isRecord,
} from '../../core/validation/runtime-validation';

export const LOCATION_SCHEMA_VERSION = 1;
export const LOCATION_TEXT_LIMITS = {
  name: 80,
  description: 500,
  accessibilityLabel: 120,
  assetPath: 160,
} as const;

export type LocationRisk = {
  readonly id: string;
  readonly severity: number;
};

export type LocationMedia = {
  readonly audioAssetPath: string;
  readonly imageAssetPath: string;
};

export type Location = {
  readonly schemaVersion: typeof LOCATION_SCHEMA_VERSION;
  readonly id: string;
  readonly name: string;
  readonly districtId: string;
  readonly description: string;
  readonly accessConditionIds: readonly string[];
  readonly actionIds: readonly string[];
  readonly risks: readonly LocationRisk[];
  readonly characterIds: readonly string[];
  readonly eventIds: readonly string[];
  readonly media: LocationMedia;
  readonly accessibilityLabel: string;
};

export type LocationValidationResult =
  | { readonly valid: true; readonly location: Location }
  | { readonly valid: false; readonly issues: readonly string[] };

/** Prüft unbekannte Inhaltsdaten, bevor sie als Ort verwendet werden. */
export function validateLocation(value: unknown): LocationValidationResult {
  if (!isRecord(value)) {
    return { valid: false, issues: ['Ort muss ein Objekt sein.'] };
  }

  const issues = collectLocationIssues(value);

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  return { valid: true, location: value as Location };
}

function collectLocationIssues(value: Readonly<Record<string, unknown>>): string[] {
  const issues: string[] = [];

  if (value.schemaVersion !== LOCATION_SCHEMA_VERSION) {
    issues.push('schemaVersion muss 1 sein.');
  }

  checkId(value.id, 'id', issues);
  checkText(value.name, 'name', LOCATION_TEXT_LIMITS.name, issues);
  checkId(value.districtId, 'districtId', issues);
  checkText(value.description, 'description', LOCATION_TEXT_LIMITS.description, issues);
  checkIdList(value.accessConditionIds, 'accessConditionIds', true, issues);
  checkIdList(value.actionIds, 'actionIds', false, issues);
  checkRisks(value.risks, issues);
  checkIdList(value.characterIds, 'characterIds', false, issues);
  checkIdList(value.eventIds, 'eventIds', false, issues);
  checkMedia(value.media, issues);
  checkText(
    value.accessibilityLabel,
    'accessibilityLabel',
    LOCATION_TEXT_LIMITS.accessibilityLabel,
    issues,
  );

  return issues;
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

function checkIdList(value: unknown, field: string, allowEmpty: boolean, issues: string[]): void {
  if (
    !Array.isArray(value) ||
    (!allowEmpty && value.length === 0) ||
    !value.every((item) => typeof item === 'string' && validateEntityId(item).valid)
  ) {
    issues.push(`${field} muss ${allowEmpty ? 'nur' : 'mindestens eine'} gültige ID enthalten.`);
  }
}

function checkRisks(value: unknown, issues: string[]): void {
  if (!Array.isArray(value) || value.length === 0 || !value.every(isLocationRisk)) {
    issues.push('risks muss mindestens ein gültiges Risiko enthalten.');
  }
}

function isLocationRisk(value: unknown): value is LocationRisk {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    validateEntityId(value.id).valid &&
    isIntegerInRange(value.severity, 0, 100)
  );
}

function checkMedia(value: unknown, issues: string[]): void {
  if (
    !isRecord(value) ||
    !isLocalAssetPath(value.audioAssetPath) ||
    !isLocalAssetPath(value.imageAssetPath)
  ) {
    issues.push('media muss sichere lokale Audio- und Bildpfade enthalten.');
  }
}

function isLocalAssetPath(value: unknown): value is string {
  return (
    isBoundedString(value, { maxLength: LOCATION_TEXT_LIMITS.assetPath }) &&
    !value.includes('..') &&
    !value.includes(':') &&
    !value.includes('\\') &&
    !value.startsWith('//')
  );
}
