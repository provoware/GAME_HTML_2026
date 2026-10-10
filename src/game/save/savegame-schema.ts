import { validateEntityId } from '../../core/validation/ids';
import { isBoundedString, isIntegerInRange, isIsoTimestamp, isRecord } from '../../core/validation/runtime-validation';
import { ECONOMY_STATE_SCHEMA_VERSION } from '../economy/economy-state';
import { WORLD_STATE_SCHEMA_VERSION } from '../districts/world-state';
import { PLAYER_PROFILE_FIELD_LIMITS, PLAYER_PROFILE_SCHEMA_VERSION } from '../profile/player-profile';
import { INITIAL_SCHEMA_VERSION, type GameState } from '../state/game-state';

/**
 * GAME-0213: Inhaltsvertrag, KEIN Speicherzugriff.
 * Prüfsumme: sha256 (64 kleine Hex-Zeichen) – die tatsächliche
 * Berechnung/Verifikation folgt ausdrücklich in GAME-1607.
 */
export const SAVEGAME_SCHEMA_VERSION = INITIAL_SCHEMA_VERSION;
export const SAVEGAME_MAX_COLLECTION_LENGTH = 10000;
export const SAVEGAME_MAX_TEXT_LENGTH = 500;
export const SAVEGAME_MAX_RNG_LENGTH = 256;
export const SAVEGAME_MAX_ACTION_POINTS = 100;

export type SavegameDefinition = GameState & {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly checksum: string;
};

export type SavegameValidationResult =
  | { readonly valid: true; readonly savegame: SavegameDefinition }
  | { readonly valid: false; readonly issues: readonly string[] };

const SAVE_FIELDS = [
  'schemaVersion', 'gameVersion', 'createdAt', 'updatedAt', 'checksum',
  'status', 'mode', 'campaignLengthMonths', 'calendar', 'profile', 'player',
  'economy', 'world', 'missions', 'events', 'relationships', 'achievements',
  'settings', 'rng', 'history',
] as const;
const CALENDAR_FIELDS = ['day', 'week', 'month', 'year', 'actionPoints'] as const;
const PLAYER_FIELDS = [
  'reputation', 'shadow', 'morality', 'influence', 'creativity', 'energy',
  'stress', 'heat', 'crewLoyalty', 'resonance', 'rank', 'xp',
] as const;
const ECONOMY_FIELDS = [
  'schemaVersion', 'cash', 'savings', 'debt', 'fixedCosts', 'upkeep',
  'monthlyWage', 'savingsInterestRateBasisPoints', 'debtInterestRateBasisPoints',
  'ledger',
] as const;
const WORLD_FIELDS = [
  'schemaVersion', 'currentDistrictId', 'knownDistrictIds',
  'currentLocationId', 'unlockedLocationIds', 'lockedLocationIds',
  'visitedLocationIds', 'flags', 'rumors',
] as const;
const MISSION_FIELDS = ['activeMissionIds', 'completedMissionIds', 'failedMissionIds'] as const;
const EVENT_FIELDS = ['activeEventIds', 'resolvedEventIds'] as const;
const SETTINGS_FIELDS = ['theme', 'reducedMotion', 'audioEnabled'] as const;
const RNG_FIELDS = ['seed', 'worldStream', 'eventStream', 'uiStream'] as const;
const SEMVER_PATTERN = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const CHECKSUM_PATTERN = /^[0-9a-f]{64}$/;

export function validateSavegame(value: unknown): SavegameValidationResult {
  const issues: string[] = [];
  if (!checkObject(value, SAVE_FIELDS, 'Savegame', issues)) {
    return { valid: false, issues };
  }

  if (value.schemaVersion !== SAVEGAME_SCHEMA_VERSION) {
    issues.push('schemaVersion ist inkompatibel: erwartet ' + SAVEGAME_SCHEMA_VERSION + '.');
  }
  if (
    !isBoundedString(value.gameVersion, { maxLength: 64 }) ||
    !SEMVER_PATTERN.test(value.gameVersion)
  ) {
    issues.push('gameVersion muss eine Versionsnummer wie 0.0.0 sein.');
  }

  checkTimestamp(value.createdAt, 'createdAt', issues);
  checkTimestamp(value.updatedAt, 'updatedAt', issues);
  if (
    isIsoTimestamp(value.createdAt) &&
    isIsoTimestamp(value.updatedAt) &&
    value.updatedAt < value.createdAt
  ) {
    issues.push('updatedAt darf nicht vor createdAt liegen.');
  }
  if (typeof value.checksum !== 'string' || !CHECKSUM_PATTERN.test(value.checksum)) {
    issues.push('checksum muss aus 64 kleinen SHA-256-Hex-Zeichen bestehen.');
  }

  checkChoice(value.status, ['setup', 'running', 'won', 'lost'], 'status', issues);
  checkChoice(value.mode, ['classic', 'tycoon', 'clean-legend', 'chaos'], 'mode', issues);
  if (
    value.campaignLengthMonths !== 12 &&
    value.campaignLengthMonths !== 24 &&
    value.campaignLengthMonths !== 36 &&
    value.campaignLengthMonths !== 'endless'
  ) {
    issues.push('campaignLengthMonths muss 12, 24, 36 oder endless sein.');
  }

  checkCalendar(value.calendar, issues);
  checkProfile(value.profile, issues);
  checkPlayer(value.player, issues);
  checkEconomy(value.economy, issues);
  checkWorld(value.world, issues);
  checkMissions(value.missions, issues);
  checkEvents(value.events, issues);
  checkRelationships(value.relationships, issues);
  checkAchievements(value.achievements, issues);
  checkSettings(value.settings, issues);
  checkRng(value.rng, issues);
  checkHistory(value.history, issues);

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, savegame: value as unknown as SavegameDefinition };
}

function checkObject(
  value: unknown, fields: readonly string[], label: string, issues: string[],
): value is Readonly<Record<string, unknown>> {
  if (!isRecord(value)) {
    issues.push(label + ' muss ein Objekt sein.');
    return false;
  }
  for (const field of fields) {
    if (!Object.hasOwn(value, field)) issues.push(label + ': ' + field + ' fehlt.');
  }
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !fields.includes(key)) {
      issues.push(label + ': unbekanntes Feld ' + String(key) + '.');
    }
  }
  return true;
}

function checkInteger(value: unknown, label: string, min: number, max: number, issues: string[]): void {
  if (!isIntegerInRange(value, min, max)) {
    issues.push(label + ' muss eine ganze Zahl zwischen ' + min + ' und ' + max + ' sein.');
  }
}

function checkText(value: unknown, label: string, max: number, issues: string[]): void {
  if (!isBoundedString(value, { maxLength: max })) {
    issues.push(label + ' muss nichtleeren Text mit höchstens ' + max + ' Zeichen enthalten.');
  }
}

function checkId(value: unknown, label: string, issues: string[]): void {
  if (typeof value !== 'string' || !validateEntityId(value).valid) {
    issues.push(label + ' muss eine gültige ID sein.');
  }
}

function checkTimestamp(value: unknown, label: string, issues: string[]): void {
  if (!isIsoTimestamp(value)) issues.push(label + ' muss ein kanonischer UTC-Zeitstempel sein.');
}

function checkBoolean(value: unknown, label: string, issues: string[]): void {
  if (typeof value !== 'boolean') issues.push(label + ' muss true oder false sein.');
}

function checkChoice(value: unknown, choices: readonly string[], label: string, issues: string[]): void {
  if (typeof value !== 'string' || !choices.includes(value)) {
    issues.push(label + ' enthält einen nicht erlaubten Wert.');
  }
}

function checkIdList(value: unknown, label: string, min: number, issues: string[]): string[] | null {
  if (!Array.isArray(value) || value.length < min || value.length > SAVEGAME_MAX_COLLECTION_LENGTH) {
    issues.push(label + ' muss ' + min + ' bis ' + SAVEGAME_MAX_COLLECTION_LENGTH + ' IDs enthalten.');
    return null;
  }
  if (
    !value.every((id: unknown) => typeof id === 'string' && validateEntityId(id).valid) ||
    new Set(value).size !== value.length
  ) {
    issues.push(label + ' muss eindeutige gültige IDs enthalten.');
    return null;
  }
  return value as string[];
}

function checkDistinctLists(lists: readonly (readonly string[] | null)[], label: string, issues: string[]): void {
  if (lists.some((list) => list === null)) return;
  const ids = lists.flatMap((list) => list ?? []);
  if (new Set(ids).size !== ids.length) issues.push(label + ' darf keine ID in mehreren Listen führen.');
}

function checkCalendar(input: unknown, issues: string[]): void {
  if (!checkObject(input, CALENDAR_FIELDS, 'calendar', issues)) return;
  checkInteger(input.day, 'calendar.day', 1, 31, issues);
  checkInteger(input.week, 'calendar.week', 1, 53, issues);
  checkInteger(input.month, 'calendar.month', 1, 12, issues);
  if (input.year !== 1986) issues.push('calendar.year muss zur aktuellen Version 1986 sein.');
  checkInteger(input.actionPoints, 'calendar.actionPoints', 0, SAVEGAME_MAX_ACTION_POINTS, issues);
}

function checkProfile(input: unknown, issues: string[]): void {
  if (!checkObject(input, ['schemaVersion', ...Object.keys(PLAYER_PROFILE_FIELD_LIMITS)], 'profile', issues)) return;
  if (input.schemaVersion !== PLAYER_PROFILE_SCHEMA_VERSION) {
    issues.push('profile.schemaVersion ist inkompatibel.');
  }
  for (const [key, max] of Object.entries(PLAYER_PROFILE_FIELD_LIMITS)) {
    checkText(input[key], 'profile.' + key, max, issues);
  }
}

function checkPlayer(input: unknown, issues: string[]): void {
  if (!checkObject(input, PLAYER_FIELDS, 'player', issues)) return;
  for (const field of PLAYER_FIELDS) {
    if (field === 'xp') {
      checkInteger(input[field], 'player.' + field, 0, Number.MAX_SAFE_INTEGER, issues);
    } else if (field === 'rank') {
      checkInteger(input[field], 'player.' + field, 1, 100, issues);
    } else {
      checkInteger(input[field], 'player.' + field, 0, 100, issues);
    }
  }
}

function checkEconomy(input: unknown, issues: string[]): void {
  if (!checkObject(input, ECONOMY_FIELDS, 'economy', issues)) return;
  if (input.schemaVersion !== ECONOMY_STATE_SCHEMA_VERSION) {
    issues.push('economy.schemaVersion ist inkompatibel.');
  }
  for (const field of ['cash', 'savings', 'debt', 'fixedCosts', 'upkeep', 'monthlyWage'] as const) {
    checkInteger(input[field], 'economy.' + field, 0, Number.MAX_SAFE_INTEGER, issues);
  }
  for (const field of ['savingsInterestRateBasisPoints', 'debtInterestRateBasisPoints'] as const) {
    checkInteger(input[field], 'economy.' + field, 0, 100000, issues);
  }
  if (checkObject(input.ledger, ['earned', 'spent'], 'economy.ledger', issues)) {
    checkInteger(input.ledger.earned, 'economy.ledger.earned', 0, Number.MAX_SAFE_INTEGER, issues);
    checkInteger(input.ledger.spent, 'economy.ledger.spent', 0, Number.MAX_SAFE_INTEGER, issues);
  }
}

function checkWorld(input: unknown, issues: string[]): void {
  if (!checkObject(input, WORLD_FIELDS, 'world', issues)) return;
  if (input.schemaVersion !== WORLD_STATE_SCHEMA_VERSION) {
    issues.push('world.schemaVersion ist inkompatibel.');
  }
  checkId(input.currentDistrictId, 'world.currentDistrictId', issues);
  checkId(input.currentLocationId, 'world.currentLocationId', issues);
  const known = checkIdList(input.knownDistrictIds, 'world.knownDistrictIds', 1, issues);
  const unlocked = checkIdList(input.unlockedLocationIds, 'world.unlockedLocationIds', 1, issues);
  const locked = checkIdList(input.lockedLocationIds, 'world.lockedLocationIds', 0, issues);
  checkIdList(input.visitedLocationIds, 'world.visitedLocationIds', 0, issues);

  if (known && typeof input.currentDistrictId === 'string' && !known.includes(input.currentDistrictId)) {
    issues.push('world.currentDistrictId muss in knownDistrictIds vorkommen.');
  }
  if (unlocked && typeof input.currentLocationId === 'string' && !unlocked.includes(input.currentLocationId)) {
    issues.push('world.currentLocationId muss in unlockedLocationIds vorkommen.');
  }
  checkDistinctLists([unlocked, locked], 'world.unlockedLocationIds/lockedLocationIds', issues);
  checkRecordList(input.flags, 'world.flags', ['id', 'active', 'updatedTurn'], issues, (flag, label) => {
    checkId(flag.id, label + '.id', issues);
    checkBoolean(flag.active, label + '.active', issues);
    checkInteger(flag.updatedTurn, label + '.updatedTurn', 0, Number.MAX_SAFE_INTEGER, issues);
  });
  checkRecordList(input.rumors, 'world.rumors', ['id', 'text', 'discoveredTurn'], issues, (rumor, label) => {
    checkId(rumor.id, label + '.id', issues);
    checkText(rumor.text, label + '.text', SAVEGAME_MAX_TEXT_LENGTH, issues);
    checkInteger(rumor.discoveredTurn, label + '.discoveredTurn', 0, Number.MAX_SAFE_INTEGER, issues);
  });
}

function checkRecordList(
  input: unknown, label: string, fields: readonly string[], issues: string[],
  validate: (item: Readonly<Record<string, unknown>>, label: string) => void,
  uniqueField: string | null = 'id',
): void {
  if (!Array.isArray(input) || input.length > SAVEGAME_MAX_COLLECTION_LENGTH) {
    issues.push(label + ' muss eine Liste mit höchstens ' + SAVEGAME_MAX_COLLECTION_LENGTH + ' Elementen sein.');
    return;
  }
  const ids: string[] = [];
  input.forEach((item, index) => {
    const path = label + '[' + index + ']';
    if (!checkObject(item, fields, path, issues)) return;
    validate(item, path);
    if (uniqueField !== null && typeof item[uniqueField] === 'string') ids.push(item[uniqueField]);
  });
  if (uniqueField !== null && new Set(ids).size !== ids.length) {
    issues.push(label + ' enthält doppelte ' + uniqueField + '-Werte.');
  }
}

function checkMissions(input: unknown, issues: string[]): void {
  if (!checkObject(input, MISSION_FIELDS, 'missions', issues)) return;
  const lists = MISSION_FIELDS.map((key) => checkIdList(input[key], 'missions.' + key, 0, issues));
  checkDistinctLists(lists, 'missions', issues);
}

function checkEvents(input: unknown, issues: string[]): void {
  if (!checkObject(input, EVENT_FIELDS, 'events', issues)) return;
  const lists = EVENT_FIELDS.map((key) => checkIdList(input[key], 'events.' + key, 0, issues));
  checkDistinctLists(lists, 'events', issues);
}

function checkRelationships(input: unknown, issues: string[]): void {
  checkRecordList(input, 'relationships', ['characterId', 'loyalty', 'trust'], issues, (item, path) => {
    checkId(item.characterId, path + '.characterId', issues);
    checkInteger(item.loyalty, path + '.loyalty', 0, 100, issues);
    checkInteger(item.trust, path + '.trust', 0, 100, issues);
  }, 'characterId');
}

function checkAchievements(input: unknown, issues: string[]): void {
  if (!checkObject(input, ['unlockedIds', 'restrictedByCheats'], 'achievements', issues)) return;
  checkIdList(input.unlockedIds, 'achievements.unlockedIds', 0, issues);
  checkBoolean(input.restrictedByCheats, 'achievements.restrictedByCheats', issues);
}

function checkSettings(input: unknown, issues: string[]): void {
  if (!checkObject(input, SETTINGS_FIELDS, 'settings', issues)) return;
  checkChoice(input.theme, ['retro-amber', 'neon-night', 'concrete-gray', 'high-contrast'], 'settings.theme', issues);
  checkBoolean(input.reducedMotion, 'settings.reducedMotion', issues);
  checkBoolean(input.audioEnabled, 'settings.audioEnabled', issues);
}

function checkRng(input: unknown, issues: string[]): void {
  if (!checkObject(input, RNG_FIELDS, 'rng', issues)) return;
  for (const field of RNG_FIELDS) {
    checkText(input[field], 'rng.' + field, SAVEGAME_MAX_RNG_LENGTH, issues);
  }
}

function checkHistory(input: unknown, issues: string[]): void {
  if (!Array.isArray(input) || input.length < 1 || input.length > SAVEGAME_MAX_COLLECTION_LENGTH) {
    issues.push('history muss 1 bis ' + SAVEGAME_MAX_COLLECTION_LENGTH + ' Einträge enthalten.');
    return;
  }
  let previousTurn = -1;
  input.forEach((entry, index) => {
    const path = 'history[' + index + ']';
    if (!checkObject(entry, ['turn', 'message', 'createdAt'], path, issues)) return;
    checkInteger(entry.turn, path + '.turn', 0, Number.MAX_SAFE_INTEGER, issues);
    checkText(entry.message, path + '.message', SAVEGAME_MAX_TEXT_LENGTH, issues);
    checkTimestamp(entry.createdAt, path + '.createdAt', issues);
    if (isIntegerInRange(entry.turn, 0, Number.MAX_SAFE_INTEGER)) {
      if (entry.turn < previousTurn) issues.push(path + '.turn darf nicht rückwärts laufen.');
      previousTurn = entry.turn;
    }
  });
}
