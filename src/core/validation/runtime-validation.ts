export type StringValidationOptions = {
  readonly maxLength: number;
  readonly allowBlank?: boolean;
};

/** Prüft unbekannte Werte als begrenzte Zeichenketten. */
export function isBoundedString(
  value: unknown,
  { maxLength, allowBlank = false }: StringValidationOptions,
): value is string {
  return (
    typeof value === 'string' &&
    value.length <= maxLength &&
    (allowBlank || value.trim().length > 0)
  );
}

/** Prüft unbekannte Werte als ganze Zahl innerhalb geschlossener Grenzen. */
export function isIntegerInRange(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= maximum
  );
}

/** Akzeptiert ausschließlich kanonische UTC-Zeitstempel, die `toISOString` erzeugt. */
export function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

export function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
