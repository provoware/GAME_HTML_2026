export type AppScreenId =
  'start' | 'dashboard' | 'missions' | 'relationships' | 'statistics' | 'settings' | 'saves';

export type AppScreenDefinition = {
  readonly id: AppScreenId;
  readonly title: string;
  readonly description: string;
};

export const DEFAULT_SCREEN_ID: AppScreenId = 'start';

export const APP_SCREENS: readonly AppScreenDefinition[] = [
  {
    id: 'start',
    title: 'Start',
    description: 'Kampagne vorbereiten und Spielstatus prüfen.',
  },
  {
    id: 'dashboard',
    title: 'Lagebericht',
    description: 'Datum, Werte und nächste sinnvolle Aktionen überblicken.',
  },
  {
    id: 'missions',
    title: 'Missionen',
    description: 'Aufträge, Fristen und Folgen verwalten.',
  },
  {
    id: 'relationships',
    title: 'Beziehungen',
    description: 'Crew, Vertrauen und Konflikte verfolgen.',
  },
  {
    id: 'statistics',
    title: 'Statistik',
    description: 'Fortschritt, Rang und Verlaufswerte auswerten.',
  },
  {
    id: 'settings',
    title: 'Einstellungen',
    description: 'Darstellung, Audio und Bedienhilfen anpassen.',
  },
  {
    id: 'saves',
    title: 'Savegames',
    description: 'Spielstände sichern, laden, importieren und exportieren.',
  },
];

const SCREEN_BY_ID = new Map<AppScreenId, AppScreenDefinition>(
  APP_SCREENS.map((screen) => [screen.id, screen]),
);

export function isAppScreenId(value: string): value is AppScreenId {
  return SCREEN_BY_ID.has(value as AppScreenId);
}

export function resolveAppScreen(screenId: string = DEFAULT_SCREEN_ID): AppScreenDefinition {
  if (isAppScreenId(screenId)) {
    return SCREEN_BY_ID.get(screenId) ?? SCREEN_BY_ID.get(DEFAULT_SCREEN_ID)!;
  }

  return SCREEN_BY_ID.get(DEFAULT_SCREEN_ID)!;
}
