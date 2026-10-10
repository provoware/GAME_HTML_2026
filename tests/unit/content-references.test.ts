import { describe, expect, it } from 'vitest';
import { findMissingContentReferences, type ContentReferenceEntry } from
  '../../src/game/validation/content-references';

const entry = (category: ContentReferenceEntry['category'], id: string,
  value: Record<string, unknown>): ContentReferenceEntry => ({
  category, id, file: category + '/' + id + '.json', value,
});

describe('GAME-0217 – dateiübergreifende Referenzen', () => {
  it('akzeptiert vorhandene Verweise auf andere Dateien', () => {
    const entries = [
      entry('characters', 'person', { dialogueIds: ['talk'], missionIds: ['job'], eventIds: [] }),
      entry('dialogues', 'talk', { characterId: 'person', nodes: [] }),
      entry('missions', 'job', { dialogueIds: ['talk'], endStateIds: ['finish'] }),
      entry('endings', 'finish', { requiredMissionIds: ['job'], requiredAchievementIds: [], requiredEventIds: [] }),
    ];
    expect(findMissingContentReferences(entries)).toEqual([]);
  });

  it('meldet fehlende Referenzen über Kategorien hinweg mit Dateipfad und Feld', () => {
    const issues = findMissingContentReferences([
      entry('locations', 'room', { characterIds: ['ghost'], eventIds: ['absent'] }),
      entry('events', 'start', { followUpEventIds: ['unknown'] }),
    ]);
    expect(issues).toEqual([
      'events/start.json: followUpEventIds verweist auf fehlende events-ID "unknown".',
      'locations/room.json: characterIds verweist auf fehlende characters-ID "ghost".',
      'locations/room.json: eventIds verweist auf fehlende events-ID "absent".',
    ]);
  });

  it('prüft Missionsstarts und Beziehungen in verschachtelten Dialogentscheidungen', () => {
    const issues = findMissingContentReferences([
      entry('dialogues', 'talk', {
        characterId: 'person',
        nodes: [{ choices: [{
          startMissionIds: ['missing-job'],
          relationshipChanges: [{ characterId: 'missing-person' }],
        }] }],
      }),
      entry('characters', 'person', { dialogueIds: [], missionIds: [], eventIds: [] }),
    ]);
    expect(issues.join(' ')).toContain('startMissionIds verweist auf fehlende missions-ID "missing-job"');
    expect(issues.join(' ')).toContain('relationshipChanges[0].characterId verweist auf fehlende characters-ID "missing-person"');
  });

  it('verwirft keine extern verwalteten Bedingungs- und Effekt-IDs', () => {
    expect(findMissingContentReferences([
      entry('events', 'evt', { conditionIds: ['external'], effectIds: ['external'], followUpEventIds: [] }),
    ])).toEqual([]);
  });

  it('liefert unabhängig von der Eingabereihenfolge dieselben Meldungen', () => {
    const entries = [
      entry('characters', 'z', { dialogueIds: ['missing'], missionIds: [], eventIds: [] }),
      entry('events', 'a', { followUpEventIds: ['other'] }),
    ];
    expect(findMissingContentReferences(entries)).toEqual(
      findMissingContentReferences([...entries].reverse()),
    );
    expect(findMissingContentReferences(entries)).toHaveLength(2);
  });

  it('verändert Eingabedaten nicht und toleriert unvollständige Testobjekte', () => {
    const original = Object.freeze(entry('characters', 'a', Object.freeze({ dialogueIds: [] })));
    expect(findMissingContentReferences(Object.freeze([original]))).toEqual([]);
    expect(findMissingContentReferences([entry('cheats', 'c', {})])).toEqual([]);
  });
});
