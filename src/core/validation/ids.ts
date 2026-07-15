const ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const MAX_ID_LENGTH = 64;

export type EntityKind =
  | 'achievement'
  | 'character'
  | 'cheat'
  | 'dialogue'
  | 'district'
  | 'ending'
  | 'event'
  | 'location'
  | 'mission';

export type EntityId<TKind extends EntityKind = EntityKind> = string & {
  readonly __entityKind: TKind;
};

export type IdValidationResult =
  | {
      readonly valid: true;
      readonly id: EntityId;
    }
  | {
      readonly valid: false;
      readonly reason: string;
    };

/**
 * Prüft die projektweite ID-Konvention: kleingeschriebenes kebab-case ohne Prefix.
 */
export function validateEntityId(value: string): IdValidationResult {
  if (value.length === 0) {
    return { valid: false, reason: 'ID darf nicht leer sein.' };
  }

  if (value.length > MAX_ID_LENGTH) {
    return { valid: false, reason: `ID darf maximal ${MAX_ID_LENGTH} Zeichen lang sein.` };
  }

  if (!ID_PATTERN.test(value)) {
    return {
      valid: false,
      reason: 'ID muss mit einem Kleinbuchstaben beginnen und kebab-case nutzen.',
    };
  }

  return { valid: true, id: value as EntityId };
}

export function createEntityId<TKind extends EntityKind>(
  kind: TKind,
  value: string,
): EntityId<TKind> {
  const result = validateEntityId(value);

  if (!result.valid) {
    throw new Error(`${kind}-ID ungültig: ${result.reason}`);
  }

  return value as EntityId<TKind>;
}

export function hasUniqueEntityIds(ids: readonly EntityId[]): boolean {
  return new Set(ids).size === ids.length;
}
