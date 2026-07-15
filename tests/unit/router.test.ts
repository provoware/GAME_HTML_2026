import { describe, expect, it } from 'vitest';

import {
  APP_SCREENS,
  DEFAULT_SCREEN_ID,
  isAppScreenId,
  resolveAppScreen,
} from '../../src/app/router';

describe('app router', () => {
  it('enthält eindeutige Hauptscreen-IDs', () => {
    const ids = APP_SCREENS.map((screen) => screen.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(DEFAULT_SCREEN_ID);
  });

  it('erkennt gültige Screen-IDs', () => {
    expect(isAppScreenId('missions')).toBe(true);
    expect(isAppScreenId('unbekannt')).toBe(false);
  });

  it('löst bekannte Screens auf und fällt sonst auf Start zurück', () => {
    expect(resolveAppScreen('settings').title).toBe('Einstellungen');
    expect(resolveAppScreen('unbekannt').id).toBe(DEFAULT_SCREEN_ID);
    expect(resolveAppScreen().id).toBe(DEFAULT_SCREEN_ID);
  });
});
