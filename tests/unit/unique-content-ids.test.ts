import { describe, expect, it } from 'vitest';
import { findDuplicateContentIds } from '../../src/game/validation/unique-content-ids';

describe('GAME-0216 – globale Inhalts-ID-Eindeutigkeit', () => {
  it('akzeptiert verschiedene IDs in beliebigen Kategorien', () => {
    expect(findDuplicateContentIds([
      { id: 'character-a', file: 'characters/character-a.json' },
      { id: 'event-b', file: 'events/event-b.json' },
    ])).toEqual([]);
  });

  it('erkennt doppelte IDs über Kategorien hinweg und nennt beide Dateien', () => {
    expect(findDuplicateContentIds([
      { id: 'shared', file: 'events/shared.json' },
      { id: 'shared', file: 'characters/shared.json' },
    ])).toEqual([
      'events/shared.json: doppelte Inhalts-ID "shared" (bereits in characters/shared.json).',
    ]);
  });

  it('meldet jede weitere doppelte Datei unabhängig von der Reihenfolge', () => {
    const entries = [
      { id: 'same', file: 'missions/same.json' },
      { id: 'same', file: 'events/same.json' },
      { id: 'same', file: 'characters/same.json' },
    ];
    const expected = [
      'events/same.json: doppelte Inhalts-ID "same" (bereits in characters/same.json).',
      'missions/same.json: doppelte Inhalts-ID "same" (bereits in characters/same.json).',
    ];
    expect(findDuplicateContentIds(entries)).toEqual(expected);
    expect(findDuplicateContentIds([...entries].reverse())).toEqual(expected);
  });

  it('verändert die Eingabedaten nicht', () => {
    const entry = Object.freeze({ id: 'safe', file: 'events/safe.json' });
    const entries = Object.freeze([entry, entry]);
    expect(findDuplicateContentIds(entries)).toHaveLength(1);
    expect(entries).toEqual([entry, entry]);
  });
});
