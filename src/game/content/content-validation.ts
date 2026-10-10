import { isRecord } from '../../core/validation/runtime-validation';
import { validateAchievement } from '../achievements/achievement-schema';
import { validateCharacter } from '../characters/character-schema';
import { validateCheat } from '../cheats/cheat-schema';
import { validateDialogue } from '../dialogue/dialogue-schema';
import { validateLocation } from '../districts/location-schema';
import { validateEnding } from '../endings/ending-schema';
import { validateEvent } from '../events/event-schema';
import { validateMission } from '../missions/mission-schema';

/** Ordnername und Schema-Zuordnung für datenbasierte Spielinhalte. */
export const CONTENT_CATEGORIES = [
  'characters', 'locations', 'missions', 'events',
  'dialogues', 'achievements', 'endings', 'cheats',
] as const;
export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];

export type ContentValidationResult =
  | { readonly valid: true; readonly category: ContentCategory; readonly id: string }
  | { readonly valid: false; readonly issues: readonly string[] };

const CHARACTER_FIELDS = [
  'schemaVersion', 'id', 'name', 'role', 'districtId', 'loyalty', 'trust',
  'risk', 'skill', 'weakness', 'relationship', 'dialogueIds', 'missionIds',
  'eventIds', 'possibleEndStates',
] as const;
const LOCATION_FIELDS = [
  'schemaVersion', 'id', 'name', 'districtId', 'description',
  'accessConditionIds', 'actionIds', 'risks', 'characterIds', 'eventIds',
  'media', 'accessibilityLabel',
] as const;

/**
 * Prüft genau ein Inhaltsobjekt, bevor es in eine Spiel-Engine gelangen darf.
 * Spielübergreifende Referenzen und eindeutige IDs mehrerer Dateien sind
 * ausdrücklich GAME-0216/0217 – lokale Dialog-/Missionsreferenzen werden
 * bereits von den jeweiligen bestehenden Validatoren erkannt.
 */
export function validateContent(category: unknown, value: unknown): ContentValidationResult {
  const failed = (issues: readonly string[]): ContentValidationResult => ({ valid: false, issues });
  switch (category) {
    case 'characters': {
      const result = validateCharacter(value);
      if (!result.valid) return failed(result.issues);
      const issues = exactFields(value, CHARACTER_FIELDS, 'Figur');
      return issues.length > 0 ? failed(issues) : { valid: true, category, id: result.character.id };
    }
    case 'locations': {
      const result = validateLocation(value);
      if (!result.valid) return failed(result.issues);
      const issues = [
        ...exactFields(value, LOCATION_FIELDS, 'Ort'),
        ...exactFields(value.media, ['audioAssetPath', 'imageAssetPath'], 'Ort.media'),
      ];
      if (Array.isArray(value.risks)) {
        for (const [index, risk] of value.risks.entries()) {
          issues.push(...exactFields(risk, ['id', 'severity'], 'Ort.risks[' + index + ']'));
        }
      }
      return issues.length > 0 ? failed(issues) : { valid: true, category, id: result.location.id };
    }
    case 'missions': {
      const result = validateMission(value);
      return result.valid ? { valid: true, category, id: result.mission.id } : failed(result.issues);
    }
    case 'events': {
      const result = validateEvent(value);
      return result.valid ? { valid: true, category, id: result.event.id } : failed(result.issues);
    }
    case 'dialogues': {
      const result = validateDialogue(value);
      return result.valid ? { valid: true, category, id: result.dialogue.id } : failed(result.issues);
    }
    case 'achievements': {
      const result = validateAchievement(value);
      return result.valid ? { valid: true, category, id: result.achievement.id } : failed(result.issues);
    }
    case 'endings': {
      const result = validateEnding(value);
      return result.valid ? { valid: true, category, id: result.ending.id } : failed(result.issues);
    }
    case 'cheats': {
      const result = validateCheat(value);
      return result.valid ? { valid: true, category, id: result.cheat.id } : failed(result.issues);
    }
    default:
      return failed(['Unbekannte Inhaltskategorie: ' + String(category) + '.']);
  }
}

function exactFields(value: unknown, fields: readonly string[], label: string): string[] {
  if (!isRecord(value)) return [label + ' muss ein Objekt sein.'];
  const issues: string[] = [];
  for (const field of fields) {
    if (!Object.hasOwn(value, field)) issues.push(label + ': ' + field + ' fehlt.');
  }
  for (const field of Reflect.ownKeys(value)) {
    if (typeof field !== 'string' || !fields.includes(field)) {
      issues.push(label + ': unbekanntes Feld ' + String(field) + '.');
    }
  }
  return issues;
}
