import { validateEntityId } from '../../core/validation/ids';
import { isIsoTimestamp, isRecord } from '../../core/validation/runtime-validation';
import { createInitialGameState, type GameState } from './game-state';
import { PLAYER_PROFILE_FIELD_LIMITS } from '../profile/player-profile';

export const SAVEGAME_SCHEMA_VERSION = 1;
export const SAVEGAME_MAX_LIST_LENGTH = 5000;
export const SAVEGAME_MAX_TEXT_LENGTH = 1600;

export type SavegameV1 = {
  readonly schemaVersion: typeof SAVEGAME_SCHEMA_VERSION;
  readonly slotId: string;
  readonly savedAt: string;
  readonly state: GameState;
};

export type SavegameValidationResult =
  | { readonly valid: true; readonly savegame: SavegameV1 }
  | { readonly valid: false; readonly issues: readonly string[] };

type Shape = unknown;

function checkShape(value: unknown, shape: Shape, path: string, issues: string[]): void {
  if (Array.isArray(shape)) {
    if (!Array.isArray(value) || value.length > SAVEGAME_MAX_LIST_LENGTH) {
      issues.push(path + ': ungültige oder zu lange Liste.');
      return;
    }
    if (shape.length === 1) {
      value.forEach((entry: unknown, index: number) => checkShape(entry, shape[0], path + '[' + index + ']', issues));
    }
    return;
  }
  if (isRecord(shape)) {
    if (!isRecord(value)) {
      issues.push(path + ': Objekt erwartet.');
      return;
    }
    for (const key of Object.keys(shape)) {
      if (!Object.hasOwn(value, key)) issues.push(path + '.' + key + ': Pflichtfeld fehlt.');
      else checkShape(value[key], shape[key], path + '.' + key, issues);
    }
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string' || !Object.hasOwn(shape, key)) {
        issues.push(path + ': unbekanntes Feld ' + String(key) + '.');
      }
    }
    return;
  }
  // Die Kampagnenlaenge ist eine Union aus Monatszahl und 'endless'.
  if (path === 'state.campaignLengthMonths' && value === 'endless') return;
  if (typeof shape === 'number') {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
      issues.push(path + ': nichtnegative ganze Zahl erwartet.');
    }
  } else if (typeof shape === 'string') {
    if (typeof value !== 'string' || value.length === 0 || value.length > SAVEGAME_MAX_TEXT_LENGTH) {
      issues.push(path + ': ungültiger oder zu langer Text.');
    }
  } else if (typeof value !== typeof shape) {
    issues.push(path + ': ungültiger Datentyp.');
  }
}

function stateShape(): unknown {
  const initial = createInitialGameState();
  return {
    ...initial,
    world: {
      ...initial.world,
      knownDistrictIds: ['id'],
      unlockedLocationIds: ['id'],
      lockedLocationIds: ['id'],
      visitedLocationIds: ['id'],
      flags: [{ id: 'id', active: true, updatedTurn: 0 }],
      rumors: [{ id: 'id', text: 'Text', discoveredTurn: 0 }],
    },
    missions: { activeMissionIds: ['id'], completedMissionIds: ['id'], failedMissionIds: ['id'] },
    events: { activeEventIds: ['id'], resolvedEventIds: ['id'] },
    relationships: [{ characterId: 'id', loyalty: 0, trust: 0 }],
    achievements: { unlockedIds: ['id'], restrictedByCheats: false },
    history: [{ turn: 0, message: 'Text', createdAt: '1986-01-01T00:00:00.000Z' }],
  };
}

function checkSemantics(state: GameState, issues: string[]): void {
  if (state.schemaVersion !== 1 || state.profile.schemaVersion !== 1 ||
      state.economy.schemaVersion !== 1 || state.world.schemaVersion !== 1) {
    issues.push('state: unbekannte Datenversion.');
  }
  if (!['setup', 'running', 'won', 'lost'].includes(state.status) ||
      !['classic', 'tycoon', 'clean-legend', 'chaos'].includes(state.mode) ||
      ![12, 24, 36, 'endless'].includes(state.campaignLengthMonths)) {
    issues.push('state: ungültiger Spielmodus oder Spielstatus.');
  }
  if (!['retro-amber', 'neon-night', 'concrete-gray', 'high-contrast'].includes(state.settings.theme)) {
    issues.push('state.settings.theme: unbekanntes Farbschema.');
  }
  if (state.calendar.year !== 1986 || state.calendar.day < 1 || state.calendar.day > 31 ||
      state.calendar.week < 1 || state.calendar.week > 5 ||
      state.calendar.month < 1 || state.calendar.month > 12 || state.calendar.actionPoints > 100) {
    issues.push('state.calendar: ungültiges Datum.');
  }
  for (const [key, value] of Object.entries(state.player)) {
    if (value > (key === 'xp' ? Number.MAX_SAFE_INTEGER : 100)) {
      issues.push('state.player.' + key + ': Spielwert außerhalb des gültigen Bereichs.');
    }
  }
  if (state.player.rank < 1 || state.player.rank > 100) issues.push('state.player.rank: ungültiger Rang.');
  if (!/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(state.gameVersion) ||
      state.gameVersion.length > 64) issues.push('state.gameVersion: ungültige Versionsnummer.');
  for (const [field, limit] of Object.entries(PLAYER_PROFILE_FIELD_LIMITS)) {
    if ((state.profile[field as keyof typeof PLAYER_PROFILE_FIELD_LIMITS] as string).length > limit) {
      issues.push('state.profile.' + field + ': Eingabe zu lang.');
    }
  }
  const uniqueIds = (values: readonly string[], label: string): void => {
    if (new Set(values).size !== values.length ||
        values.some((entry) => !validateEntityId(entry).valid)) {
      issues.push(label + ': ungültige oder doppelte IDs.');
    }
  };
  uniqueIds(state.world.flags.map((entry) => entry.id), 'state.world.flags');
  uniqueIds(state.world.rumors.map((entry) => entry.id), 'state.world.rumors');
  uniqueIds(state.relationships.map((entry) => entry.characterId), 'state.relationships');
  const overlaps = (a: readonly string[], b: readonly string[]): boolean =>
    a.some((entry) => b.includes(entry));
  if (overlaps(state.world.unlockedLocationIds, state.world.lockedLocationIds) ||
      overlaps(state.missions.activeMissionIds, state.missions.completedMissionIds) ||
      overlaps(state.missions.activeMissionIds, state.missions.failedMissionIds) ||
      overlaps(state.missions.completedMissionIds, state.missions.failedMissionIds) ||
      overlaps(state.events.activeEventIds, state.events.resolvedEventIds)) {
    issues.push('state: widersprüchliche aktive und abgeschlossene Referenzen.');
  }
  for (const entry of state.relationships) {
    if (entry.loyalty > 100 || entry.trust > 100) issues.push('state.relationships: Wert über 100.');
  }
  if (state.history.some((entry) => entry.message.length > 500)) {
    issues.push('state.history: Nachricht zu lang.');
  }
  for (const field of Object.values(state.rng)) {
    if (field.length > 128) issues.push('state.rng: Zufallskennung zu lang.');
  }
  const lists = [
    state.world.knownDistrictIds, state.world.unlockedLocationIds, state.world.lockedLocationIds,
    state.world.visitedLocationIds, state.missions.activeMissionIds, state.missions.completedMissionIds,
    state.missions.failedMissionIds, state.events.activeEventIds, state.events.resolvedEventIds,
    state.achievements.unlockedIds,
  ];
  for (const list of lists) {
    if (new Set(list).size !== list.length ||
        list.some((entry) => !validateEntityId(entry).valid)) {
      issues.push('state: ungültige oder doppelte Referenz-ID.');
      break;
    }
  }
  if (!state.world.knownDistrictIds.includes(state.world.currentDistrictId) ||
      !state.world.unlockedLocationIds.includes(state.world.currentLocationId)) {
    issues.push('state.world: aktueller Ort oder Bezirk nicht freigeschaltet.');
  }
  if (state.history.some((entry) => !isIsoTimestamp(entry.createdAt))) {
    issues.push('state.history: ungültiger UTC-Zeitstempel.');
  }
}

/** Prüft fremde Save-Daten, ohne Spielzustand zu verändern oder Code auszuführen. */
export function validateSavegame(value: unknown): SavegameValidationResult {
  const issues: string[] = [];
  try {
    if (!isRecord(value)) return { valid: false, issues: ['Savegame muss ein Objekt sein.'] };
    const keys = ['schemaVersion', 'slotId', 'savedAt', 'state'];
    for (const key of keys) if (!Object.hasOwn(value, key)) issues.push(key + ': Pflichtfeld fehlt.');
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string' || !keys.includes(key)) issues.push('Savegame: unbekanntes Feld.');
    }
    if (value.schemaVersion !== SAVEGAME_SCHEMA_VERSION) issues.push('schemaVersion: unbekannte Version.');
    if (typeof value.slotId !== 'string' || !validateEntityId(value.slotId).valid) issues.push('slotId: ungültige ID.');
    if (!isIsoTimestamp(value.savedAt)) issues.push('savedAt: ungültiger UTC-Zeitstempel.');
    checkShape(value.state, stateShape(), 'state', issues);
    if (issues.length === 0) checkSemantics(value.state as GameState, issues);
    return issues.length ? { valid: false, issues } : { valid: true, savegame: value as SavegameV1 };
  } catch {
    return { valid: false, issues: ['Savegame enthält nicht sicher lesbare Daten.'] };
  }
}
