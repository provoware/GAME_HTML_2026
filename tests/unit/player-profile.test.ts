import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PLAYER_PROFILE,
  PLAYER_PROFILE_FIELD_LIMITS,
  PLAYER_PROFILE_SCHEMA_VERSION,
  createDefaultPlayerProfile,
  getPlayerProfileFieldLimit,
} from '../../src/game/profile/player-profile';

describe('player profile schema', () => {
  it('enthält alle personalisierbaren Pflichtfelder mit Schemaversion', () => {
    expect(DEFAULT_PLAYER_PROFILE).toEqual({
      schemaVersion: PLAYER_PROFILE_SCHEMA_VERSION,
      playerName: 'PPPoppi Poppsen',
      nickname: 'Poppi',
      crewName: 'Kassettencrew',
      homeDistrict: 'startbezirk',
      favoriteSaying: 'Alles rauscht, aber wir bleiben wach.',
      fear: 'Stillstand',
      goal: 'Euronen, Ehre und ein sauberer Abgang',
      importantPerson: 'Etna Ruppen',
      shopName: 'Rumpelregal 86',
      rivalName: 'Moni Monopol',
      artistName: 'PPPoppi',
      secretWord: 'amber',
    });
  });

  it('definiert für jedes Eingabefeld eine positive Zeichenbegrenzung', () => {
    const profileFields = Object.keys(DEFAULT_PLAYER_PROFILE).filter(
      (field) => field !== 'schemaVersion',
    );

    expect(Object.keys(PLAYER_PROFILE_FIELD_LIMITS).sort()).toEqual(profileFields.sort());
    expect(getPlayerProfileFieldLimit('favoriteSaying')).toBe(120);
    expect(Object.values(PLAYER_PROFILE_FIELD_LIMITS).every((limit) => limit > 0)).toBe(true);
  });

  it('erzeugt unabhängige Profilobjekte für neue Spielstände', () => {
    const firstProfile = createDefaultPlayerProfile();
    const secondProfile = createDefaultPlayerProfile();

    expect(firstProfile).toEqual(secondProfile);
    expect(firstProfile).not.toBe(secondProfile);
  });
});
