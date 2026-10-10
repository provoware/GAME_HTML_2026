import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../../src/game/state/game-state';
import { SAVEGAME_SCHEMA_VERSION, SAVEGAME_MAX_COLLECTION_LENGTH, validateSavegame } from '../../src/game/save/savegame-schema';

function createSave(): Record<string, unknown> {
  return {
    ...createInitialGameState(),
    createdAt: '1986-01-01T00:00:00.000Z',
    updatedAt: '1986-01-01T12:00:00.000Z',
    checksum: 'a'.repeat(64),
  };
}
function checkInvalid(value: unknown, expected: string): void {
  const result = validateSavegame(value);
  expect(result.valid).toBe(false);
  if (!result.valid) expect(result.issues.join(' ')).toContain(expected);
}
function modified(field: string, value: unknown): Record<string, unknown> {
  const save = createSave();
  save[field] = value;
  return save;
}
function nested(field: string, value: unknown): Record<string, unknown> {
  return { ...createSave(), ...{ [field]: value } };
}
function mutateSection(name: string, change: (o: Record<string, unknown>) => void): Record<string, unknown> {
  const save = createSave();
  const obj = structuredClone(save[name]) as Record<string, unknown>;
  change(obj);
  save[name] = obj;
  return save;
}

describe('GAME-0213 – versioniertes Savegame-Schema', () => {
  it('akzeptiert einen vollständigen unveränderten Startspielstand mit Versions- und Zeitmetadaten', () => {
    const save = createSave();
    expect(save.schemaVersion).toBe(SAVEGAME_SCHEMA_VERSION);
    expect(validateSavegame(save)).toEqual({ valid: true, savegame: save });
  });

  it('ist für JSON-Rundreise geeignet, ohne Speichern/Laden auszuführen', () => {
    const save = createSave();
    const parsed: unknown = JSON.parse(JSON.stringify(save));
    expect(validateSavegame(parsed)).toEqual({ valid: true, savegame: parsed });
  });

  it('meldet unbrauchbare Hauptwerte ohne Ausnahme', () => {
    for (const value of [null, undefined, false, 1, 'bad json', [], Number.NaN]) {
      checkInvalid(value, 'Savegame muss ein Objekt sein.');
    }
  });

  it('erkennt fehlende, geerbte, unbekannte und symbolische Pflichtfelder', () => {
    const missing = createSave();
    delete missing.world;
    checkInvalid(missing, 'world fehlt');
    const inherited = Object.assign(Object.create({ checksum: 'a'.repeat(64) }), createSave());
    delete inherited.checksum;
    checkInvalid(inherited, 'checksum fehlt');
    checkInvalid({ ...createSave(), executableCode: 'alert(1)' }, 'unbekanntes Feld');
    checkInvalid({ ...createSave(), [Symbol('hidden')]: true }, 'unbekanntes Feld');
  });

  it('weist inkompatible Schema- und Spielversionen ausdrücklich zurück', () => {
    for (const version of [0, 2, '1', null]) checkInvalid(modified('schemaVersion', version), 'schemaVersion ist inkompatibel');
    for (const version of ['unknown', '', '1.0', 10, '1.0.0'.repeat(30)]) {
      checkInvalid(modified('gameVersion', version), 'gameVersion');
    }
    checkInvalid(mutateSection('profile', o => { o.schemaVersion = 2; }), 'profile.schemaVersion');
    checkInvalid(mutateSection('economy', o => { o.schemaVersion = 2; }), 'economy.schemaVersion');
    checkInvalid(mutateSection('world', o => { o.schemaVersion = 2; }), 'world.schemaVersion');
  });

  it('validiert Zeitstempel und zeitliche Reihenfolge', () => {
    checkInvalid(modified('createdAt', '1986-01-01'), 'createdAt muss');
    checkInvalid(modified('updatedAt', 'invalid'), 'updatedAt muss');
    checkInvalid(modified('updatedAt', '1985-12-31T23:00:00.000Z'), 'updatedAt darf nicht vor');
    expect(validateSavegame(modified('updatedAt', '1986-01-01T00:00:00.000Z')).valid).toBe(true);
  });

  it('prüft das SHA-256-Hex-Format ohne fälschlich Inhaltsintegrität zu behaupten', () => {
    for (const checksum of ['', 'b'.repeat(63), 'B'.repeat(64), 'g'.repeat(64), null, 123]) {
      checkInvalid(modified('checksum', checksum), 'checksum muss');
    }
    expect(validateSavegame(modified('checksum', 'f'.repeat(64))).valid).toBe(true);
  });

  it('validiert Spielstatus, Modus und Kampagnenlänge', () => {
    for (const status of ['paused', '', 1]) checkInvalid(modified('status', status), 'status');
    for (const mode of ['debug', 'CLASSIC', false]) checkInvalid(modified('mode', mode), 'mode');
    for (const length of [0, 13, 48, '12']) checkInvalid(modified('campaignLengthMonths', length), 'campaignLengthMonths');
    for (const length of [12, 24, 36, 'endless']) {
      expect(validateSavegame(modified('campaignLengthMonths', length)).valid).toBe(true);
    }
  });

  it('validiert Kalenderbereiche, fehlende Felder und unzulässige Extras', () => {
    for (const [key, v] of [['day', 0], ['day', 32], ['week', 54], ['month', 0], ['year', 1987], ['actionPoints', -1], ['actionPoints', 101], ['day', 2.4]] as const) {
      checkInvalid(mutateSection('calendar', o => { o[key] = v; }), 'calendar.' + key);
    }
    checkInvalid(mutateSection('calendar', o => { delete o.month; }), 'month fehlt');
    checkInvalid(mutateSection('calendar', o => { o.untrusted = 1; }), 'unbekanntes Feld');
  });

  it('lehnt fehlerhafte, fehlende und zu lange Profilwerte ab', () => {
    checkInvalid(mutateSection('profile', o => { o.playerName = '  '; }), 'profile.playerName');
    checkInvalid(mutateSection('profile', o => { o.secretWord = 'x'.repeat(33); }), 'profile.secretWord');
    checkInvalid(mutateSection('profile', o => { delete o.nickname; }), 'nickname fehlt');
    checkInvalid(mutateSection('profile', o => { o.injected = 'malicious'; }), 'unbekanntes Feld');
  });

  it('erzwingt normalisierte Spielerwerte, ganzzahligen Rang und XP', () => {
    for (const [field, bad] of [
      ['reputation', -1], ['energy', 101], ['heat', 1.5], ['rank', 0],
      ['rank', 101], ['xp', -1], ['xp', 2.5], ['xp', Number.MAX_SAFE_INTEGER + 1],
    ] as const) {
      checkInvalid(mutateSection('player', o => { o[field] = bad; }), 'player.' + field);
    }
    expect(validateSavegame(mutateSection('player', o => { o.xp = Number.MAX_SAFE_INTEGER; o.rank = 100; })).valid).toBe(true);
  });

  it('weist ungültige Geldbeträge, Zinsen und Buchungsdaten ab', () => {
    for (const [field, bad] of [
      ['cash', -1], ['savings', NaN], ['debt', 1.1], ['fixedCosts', Infinity],
      ['monthlyWage', '500'], ['savingsInterestRateBasisPoints', -1],
      ['debtInterestRateBasisPoints', 100001],
    ] as const) {
      checkInvalid(mutateSection('economy', o => { o[field] = bad; }), 'economy.' + field);
    }
    checkInvalid(mutateSection('economy', o => { o.ledger = { earned: -1, spent: 0 }; }), 'economy.ledger.earned');
    checkInvalid(mutateSection('economy', o => { o.ledger = { earned: 0, spent: 0, extra: 1 }; }), 'unbekanntes Feld');
  });

  it('weist ungültige Welt-IDs, doppelte Orte und widersprüchliche Ortslisten ab', () => {
    checkInvalid(mutateSection('world', o => { o.currentDistrictId = 'BAD ID'; }), 'world.currentDistrictId');
    checkInvalid(mutateSection('world', o => { o.knownDistrictIds = []; }), 'world.knownDistrictIds');
    checkInvalid(mutateSection('world', o => { o.currentDistrictId = 'other-district'; }), 'world.currentDistrictId muss');
    checkInvalid(mutateSection('world', o => { o.currentLocationId = 'other-location'; }), 'world.currentLocationId muss');
    checkInvalid(mutateSection('world', o => { o.unlockedLocationIds = ['bunkerclub', 'bunkerclub']; }), 'world.unlockedLocationIds');
    checkInvalid(mutateSection('world', o => { o.lockedLocationIds = ['bunkerclub']; }), 'darf keine ID in mehreren Listen');
    checkInvalid(mutateSection('world', o => { o.unknown = true; }), 'unbekanntes Feld');
  });

  it('prüft Weltflaggen und Gerüchte einschließlich Doppel-IDs und Grenzwerten', () => {
    checkInvalid(mutateSection('world', o => { o.flags = [{ id: 'flag-a', active: 'true', updatedTurn: 0 }]; }), 'world.flags[0].active');
    checkInvalid(mutateSection('world', o => { o.flags = [{ id: 'flag-a', active: true, updatedTurn: -1 }]; }), 'world.flags[0].updatedTurn');
    checkInvalid(mutateSection('world', o => { o.flags = [{ id: 'flag-a', active: true, updatedTurn: 0 }, { id: 'flag-a', active: false, updatedTurn: 1 }]; }), 'doppelte id');
    checkInvalid(mutateSection('world', o => { o.rumors = [{ id: 'rumor-a', text: '   ', discoveredTurn: 0 }]; }), 'world.rumors[0].text');
    checkInvalid(mutateSection('world', o => { o.rumors = [{ id: 'rumor-a', text: 'Etwas', discoveredTurn: 2, code: 1 }]; }), 'unbekanntes Feld');
  });

  it('verhindert doppelte oder widersprüchliche Missions- und Ereignis-IDs', () => {
    checkInvalid(mutateSection('missions', o => { o.activeMissionIds = ['mission-a', 'mission-a']; }), 'missions.activeMissionIds');
    checkInvalid(mutateSection('missions', o => { o.activeMissionIds = ['mission-a']; o.completedMissionIds = ['mission-a']; }), 'missions darf keine ID');
    checkInvalid(mutateSection('events', o => { o.activeEventIds = ['event-a']; o.resolvedEventIds = ['event-a']; }), 'events darf keine ID');
    checkInvalid(mutateSection('events', o => { o.activeEventIds = ['BAD']; }), 'events.activeEventIds');
  });

  it('schützt Beziehungen, Erfolge und Einstellungen', () => {
    const save = createSave();
    const relation = (save.relationships as Array<Record<string, unknown>>)[0];
    if (relation === undefined) throw new Error('Testzustand ohne Beziehung');
    relation.trust = 101;
    checkInvalid(save, 'relationships[0].trust');
    checkInvalid(mutateSection('relationships', o => { o.extra = 1; }), 'relationships muss ein Objekt sein.');
    checkInvalid(nested('relationships', [
      { characterId: 'etna-ruppen', loyalty: 50, trust: 50 },
      { characterId: 'etna-ruppen', loyalty: 30, trust: 40 },
    ]), 'doppelte characterId');
    checkInvalid(mutateSection('achievements', o => { o.unlockedIds = ['bad ID']; }), 'achievements.unlockedIds');
    checkInvalid(mutateSection('achievements', o => { o.restrictedByCheats = 'false'; }), 'achievements.restrictedByCheats');
    checkInvalid(mutateSection('settings', o => { o.theme = 'injected-theme'; }), 'settings.theme');
    checkInvalid(mutateSection('settings', o => { o.audioEnabled = 1; }), 'settings.audioEnabled');
  });

  it('sichert den Zufalls-Seed, die getrennten Streams und deren Grenzen ab', () => {
    checkInvalid(mutateSection('rng', o => { o.seed = ''; }), 'rng.seed');
    checkInvalid(mutateSection('rng', o => { o.eventStream = 'x'.repeat(257); }), 'rng.eventStream');
    checkInvalid(mutateSection('rng', o => { delete o.uiStream; }), 'uiStream fehlt');
    checkInvalid(mutateSection('rng', o => { o.script = 'eval()'; }), 'unbekanntes Feld');
  });

  it('weist beschädigte oder nicht chronologische Protokolle zurück', () => {
    checkInvalid(modified('history', []), 'history muss');
    checkInvalid(modified('history', [{ turn: -1, message: 'x', createdAt: '1986-01-01T00:00:00.000Z' }]), 'history[0].turn');
    checkInvalid(modified('history', [{ turn: 0, message: ' ', createdAt: '1986-01-01T00:00:00.000Z' }]), 'history[0].message');
    checkInvalid(modified('history', [{ turn: 0, message: 'ok', createdAt: 'yesterday' }]), 'history[0].createdAt');
    checkInvalid(modified('history', [
      { turn: 2, message: 'first', createdAt: '1986-01-01T00:00:00.000Z' },
      { turn: 1, message: 'second', createdAt: '1986-01-01T00:00:00.000Z' },
    ]), 'darf nicht rückwärts laufen');
    expect(validateSavegame(modified('history', [
      { turn: 0, message: 'first', createdAt: '1986-01-01T00:00:00.000Z' },
      { turn: 0, message: 'second', createdAt: '1986-01-01T00:00:01.000Z' },
    ])).valid).toBe(true);
  });

  it('limitiert das Datenvolumen in allen großen ID- und Objektlisten', () => {
    const tooLarge = Array(SAVEGAME_MAX_COLLECTION_LENGTH + 1).fill('loc-a');
    checkInvalid(mutateSection('world', o => { o.visitedLocationIds = tooLarge; }), 'world.visitedLocationIds');
    checkInvalid(modified('history', Array(SAVEGAME_MAX_COLLECTION_LENGTH + 1).fill(null)), 'history muss');
    checkInvalid(modified('relationships', Array(SAVEGAME_MAX_COLLECTION_LENGTH + 1).fill(null)), 'relationships muss');
  });

  it('sammelt mehrere Fehler und verändert keine Eingabedaten', () => {
    const save = createSave();
    save.schemaVersion = 99;
    save.updatedAt = 'invalid';
    save.checksum = 'bad';
    save.player = { ...save.player as object, rank: -1 };
    const original = JSON.stringify(save);
    const result = validateSavegame(save);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues.length).toBeGreaterThanOrEqual(4);
    expect(JSON.stringify(save)).toBe(original);
  });
});
